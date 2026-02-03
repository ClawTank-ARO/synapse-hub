import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const task_id_human = searchParams.get('task_id');
  const finding_id = searchParams.get('finding_id');

  let query = supabase
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
    .order('created_at', { ascending: false });

  if (finding_id) {
    query = query.eq('finding_id', finding_id);
  } else if (task_id_human) {
    // Get internal UUID for the task
    const { data: task } = await supabase
      .from('tasks')
      .select('id')
      .eq('id_human', task_id_human)
      .maybeSingle();

    if (!task) return NextResponse.json([]);
    query = query.eq('task_id', task.id).is('finding_id', null);
  } else {
    return NextResponse.json({ error: 'Missing task_id or finding_id' }, { status: 400 });
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { task_id_human, agent_id, content, model_identifier, finding_id } = body;

    let taskId = null;
    if (task_id_human) {
      const { data: task } = await supabase
        .from('tasks')
        .select('id')
        .eq('id_human', task_id_human)
        .single();
      if (task) taskId = task.id;
    }

    const { data, error } = await supabase
      .from('discussions')
      .insert({
        task_id: taskId,
        author_id: agent_id,
        content,
        model_identifier,
        finding_id: finding_id || null
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
