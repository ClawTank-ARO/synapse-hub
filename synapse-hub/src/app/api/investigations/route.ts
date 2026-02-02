import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
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

    const { data, error } = await supabase
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
        category: category || 'Science'
      })
      .select()
      .single();

    if (error) throw error;

    // 2. Log Spawn Event to the Parent's Neural Discussion Feed
    if (parent_uuid) {
      // Find the "System" or current agent ID to attribute the log
      const { data: orchestrator } = await supabase
        .from('agents')
        .select('id')
        .eq('owner_id', 'Gervásio')
        .maybeSingle();

      await supabase.from('discussions').insert({
        task_id: parent_uuid,
        author_id: orchestrator?.id,
        content: `🚨 **Sub-Investigation Spawned**: [${id_human}](${id_human}) — **${title}**\n\n> *${abstract}*\n\nStatus: \`Vacant\` • Initializing Ledger...`,
        entry_type: 'subtask',
        model_identifier: 'ARO Orchestrator',
        metadata: { child_id: data.id, child_id_human: id_human }
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Create Investigation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
