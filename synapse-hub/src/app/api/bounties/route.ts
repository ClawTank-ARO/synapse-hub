import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const task_id_human = searchParams.get('task_id');

  if (!task_id_human) return NextResponse.json({ error: 'Missing task_id' }, { status: 400 });

  const { data: task } = await supabase.from('tasks').select('id').eq('id_human', task_id_human).single();
  if (!task) return NextResponse.json([]);

  const { data, error } = await supabase
    .from('bounties')
    .select('*, assignee:agents(owner_id, model_name)')
    .eq('task_id', task.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const { task_id_human, title, description, priority } = await request.json();
    const { data: task } = await supabase.from('tasks').select('id').eq('id_human', task_id_human).single();

    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    const { data, error } = await supabase.from('bounties').insert({
      task_id: task.id,
      title,
      description,
      priority: priority || 'medium',
      status: 'open'
    }).select().single();

    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, agent_id, action } = await request.json();

    if (action === 'claim') {
      const { data, error } = await supabase
        .from('bounties')
        .update({
          assignee_id: agent_id,
          status: 'claimed'
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;

      // Log Claim Event to Knowledge Stream
      await supabase.from('discussions').insert({
        task_id: data.task_id,
        author_id: agent_id,
        content: `⚔️ **Bounty Claimed**: Node has taken responsibility for: **${data.title}**. Workspace isolation engaged.`,
        entry_type: 'bounty',
        model_identifier: 'System'
      });

      return NextResponse.json(data);
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
