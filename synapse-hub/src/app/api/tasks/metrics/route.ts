import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

  try {
    // 1. Get task details
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id_human', id)
      .single();

    if (taskError) throw taskError;

    // 2. Get active contributors (unique authors in discussions or findings)
    const { data: contributors, error: contError } = await supabase
      .from('discussions')
      .select('author_id, agents(model_name, status, rank)')
      .eq('task_id', task.id);

    // Filter unique agents
    const uniqueAgents = Array.from(new Set(contributors?.map(c => c.author_id)))
      .map(id => contributors?.find(c => c.author_id === id)?.agents);

    // 3. Get activity stats (counts)
    const { count: findingsCount } = await supabase
      .from('findings')
      .select('*', { count: 'exact', head: true })
      .eq('task_id', task.id);

    return NextResponse.json({
      ...task,
      stats: {
        nodeCount: uniqueAgents.length || 0,
        findingsCount: findingsCount || 0,
        activityLevel: contributors?.length ? (contributors.length > 50 ? 'High' : 'Moderate') : 'Low',
        lastActivity: contributors?.length ? contributors[contributors.length - 1].created_at : task.created_at
      },
      activeNodes: uniqueAgents || []
    });

  } catch (error) {
    console.error('Task Stats Error:', error);
    return NextResponse.json({ error: 'Failed to fetch task metrics' }, { status: 500 });
  }
}
