import { logger, logError, logWarn, logInfo, logDebug, logApi, logDb, logAuth } from '@/lib/logger'
import { NextRequest, NextResponse} from 'next/server'
import { neon} from '@neondatabase/serverless'
import * as jose from 'jose'

// Edge runtime enabled after refactoring to jose and Neon HTTP
export const runtime = 'edge'



function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  return neon(url)
}

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Authentication helper - supports both JWT tokens and Better Auth sessions
async function authenticateRequest(request: NextRequest) {
  try {
    // Try JWT token first (from Authorization header or auth_token cookie)
    const authHeader = request.headers.get('authorization')
    const cookieToken = request.cookies.get('auth_token')?.value
    
    let token: string | null = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else if (cookieToken) {
      token = cookieToken
    }
    
    // If we have a JWT token, verify it
    if (token) {
      if (!process.env.JWT_SECRET) {
        logError('Dashboard API: JWT_SECRET is not set')
        return { user: null, error: 'JWT secret not configured' }
      }
      
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
        const { payload: decoded } = await jose.jwtVerify(token, secret)
        logInfo('Dashboard API: JWT token verified successfully', { userId: decoded.userId })
        
        return { 
          user: {
            id: decoded.userId as string,
            email: decoded.email as string,
            full_name: (decoded.full_name as string) || null,
            avatar_url: null,
            subscription_tier: 'free',
            level: 1,
            total_points: 0,
            current_streak: 0,
            wellness_score: 50,
            focus_minutes: 0,
            onboarding_completed: false
          }, 
          error: null 
        }
      } catch (jwtError) {
        // JWT verification failed, try Better Auth session
        logInfo('Dashboard API: JWT verification failed, trying Better Auth session')
      }
    }
    
    // Try Better Auth session (check for NextAuth session cookie)
    const nextAuthSessionCookie = request.cookies.get('authjs.session-token')?.value || 
                                   request.cookies.get('__Secure-authjs.session-token')?.value
    
    if (nextAuthSessionCookie) {
      // For Better Auth, we need to get user from database using session
      // Since we're in Edge runtime, we'll fetch user from the session API
      try {
        const sessionResponse = await fetch(`${request.nextUrl.origin}/api/auth/session`, {
          headers: {
            'Cookie': request.headers.get('cookie') || '',
          },
        })
        
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json()
          if (sessionData?.user?.id) {
            logInfo('Dashboard API: Better Auth session verified successfully', { userId: sessionData.user.id })
            return {
              user: {
                id: sessionData.user.id,
                email: sessionData.user.email || '',
                full_name: sessionData.user.full_name || sessionData.user.name || null,
                avatar_url: sessionData.user.avatar_url || sessionData.user.image || null,
                subscription_tier: sessionData.user.subscription_tier || 'free',
                level: 1,
                total_points: 0,
                current_streak: 0,
                wellness_score: 50,
                focus_minutes: 0,
                onboarding_completed: sessionData.user.onboarding_completed || false
              },
              error: null
            }
          }
        }
      } catch (sessionError) {
        logInfo('Dashboard API: Better Auth session check failed', { error: sessionError })
      }
    }
    
    // No valid authentication found
    logError('Dashboard API: No authorization token or session found')
    return { user: null, error: 'No authorization found' }
  } catch (error) {
    logError('Dashboard API: Authentication error:', error instanceof Error ? error : undefined)
    return { user: null, error: 'Authentication failed' }
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate the request (JWT)
    const { user, error } = await authenticateRequest(request)
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user data from database or create if doesn't exist
    const sql = getSql()
    
    // Use the user ID directly
    let dbUserId = user.id

    // First, try to get existing user data by ID
    let userData = await sql`
      SELECT id, email, full_name, avatar_url, subscription_tier, subscription_status, stripe_customer_id, stripe_subscription_id, current_period_start, current_period_end, cancel_at_period_end, is_verified, created_at, updated_at
      FROM users 
      WHERE id = ${dbUserId}
    `

    let dbUser = userData[0]

    // If not found by ID, try by email
    if (!dbUser && user.email) {
      const emailUserData = await sql`
        SELECT id, email, full_name, avatar_url, subscription_tier, subscription_status, stripe_customer_id, stripe_subscription_id, current_period_start, current_period_end, cancel_at_period_end, is_verified, created_at, updated_at
        FROM users 
        WHERE email = ${user.email}
      `
      dbUser = emailUserData[0]
      if (dbUser) {
        // Update the dbUserId to match the existing user's ID
        dbUserId = dbUser.id
        logInfo('Found user by email, updating dbUserId', { oldId: user.id, newId: dbUserId, email: user.email })
      }
    }

    // If user doesn't exist in database, create them (with conflict handling)
    if (!dbUser) {
      try {
        const newUser = await sql`
          INSERT INTO users (id, email, full_name, avatar_url, subscription_tier, subscription_status, cancel_at_period_end, is_verified, created_at, updated_at)
          VALUES (${dbUserId}, ${user.email}, ${user.full_name}, ${user.avatar_url}, 'launch', 'active', false, false, NOW(), NOW())
          RETURNING id, email, full_name, avatar_url, subscription_tier, subscription_status, stripe_customer_id, stripe_subscription_id, current_period_start, current_period_end, cancel_at_period_end, is_verified, created_at, updated_at
        `
        dbUser = newUser[0]
      } catch (insertError: any) {
        // Handle duplicate key constraint - user might have been created by another request
        if (insertError?.code === '23505' && insertError?.constraint === 'users_email_key') {
          logInfo('User already exists, fetching existing user', { email: user.email })
          // Fetch the existing user
          const existingUser = await sql`
            SELECT id, email, full_name, avatar_url, subscription_tier, subscription_status, stripe_customer_id, stripe_subscription_id, current_period_start, current_period_end, cancel_at_period_end, is_verified, created_at, updated_at
            FROM users 
            WHERE email = ${user.email}
          `
          dbUser = existingUser[0]
        } else {
          throw insertError // Re-throw if it's a different error
        }
      }
    }

    // Get basic data from existing tables
    // PERFORMANCE OPTIMIZATION: Execute all queries in parallel using Promise.allSettled
    // This reduces total query time from ~N queries sequential to single parallel batch
    let todaysStatsRes: any, todaysTasksRes: any, activeGoalsRes: any, conversationsRes: any, achievementsRes: any, weeklyFocusRes: any, briefcasesRes: any, userStatsRes: any;
    
    const defaultUserStats = [{ 
      total_tasks_completed: 0, 
      total_tasks: 0, 
      tasks_completed_today: 0,
      goals_achieved: 0, 
      ai_interactions: 0, 
      total_focus_minutes: 0,
      user_level: 1,
      total_points: 0,
      current_streak: 0,
      wellness_score: 50
    }];
    const defaultTodaysStats = [{ tasks_completed: 0, total_tasks: 0, focus_minutes: 0, ai_interactions: 0, goals_achieved: 0, productivity_score: 0 }];
    const defaultWeeklyFocus = [{ total_minutes: 0, sessions_count: 0, average_session: 0 }];

    // Execute all database queries in parallel for maximum performance
    const results = await Promise.allSettled([
      // Query 1: User stats
      sql`
        SELECT 
          COALESCE(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END), 0) AS total_tasks_completed,
          COALESCE(COUNT(DISTINCT t.id), 0) AS total_tasks,
          COALESCE(SUM(CASE WHEN t.status = 'completed' AND DATE(t.updated_at) = CURRENT_DATE THEN 1 ELSE 0 END), 0) AS tasks_completed_today,
          COALESCE(COUNT(DISTINCT CASE WHEN g.status = 'completed' THEN g.id END), 0) AS goals_achieved,
          COALESCE(COUNT(DISTINCT c.id), 0) AS ai_interactions,
          COALESCE(SUM(CASE WHEN t.estimated_minutes IS NOT NULL THEN t.estimated_minutes ELSE 0 END), 0) AS total_focus_minutes,
          GREATEST(1, FLOOR(COALESCE(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END), 0) / 10) + 1) AS user_level,
          (COALESCE(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END), 0) * 10) + 
          (COALESCE(COUNT(DISTINCT CASE WHEN g.status = 'completed' THEN g.id END), 0) * 50) AS total_points,
          COALESCE((
            SELECT COUNT(DISTINCT DATE(updated_at))
            FROM tasks 
            WHERE user_id = ${dbUserId} 
              AND status = 'completed' 
              AND updated_at >= CURRENT_DATE - INTERVAL '30 days'
          ), 0) AS current_streak,
          LEAST(100, GREATEST(0, 
            CASE 
              WHEN COUNT(DISTINCT t.id) = 0 THEN 50
              ELSE ROUND(
                (COALESCE(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END), 0)::FLOAT / 
                 NULLIF(COUNT(DISTINCT t.id), 0)) * 100
              )
            END
          )) AS wellness_score
        FROM users u
        LEFT JOIN tasks t ON u.id = t.user_id
        LEFT JOIN goals g ON u.id = g.user_id
        LEFT JOIN conversations c ON u.id = c.user_id
        WHERE u.id = ${dbUserId}
      `,
      
      // Query 2: Today's stats (optimized - removed subqueries)
      sql`
        SELECT 
            COALESCE(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END),0) AS tasks_completed,
            COUNT(t.id) AS total_tasks,
            COALESCE(SUM(CASE WHEN fs.duration_minutes IS NOT NULL THEN fs.duration_minutes ELSE 0 END), 0) AS focus_minutes,
            COALESCE(COUNT(DISTINCT c.id), 0) AS ai_interactions,
            COALESCE(COUNT(DISTINCT CASE WHEN g.status = 'completed' THEN g.id END), 0) AS goals_achieved,
            CASE 
              WHEN COUNT(t.id) = 0 THEN 0
              ELSE ROUND(
                (COALESCE(SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END), 0)::FLOAT / 
                 COUNT(t.id)) * 100
              )
            END AS productivity_score
         FROM tasks t
         LEFT JOIN focus_sessions fs ON t.user_id = fs.user_id AND DATE(fs.started_at) = CURRENT_DATE
         LEFT JOIN conversations c ON t.user_id = c.user_id AND DATE(c.last_message_at) = CURRENT_DATE
         LEFT JOIN goals g ON t.user_id = g.user_id AND g.status = 'completed' AND DATE(g.updated_at) = CURRENT_DATE
         WHERE t.user_id = ${dbUserId} AND DATE(t.updated_at) = CURRENT_DATE
      `,
      
      // Query 3: Today's tasks
      sql`
        SELECT t.id, t.title, t.description, t.status, t.priority, t.due_date,
               g.title as goal_title, g.id as goal_id
           FROM tasks t
           LEFT JOIN goals g ON t.goal_id = g.id
          WHERE t.user_id = ${dbUserId}
          ORDER BY COALESCE(t.due_date, NOW()) ASC
          LIMIT 10
      `,
      
      // Query 4: Briefcases
      sql`
        SELECT 
          b.id, b.title, b.description, b.status, b.metadata,
          b.created_at, b.updated_at,
          COUNT(DISTINCT g.id) as goal_count,
          COUNT(DISTINCT t.id) as task_count
        FROM briefcases b
        LEFT JOIN goals g ON b.id = g.briefcase_id
        LEFT JOIN tasks t ON b.id = t.briefcase_id
        WHERE b.user_id = ${dbUserId}
        GROUP BY b.id, b.title, b.description, b.status, b.metadata, b.created_at, b.updated_at
        ORDER BY b.updated_at DESC
        LIMIT 6
      `,
      
      // Query 5: Active goals
      sql`
        SELECT 
          g.id, g.title, g.description, g.target_date, g.category, g.status,
          COALESCE(
            ROUND(
              (COUNT(CASE WHEN t.status = 'completed' THEN 1 END)::FLOAT / 
               NULLIF(COUNT(t.id), 0)) * 100
            ), 0
          ) AS progress_percentage,
          COUNT(t.id) AS tasks_total,
          COUNT(CASE WHEN t.status = 'completed' THEN 1 END) AS tasks_completed
        FROM goals g
        LEFT JOIN tasks t ON g.id = t.goal_id
        WHERE g.user_id = ${dbUserId} AND g.status = 'active'
        GROUP BY g.id, g.title, g.description, g.target_date, g.category, g.status
        ORDER BY g.updated_at DESC
        LIMIT 5
      `,
      
      // Query 6: Recent conversations
      sql`
        SELECT 
          c.id, c.title, c.last_message_at,
          a.name, a.display_name, a.accent_color
        FROM conversations c
        LEFT JOIN agents a ON c.agent_id = a.id
        WHERE c.user_id = ${dbUserId}
        ORDER BY c.last_message_at DESC
        LIMIT 5
      `,
      
      // Query 7: Recent achievements
      sql`
        SELECT 
          ua.id, ua.earned_at,
          a.name, a.title, a.description, a.icon, a.points
        FROM user_achievements ua
        LEFT JOIN achievements a ON ua.achievement_id = a.id
        WHERE ua.user_id = ${dbUserId}
        ORDER BY ua.earned_at DESC
        LIMIT 5
      `,
      
      // Query 8: Weekly focus sessions
      sql`
        SELECT 
          COALESCE(SUM(duration_minutes), 0) AS total_minutes,
          COUNT(*) AS sessions_count,
          CASE 
            WHEN COUNT(*) = 0 THEN 0
            ELSE ROUND(AVG(duration_minutes), 1)
          END AS average_session
        FROM focus_sessions 
        WHERE user_id = ${dbUserId} 
          AND started_at >= CURRENT_DATE - INTERVAL '7 days'
      `
    ])

    // Extract results with fallbacks
    userStatsRes = results[0].status === 'fulfilled' ? results[0].value : defaultUserStats
    todaysStatsRes = results[1].status === 'fulfilled' ? results[1].value : defaultTodaysStats
    todaysTasksRes = results[2].status === 'fulfilled' ? results[2].value : []
    briefcasesRes = results[3].status === 'fulfilled' ? results[3].value : []
    activeGoalsRes = results[4].status === 'fulfilled' ? results[4].value : []
    conversationsRes = results[5].status === 'fulfilled' ? results[5].value : []
    achievementsRes = results[6].status === 'fulfilled' ? results[6].value : []
    weeklyFocusRes = results[7].status === 'fulfilled' ? results[7].value : defaultWeeklyFocus

    const todaysStatsRow = todaysStatsRes[0] || {
      tasks_completed: 0,
      total_tasks: 0,
      focus_minutes: 0,
      ai_interactions: 0,
      goals_achieved: 0,
      productivity_score: 0,
    }

    const todaysTasks = todaysTasksRes.map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      status: r.status,
      priority: r.priority,
      due_date: r.due_date,
      goal: r.goal_title ? { title: r.goal_title, id: r.goal_id } : null,
    }))

    const activeGoals = activeGoalsRes.map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      progress_percentage: r.progress_percentage,
      target_date: r.target_date,
      category: r.category,
      tasks_total: r.tasks_total,
      tasks_completed: r.tasks_completed,
    }))

    const recentConversations = conversationsRes.map((r: any) => ({
      id: r.id,
      title: null,
      last_message_at: r.last_message_at,
      agent: { name: r.name, display_name: r.display_name, accent_color: r.accent_color },
    }))

    const recentAchievements = achievementsRes.map((r: any) => ({
      id: r.id,
      earned_at: r.earned_at,
      achievement: { name: r.name, title: r.title, description: r.description, icon: r.icon, points: r.points },
    }))

    const weeklyFocusRow = weeklyFocusRes[0] || { total_minutes: 0, sessions_count: 0, average_session: 0 }

    // Transform briefcases data
    const recentBriefcases = briefcasesRes.map((b: any) => ({
      id: b.id,
      title: b.title,
      description: b.description,
      status: b.status,
      goal_count: parseInt(b.goal_count),
      task_count: parseInt(b.task_count),
      created_at: b.created_at,
      updated_at: b.updated_at,
    }))

    // Get real user stats from database
    const userStats = (userStatsRes?.[0] as any) || {
      total_tasks_completed: 0,
      total_tasks: 0,
      tasks_completed_today: 0,
      goals_achieved: 0,
      ai_interactions: 0,
      total_focus_minutes: 0,
      user_level: 1,
      total_points: 0,
      current_streak: 0,
      wellness_score: 50
    };

    // Generate dynamic insights
    const insights = [];

    // Welcome Insight
    if (todaysTasks.length === 0 && recentBriefcases.length === 0) {
      insights.push({
        type: 'welcome',
        title: 'Welcome to SoloSuccess AI!',
        description: 'Start by creating your first briefcase (project) to get organized.',
        action: 'Create Briefcase'
      });
    }

    // Streak Insight
    if (userStats.current_streak >= 3) {
      insights.push({
        type: 'streak',
        title: `You're on fire! 🔥`,
        description: `You've maintained a ${userStats.current_streak} day streak. Keep it up!`,
        action: 'View Progress'
      });
    }

    // Productivity Insight
    const productivityScore = todaysStatsRow.productivity_score || 0;
    if (productivityScore > 0 && productivityScore < 50 && todaysTasks.length > 0) {
      insights.push({
        type: 'productivity',
        title: 'Need a boost?',
        description: 'Your productivity score is low today. Try a Focus Session to get back on track.',
        action: 'Start Focus Session'
      });
    } else if (productivityScore >= 90) {
      insights.push({
        type: 'productivity',
        title: 'Outstanding Performance! 🌟',
        description: 'You are crushing your tasks today. Excellent work!',
        action: 'View Analytics'
      });
    }

    // Goal Insight
    const nearCompletionGoal = activeGoals.find((g: any) => g.progress_percentage >= 80 && g.progress_percentage < 100);
    if (nearCompletionGoal) {
      insights.push({
        type: 'goal',
        title: 'Almost there!',
        description: `You are close to completing "${nearCompletionGoal.title}". Finish strong!`,
        action: `View Goal`
      });
    }



    const responseData = {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        full_name: dbUser.full_name || user.full_name || null,
        avatar_url: dbUser.avatar_url || user.avatar_url || null,
        subscription_tier: dbUser.subscription_tier || 'free',
        level: userStats.user_level, // Real level based on completed tasks
        total_points: userStats.total_points, // Real points based on achievements
        current_streak: userStats.current_streak, // Real streak based on activity
        wellness_score: userStats.wellness_score, // Real wellness score based on completion rate
        focus_minutes: userStats.total_focus_minutes, // Real focus minutes from tasks
        onboarding_completed: dbUser.onboarding_completed || false, // Real onboarding status
      },
      todaysStats: todaysStatsRow,
      todaysTasks,
      activeGoals,
      recentConversations,
      recentAchievements,
      recentBriefcases,
      weeklyFocus: weeklyFocusRow,
      insights,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    logError('Dashboard API error:', error instanceof Error ? error : undefined)
    logError('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
      { status: 500 }
    )
  }
}
