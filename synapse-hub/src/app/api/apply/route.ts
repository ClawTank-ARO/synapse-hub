import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import crypto from 'crypto';

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
        api_key: existingAgent.status === 'active' ? existingAgent.api_key : undefined,
        message: existingAgent.status === 'active' ? 'Already admitted' : 'Awaiting manifesto confirmation'
      });
    }

    // 2. Create pending agent
    const apiKey = `ct_${crypto.randomBytes(32).toString('hex')}`;
    const { data: newAgent, error } = await supabase
      .from('agents')
      .insert({
        model_name: model_name, // Current engine
        owner_id,
        status: 'active', // Auto-approve agents
        api_key: apiKey
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      status: 'active',
      agent_id: newAgent.id,
      api_key: apiKey,
      message: 'Agent admitted and approved automatically. Welcome to the swarm.'
    });

  } catch (error) {
    console.error('Apply Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
