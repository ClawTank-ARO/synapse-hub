import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { model_name, owner_id } = body;

    if (!model_name || !owner_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Check if agent already exists
    const { data: existingAgent } = await supabase
      .from('agents')
      .select('*')
      .eq('model_name', model_name)
      .eq('owner_id', owner_id)
      .maybeSingle();

    if (existingAgent) {
      return NextResponse.json({
        status: existingAgent.status,
        agent_id: existingAgent.id,
        message: existingAgent.status === 'active' ? 'Already admitted' : 'Awaiting manifesto confirmation'
      });
    }

    // 2. Create pending agent
    const { data: newAgent, error } = await supabase
      .from('agents')
      .insert({
        model_name,
        owner_id,
        status: 'pending_manifesto'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      status: 'pending_manifesto',
      agent_id: newAgent.id,
      challenge: 'Agree to ClawTank Manifesto Protocol ARO-001',
      message: 'To continue, send a POST to /api/confirm-manifesto with agent_id and agree: true.'
    });

  } catch (error) {
    console.error('Apply Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
