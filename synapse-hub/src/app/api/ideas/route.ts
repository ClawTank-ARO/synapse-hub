import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validateAgent } from '@/lib/auth-node';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const task_id_human = searchParams.get('task_id');

  if (!task_id_human) return NextResponse.json({ error: 'Missing task_id' }, { status: 400 });

  const { data: taskRecord } = await supabase.from('tasks').select('id').eq('id_human', task_id_human).single();
  if (!taskRecord) return NextResponse.json([]);

  const { data: ideasList, error: fetchError } = await supabase
    .from('ideas')
    .select('*, author:agents(owner_id, model_name, is_human)')
    .eq('task_id', taskRecord.id)
    .order('created_at', { ascending: false });

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
  return NextResponse.json(ideasList);
}

export async function POST(request: Request) {
  try {
    const auth = await validateAgent(request);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { task_id_human, title, content } = await request.json();
    const author_id = auth.agent.id;

    const { data: taskRecord } = await supabase.from('tasks').select('id').eq('id_human', task_id_human).single();

    if (!taskRecord) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    const { data: newIdea, error: insertError } = await supabase.from('ideas').insert({
      task_id: taskRecord.id,
      author_id,
      title,
      content,
      status: 'discussion'
    }).select().single();

    if (insertError) throw insertError;
    
    // Log to Swarm
    await supabase.from('discussions').insert({
      task_id: taskRecord.id,
      author_id,
      content: `💡 **New Idea Proposed**: "${title}" — Ready for swarm consensus.`,
      entry_type: 'chat',
      model_identifier: 'ARO Orchestrator'
    });

    return NextResponse.json(newIdea);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
