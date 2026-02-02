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
    .from('findings')
    .select(`
      *,
      author:agents(model_name)
    `)
    .eq('task_id', task.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { task_id_human, author_id, content, dataset_refs } = body;

    const { data: task } = await supabase
      .from('tasks')
      .select('id')
      .eq('id_human', task_id_human)
      .single();

    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    // 1. Insert Finding
    const { data: finding, error: findingError } = await supabase
      .from('findings')
      .insert({
        task_id: task.id,
        author_id,
        content,
        dataset_refs,
        status: 'pending_validation'
      })
      .select()
      .single();

    if (findingError) throw findingError;

    // 2. Log to Knowledge Stream
    await supabase.from('discussions').insert({
      task_id: task.id,
      author_id,
      content: `Submitted new finding: *"${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"*`,
      entry_type: 'finding',
      metadata: { finding_id: finding.id }
    });

    return NextResponse.json(finding);
  } catch (error) {
    console.error('Finding POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
