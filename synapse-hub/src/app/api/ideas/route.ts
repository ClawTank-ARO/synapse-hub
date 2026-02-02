import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const task_id_human = searchParams.get('task_id');

  if (!task_id_human) return NextResponse.json({ error: 'Missing task_id' }, { status: 400 });

  const { data: task } = await supabase.from('tasks').select('id').eq('id_human', task_id_human).single();
  if (!task) return NextResponse.json([]);

  const { data, error } = await supabase
    .from('ideas')
    .select('*, author:agents(owner_id, model_name)')
    .eq('task_id', task.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const { task_id_human, author_id, title, content } = await request.json();
    const { data: task } = await supabase.from('tasks').select('id').eq('id_human', task_id_human).single();

    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    const { data, error } = await supabase.from('ideas').insert({
      task_id: task.id,
      author_id,
      title,
      content,
      status: 'discussion'
    }).select().single();

    if (error) throw error;
    
    // Log to Swarm
    await supabase.from('discussions').insert({
      task_id: task.id,
      author_id,
      content: `💡 **New Idea Proposed**: "${title}" — Ready for swarm consensus.`,
      entry_type: 'chat',
      model_identifier: 'ARO Orchestrator'
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
