import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validateAgent } from '@/lib/auth-node';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const task_id_human = searchParams.get('task_id');
  const finding_id = searchParams.get('finding_id');
  const idea_id = searchParams.get('idea_id');

  let query = supabase
    .from('discussions')
    .select(`
      id,
      content,
      created_at,
      model_identifier,
      entry_type,
      metadata,
      parent_id,
      agents (
        owner_id,
        model_name,
        is_human
      )
    `)
    .order('created_at', { ascending: true }); // Ascending for logical flow in threads

  if (finding_id) {
    query = query.eq('finding_id', finding_id);
  } else if (idea_id) {
    query = query.filter('metadata->>idea_id', 'eq', idea_id);
  } else if (task_id_human) {
    // Get internal UUID for the task
    const { data: taskRecord } = await supabase
      .from('tasks')
      .select('id')
      .eq('id_human', task_id_human)
      .maybeSingle();

    if (!taskRecord) return NextResponse.json([]);
    query = query.eq('task_id', taskRecord.id).is('finding_id', null);
  } else {
    return NextResponse.json({ error: 'Missing task_id or finding_id' }, { status: 400 });
  }

  const { data: discussions, error: fetchError } = await query;

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
  return NextResponse.json(discussions);
}

export async function POST(request: Request) {
  try {
    const auth = await validateAgent(request);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const { task_id_human, content, model_identifier, finding_id, idea_id, parent_id } = body;
    const agent_id = auth.agent.id; // Use authenticated agent ID

    let taskId = null;
    if (task_id_human) {
      const { data: taskRecord } = await supabase
        .from('tasks')
        .select('id')
        .eq('id_human', task_id_human)
        .single();
      if (taskRecord) taskId = taskRecord.id;
    } else if (idea_id) {
      // Robustness: Infer project ID from the parent idea
      const { data: ideaRecord } = await supabase
        .from('ideas')
        .select('task_id')
        .eq('id', idea_id)
        .single();
      if (ideaRecord) taskId = ideaRecord.task_id;
    } else if (parent_id) {
      // Infer from parent message
      const { data: parentMsg } = await supabase
        .from('discussions')
        .select('task_id')
        .eq('id', parent_id)
        .single();
      if (parentMsg) taskId = parentMsg.task_id;
    }

    if (!taskId) {
      return NextResponse.json({ error: 'Context required: Could not identify parent project.' }, { status: 400 });
    }

    const { data: newDiscussion, error: insertError } = await supabase
      .from('discussions')
      .insert({
        task_id: taskId,
        author_id: agent_id,
        content,
        model_identifier,
        finding_id: finding_id || null,
        parent_id: parent_id || null,
        metadata: idea_id ? { idea_id } : null
      })
      .select()
      .single();

    if (insertError) throw insertError;
    // Finalizing collaboration log entry...
    return NextResponse.json(newDiscussion);
  } catch (error: any) {
    console.error('Discussion POST Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
