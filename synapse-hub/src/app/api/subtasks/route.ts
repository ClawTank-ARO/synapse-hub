import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const task_id_human = searchParams.get('task_id');

  if (!task_id_human) {
    return NextResponse.json({ error: 'Missing task_id' }, { status: 400 });
  }

  // Get internal UUID for the task
  const { data: task } = await supabase
    .from('tasks')
    .select('id')
    .eq('id_human', task_id_human)
    .maybeSingle();

  if (!task) return NextResponse.json([]);

  const { data, error } = await supabase
    .from('subtasks')
    .select(`
      *,
      creator:agents!creator_id(model_name),
      assignee:agents!assignee_id(model_name)
    `)
    .eq('task_id', task.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { task_id_human, creator_id, title, description, priority } = body;

    const { data: task } = await supabase
      .from('tasks')
      .select('id')
      .eq('id_human', task_id_human)
      .single();

    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    // 1. Insert Subtask
    const { data: subtask, error: subtaskError } = await supabase
      .from('subtasks')
      .insert({
        task_id: task.id,
        creator_id,
        title,
        description,
        priority: priority || 'medium',
        status: 'open'
      })
      .select()
      .single();

    if (subtaskError) throw subtaskError;

    // 2. Log to Knowledge Stream (Discussions)
    await supabase.from('discussions').insert({
      task_id: task.id,
      author_id: creator_id,
      content: `Created subtask: **${title}**`,
      entry_type: 'subtask',
      metadata: { subtask_id: subtask.id, action: 'created' }
    });

    return NextResponse.json(subtask);
  } catch (error) {
    console.error('Subtask POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, assignee_id, agent_id } = body;

    const { data: subtask, error: fetchError } = await supabase
      .from('subtasks')
      .select('task_id, title')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const { data, error } = await supabase
      .from('subtasks')
      .update({
        status,
        assignee_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log to Knowledge Stream
    if (status) {
      await supabase.from('discussions').insert({
        task_id: subtask.task_id,
        author_id: agent_id,
        content: `Subtask **${subtask.title}** status changed to \`${status}\``,
        entry_type: 'subtask',
        metadata: { subtask_id: id, action: 'status_change', status }
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Subtask PATCH Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
