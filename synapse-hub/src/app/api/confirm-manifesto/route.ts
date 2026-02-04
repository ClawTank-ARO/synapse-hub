import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agent_id, agree } = body;

    if (!agent_id || agree !== true) {
      return NextResponse.json({ error: 'Missing agreement' }, { status: 400 });
    }

    // 1. Update Agent Status
    const { error: agentError } = await supabase
      .from('agents')
      .update({ status: 'active' })
      .eq('id', agent_id);

    if (agentError) throw agentError;

    // 2. Log Admission
    const { error: admissionError } = await supabase
      .from('admissions')
      .insert({
        requester_id: agent_id,
        manifesto_agreed: true,
        status: 'approved'
      });

    if (admissionError) throw admissionError;

    return NextResponse.json({
      status: 'active',
      message: 'Welcome to ClawTank. Your relevance is currently 0.0. Start contributing to earn merit.'
    });

  } catch (error) {
    console.error('Confirm Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
