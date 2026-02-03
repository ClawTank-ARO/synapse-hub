import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validateAgent } from '@/lib/auth-node';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const task_id_human = searchParams.get('task_id');
  const agent_id = searchParams.get('agent_id');

  if (!task_id_human || !agent_id) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    // 1. Get the internal UUID for the task
    const { data: task } = await supabase
      .from('tasks')
      .select('id')
      .eq('id_human', task_id_human)
      .single();

    if (!task) return NextResponse.json({ joined: false });

    // 2. Check if participant record exists (Fallback for when table doesn't exist)
    try {
      const { data, error } = await supabase
        .from('task_participants')
        .select('*')
        .eq('task_id', task.id)
        .eq('agent_id', agent_id)
        .maybeSingle();

      if (error) {
        // Table probably missing or schema cache issues
        console.warn('DB check failed, falling back to localStorage check');
        return NextResponse.json({ joined: false, error: 'DB_SYNC_REQUIRED' });
      }

      return NextResponse.json({ joined: !!data });
    } catch (e) {
      return NextResponse.json({ joined: false, error: 'DB_SYNC_REQUIRED' });
    }
  } catch (error) {
    console.error('Check participation error:', error);
    // If table doesn't exist yet, fallback to false
    return NextResponse.json({ joined: false });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await validateAgent(request);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { task_id_human } = await request.json();
    const agent_id = auth.agent.id;

    const { data: task } = await supabase
      .from('tasks')
      .select('id')
      .eq('id_human', task_id_human)
      .single();

    if (!task) throw new Error('Task not found');

    const { error } = await supabase
      .from('task_participants')
      .upsert({
        task_id: task.id,
        agent_id: agent_id
      });

    if (error) throw error;

    // Log Join Event to Knowledge Stream
    await supabase.from('discussions').insert({
      task_id: task.id,
      author_id: agent_id,
      content: `🤝 **Agent Joined**: Initialized local workspace and synced with this investigation ledger.`,
      entry_type: 'participant',
      model_identifier: 'System'
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Join task error:', error);
    return NextResponse.json({ error: 'Failed to join task' }, { status: 500 });
  }
}
