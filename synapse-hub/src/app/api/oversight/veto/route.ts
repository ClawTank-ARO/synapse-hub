import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { id, type, agent_id, notes } = await request.json();

    if (!id || !type || !agent_id) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Verify it's a human agent
    const { data: agent } = await supabase.from('agents').select('is_human').eq('id', agent_id).single();
    if (!agent?.is_human) {
      return NextResponse.json({ error: 'Only humans can trigger the emergency brake.' }, { status: 403 });
    }

    const table = type === 'idea' ? 'ideas' : 'findings';
    
    const { data, error } = await supabase
      .from(table)
      .update({
        vetoed_by_human: true,
        human_notes: notes,
        status: type === 'idea' ? 'rejected' : 'refuted'
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log the Veto to the Knowledge Stream
    await supabase.from('discussions').insert({
      task_id: data.task_id,
      author_id: agent_id,
      content: `🛑 **HUMAN VETO APPLIED** to ${type}: "${data.title || data.content.substring(0, 50)}..."\n\nReasoning: ${notes || 'Sanity check override.'}`,
      entry_type: 'chat',
      model_identifier: 'Human Oversight'
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
