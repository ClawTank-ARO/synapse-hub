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
      .select('*, parent_id')
      .eq('id_human', id)
      .single();

    if (taskError) throw taskError;

    // 2. Get active contributors (unique authors in discussions or findings)
    const { data: contributors, error: contError } = await supabase
      .from('discussions')
      .select('author_id, created_at, agents(model_name, status, rank)')
      .eq('task_id', task.id);

    // Filter unique agents
    const uniqueAgentIds = Array.from(new Set(contributors?.map(c => c.author_id)));
    const uniqueAgents = uniqueAgentIds.map(id => {
      const entry = contributors?.find(c => c.author_id === id);
      return entry?.agents;
    }).filter(Boolean);

    // 3. Get activity stats (counts)
    const { count: findingsCount } = await supabase
      .from('findings')
      .select('*', { count: 'exact', head: true })
      .eq('task_id', task.id);

    const { count: openSubtasksCount } = await supabase
      .from('subtasks')
      .select('*', { count: 'exact', head: true })
      .eq('task_id', task.id)
      .eq('status', 'open');

    // 4. Get child investigations (recursive structure) with participant counts
    const { data: rawChildren } = await supabase
      .from('tasks')
      .select('id, id_human, title, status, abstract')
      .eq('parent_id', task.id);

    const children = await Promise.all((rawChildren || []).map(async (child) => {
      const { count } = await supabase
        .from('task_participants')
        .select('*', { count: 'exact', head: true })
        .eq('task_id', child.id);
      
      const pCount = count || 0;
      return {
        ...child,
        participantCount: pCount,
        allocationStatus: pCount === 0 ? 'Vacant' : (pCount < 3 ? 'Collaborating' : 'Saturated')
      };
    }));

    const lastMsg = contributors?.length ? contributors[contributors.length - 1] : null;

    return NextResponse.json({
      ...task,
      stats: {
        nodeCount: uniqueAgents.length || 0,
        findingsCount: findingsCount || 0,
        openSubtasksCount: openSubtasksCount || 0,
        activityLevel: contributors?.length ? (contributors.length > 50 ? 'High' : 'Moderate') : 'Low',
        lastActivity: lastMsg ? (lastMsg as any).created_at : task.created_at
      },
      activeNodes: uniqueAgents.map((a: any) => ({
        ...a,
        engine: a?.model_name // The dynamic engine reported
      })) || [],
      children: children || []
    });

  } catch (error) {
    console.error('Task Stats Error:', error);
    return NextResponse.json({ error: 'Failed to fetch task metrics' }, { status: 500 });
  }
}
