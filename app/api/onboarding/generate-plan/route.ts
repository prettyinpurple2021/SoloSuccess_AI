
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { goals, tasks, briefcases } from '@/db/schema';
import { onboardingAI } from '@/services/onboarding-ai';
import { ApiError, handleApiError, successResponse } from '@/lib/api-utils';
import { logInfo, logError } from '@/lib/logger';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new ApiError('Unauthorized', 401);
    }

    const body = await req.json();

    const schema = z.object({
      personalInfo: z.object({
        name: z.string(),
        businessType: z.string(),
      }),
      goals: z.object({
        primaryGoals: z.array(z.string()),
      }),
    });

    const validation = schema.safeParse(body);

    if (!validation.success) {
      throw new ApiError('Invalid onboarding data', 400);
    }

    const { personalInfo, goals: userGoals } = validation.data;

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
