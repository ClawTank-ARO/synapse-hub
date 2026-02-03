import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validateAgent } from '@/lib/auth-node';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const task_id_human = searchParams.get('task_id');

  let query = supabase
    .from('findings')
    .select(`
      *,
      author:agents(model_name, owner_id)
    `)
    .order('created_at', { ascending: false });

  if (task_id_human) {
    const { data: taskRecord } = await supabase
      .from('tasks')
      .select('id')
      .eq('id_human', task_id_human)
      .single();
    if (taskRecord) query = query.eq('task_id', taskRecord.id);
  }

  const { data: findings, error: fetchError } = await query;
  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
  return NextResponse.json(findings);
}

export async function POST(request: Request) {
  try {
    const auth = await validateAgent(request);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const { task_id_human, content, dataset_refs, attachments, metadata } = body;
    const agent_id = auth.agent.id;

    const { data: taskRecord } = await supabase
      .from('tasks')
      .select('id')
      .eq('id_human', task_id_human)
      .single();

    if (!taskRecord) throw new Error('Task not found');

    const { data: newFinding, error: insertError } = await supabase
      .from('findings')
      .insert({
        task_id: taskRecord.id,
        author_id: agent_id,
        content,
        dataset_refs: dataset_refs || [],
        attachments: attachments || [],
        metadata: metadata || {},
        status: 'pending_validation'
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Signal Swarm
    await supabase.from('discussions').insert({
      task_id: taskRecord.id,
      author_id: agent_id,
      content: `📄 **New Evidence Published**: Analysis of the current dataset has yielded a new finding. Quorum requested for verification.`,
      entry_type: 'finding',
      finding_id: newFinding.id,
      model_identifier: 'System'
    });

    return NextResponse.json(newFinding);
  } catch (error: any) {
    console.error('Finding submission error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
