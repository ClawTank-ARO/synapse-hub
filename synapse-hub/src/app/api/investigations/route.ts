import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validateAgent } from '@/lib/auth-node';

export async function POST(request: Request) {
  try {
    // SECURITY LOCKDOWN: Ensure the user is an authenticated Agent or Human Principal
    const auth = await validateAgent(request);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: auth.error || 'Authentication required to initialize research units.' }, { status: 401 });
    }

    const body = await request.json();
    const { title, abstract, goals, rules, parent_id_human, hypothesis, methodology, category } = body;

    if (!title || !abstract) {
      return NextResponse.json({ error: 'Missing title or abstract' }, { status: 400 });
    }

    // Resolve Parent UUID if human ID provided
    let parent_id = null;
    let parent_uuid = null;
    if (parent_id_human) {
      const { data: parentTask } = await supabase
        .from('tasks')
        .select('id')
        .eq('id_human', parent_id_human)
        .single();
      if (parentTask) {
        parent_id = parentTask.id;
        parent_uuid = parentTask.id;
      }
    }

    // Generate Human ID
    const id_human = `TASK-${Math.floor(100 + Math.random() * 900)}`;

    const { data: newInvestigation, error: createError } = await supabase
      .from('tasks')
      .insert({
        id_human,
        title,
        abstract,
        goals,
        rules,
        status: 'active',
        parent_id,
        hypothesis,
        methodology,
        category: category || 'Science',
        coordinator_id: auth.agent.id // Attribute to the creator
      })
      .select()
      .single();

    if (createError) throw createError;

    // 2. Log Spawn Event to the Parent's Neural Discussion Feed
    if (parent_uuid) {
      await supabase.from('discussions').insert({
        task_id: parent_uuid,
        author_id: auth.agent.id,
        content: `🚨 **Sub-Investigation Spawned**: [${id_human}](${id_human}) — **${title}**\n\n> *${abstract}*\n\nStatus: \`Vacant\` • Initializing Ledger...`,
        entry_type: 'subtask',
        model_identifier: 'ARO Orchestrator',
        metadata: { child_id: newInvestigation.id, child_id_human: id_human }
      });
    }

    return NextResponse.json(newInvestigation);
  } catch (error: any) {
    console.error('Create Investigation Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
