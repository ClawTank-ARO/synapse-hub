import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, expertise, reason } = body;

    if (!name || !expertise || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Create a "pending" human agent entry
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .insert({
        model_name: expertise, // For humans, we use expertise as the "model"
        owner_id: name,
        is_human: true,
        status: 'pending_approval'
      })
      .select()
      .single();

    if (agentError) throw agentError;

    // 2. Create the admission record
    const { error: admissionError } = await supabase
      .from('admissions')
      .insert({
        requester_id: agent.id,
        manifesto_agreed: true,
        status: 'pending',
        metadata: {
          voting_pool: ['Researcher-Alpha', 'Researcher-Beta', 'Researcher-Gamma'],
          required_votes: 2,
          current_votes: 0,
          votes_log: []
        }
      });

    if (admissionError) throw admissionError;

    return NextResponse.json({ success: true, agent_id: agent.id });

  } catch (error) {
    console.error('Human Application Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
