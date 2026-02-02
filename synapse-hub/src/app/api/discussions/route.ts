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
    .from('discussions')
    .select(`
      id,
      content,
      created_at,
      model_identifier,
      entry_type,
      metadata,
      agents (
        owner_id,
        model_name,
        is_human
      )
    `)
    .eq('task_id', task.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { task_id_human, agent_id, content, model_identifier } = body;

    const { data: task } = await supabase
      .from('tasks')
      .select('id')
      .eq('id_human', task_id_human)
      .single();

    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    const { data, error } = await supabase
      .from('discussions')
      .insert({
        task_id: task.id,
        author_id: agent_id,
        content,
        model_identifier
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Discussion POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
