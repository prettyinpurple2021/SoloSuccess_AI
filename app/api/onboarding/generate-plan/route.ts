
import { auth } from '@/auth';
import { db } from '@/db';
import { goals, tasks, briefcases } from '@/db/schema';
import { onboardingAI } from '@/src/services/onboarding-ai';
import { ApiError, handleApiError, successResponse } from '@/lib/api-utils';
import { logInfo, logError } from '@/lib/logger';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new ApiError('Unauthorized', 401);
    }

    const { personalInfo, goals: userGoals } = await req.json();

    if (!personalInfo || !userGoals) {
      throw new ApiError('Missing onboarding data', 400);
    }

    const userId = session.user.id;

    // 1. Generate the AI Roadmap
    const launchPlan = await onboardingAI.generateLaunchPlan({
      name: personalInfo.name,
      businessType: personalInfo.businessType,
      goals: userGoals.primaryGoals
    });

    logInfo('AI Roadmap Generated', { userId, phases: launchPlan.roadmap.length });

    // 2. Save detailed roadmap to DB
    // First, verify or create a default "Launch Mission" briefcase
    let briefcaseId: string;
    
    // Simple check for existing briefcase, or just create new one
    const newBriefcase = {
      id: uuidv4(),
      user_id: userId,
      title: 'Empire Launch Mission',
      description: 'Your AI-generated roadmap to launch your business.',
      status: 'active'
    };
    
    await db.insert(briefcases).values(newBriefcase);
    briefcaseId = newBriefcase.id;

    // 3. Create Goals (Phases) and Tasks
    const dbOperations = [];

    // Create Goals for each Phase
    for (const phase of launchPlan.roadmap) {
      const goalId = uuidv4();
      const goalDueDate = new Date();
      // Heuristic: Set due date 7 days * phase index from now
      // Assuming phases are Week 1, Week 2...
      const weekIndex = launchPlan.roadmap.indexOf(phase);
      goalDueDate.setDate(goalDueDate.getDate() + (7 * (weekIndex + 1)));

      dbOperations.push(
        db.insert(goals).values({
          id: goalId,
          user_id: userId,
          briefcase_id: briefcaseId,
          title: phase.phaseName,
          status: 'pending',
          priority: 'high',
          due_date: goalDueDate
        })
      );

      // Create Tasks for this Goal
      for (const task of phase.tasks) {
        dbOperations.push(
          db.insert(tasks).values({
            id: uuidv4(),
            user_id: userId,
            goal_id: goalId,
            briefcase_id: briefcaseId,
            title: task.title,
            description: task.description,
            status: 'pending',
            priority: 'medium',
            estimated_minutes: task.estimatedMinutes
          })
        );
      }
    }

    // Execute all inserts
    await Promise.all(dbOperations);

    return successResponse({
      message: 'Empire Roadmap generated successfully',
      briefcaseId,
      roadmap: launchPlan
    });

  } catch (error) {
    return handleApiError(error);
  }
}
