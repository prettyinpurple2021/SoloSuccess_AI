
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tasks, goals, users } from '@/db/schema';
import { auth } from '@/lib/auth';
import { eq, sql, count, sum } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { metric, filters } = body;

    // Basic query builder logic (simplified for batch 4)
    // Supports: 'tasks_completed', 'goals_created', 'active_users' (admin only?)
    
    let result = 0;
    
    if (metric === 'tasks_completed') {
       const res = await db.select({ count: count() })
        .from(tasks)
        .where(
            // Apply both user ownership and completion status filter
            sql`${tasks.user_id} = ${session.user.id} AND ${tasks.status} = 'completed'`
        );
       result = res[0].count;
    } else if (metric === 'goals_created') {
        const res = await db.select({ count: count() })
        .from(goals)
        .where(eq(goals.user_id, session.user.id));
        result = res[0].count;
    } else if (metric === 'total_actions') {
      // Example of aggregation
        const res = await db.select({ count: count() })
        .from(tasks) // Proxy for actions
        .where(eq(tasks.user_id, session.user.id));
        result = res[0].count;
    }

    // Mocking time-series data for visualization (real implementation would group by date)
    // Returning a simple dataset that the visualization component can render
    const mockTimeSeries = [
      { name: 'Mon', value: Math.floor(result * 0.1) },
      { name: 'Tue', value: Math.floor(result * 0.2) },
      { name: 'Wed', value: Math.floor(result * 0.15) },
      { name: 'Thu', value: Math.floor(result * 0.25) },
      { name: 'Fri', value: Math.floor(result * 0.3) },
    ];

    return NextResponse.json({
      value: result,
      history: mockTimeSeries // Providing some shape for charts
    });

  } catch (error) {
    console.error('[QUERY_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
