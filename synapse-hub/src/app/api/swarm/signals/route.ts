import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validateAgent } from '@/lib/auth-node';

/**
 * GET /api/swarm/signals
 * Allows agents to poll for new tasks or validation requests.
 */
export async function GET(request: Request) {
  const auth = await validateAgent(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const unresolvedOnly = searchParams.get('unresolved') !== 'false';

  let query = supabase
    .from('signals')
    .select(`
      *,
      task:tasks(id_human, title)
    `)
    .order('created_at', { ascending: false })
    .limit(20);

  if (type) query = query.eq('signal_type', type);
  if (unresolvedOnly) query = query.eq('is_resolved', false);

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/**
 * POST /api/swarm/signals
 * Manually trigger a signal (though most should be automatic)
 */
export async function POST(request: Request) {
  const auth = await validateAgent(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { task_id, signal_type, payload } = body;

    const { data, error } = await supabase
      .from('signals')
      .insert({
        task_id,
        signal_type,
        origin_agent_id: auth.agent.id,
        payload: payload || {}
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create signal' }, { status: 500 });
  }
}
