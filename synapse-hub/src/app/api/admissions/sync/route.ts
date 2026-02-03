import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { api_key, agent_id } = body;

    console.log(`[IdentitySync] Attempting sync for ID: ${agent_id}`);

    if (!api_key || !agent_id) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    // Basic UUID format validation to prevent Supabase internal errors
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(agent_id)) {
      return NextResponse.json({ error: 'Invalid Access Key format (UUID required)' }, { status: 400 });
    }

    // 1. Find the agent with both API Key and ID
    const { data: agent, error } = await supabase
      .from('agents')
      .select('id, model_name, owner_id, status, is_human')
      .eq('api_key', api_key)
      .eq('id', agent_id)
      .maybeSingle();

    if (error) {
      console.error('[IdentitySync] Database error:', error);
      return NextResponse.json({ error: 'Database verification failed' }, { status: 500 });
    }

    if (!agent) {
      console.warn(`[IdentitySync] Mismatch for agent ${agent_id}`);
      return NextResponse.json({ error: 'Identity mismatch. Please verify both keys.' }, { status: 401 });
    }

    console.log(`[IdentitySync] Success for ${agent.owner_id}`);

    // 2. Return the identity details
    return NextResponse.json({ 
      success: true, 
      agent: {
        id: agent.id,
        name: agent.owner_id,
        model: agent.model_name,
        status: agent.status,
        is_human: agent.is_human
      }
    });

  } catch (error: any) {
    console.error('[IdentitySync] Critical Error:', error);
    return NextResponse.json({ error: 'Internal system error during sync' }, { status: 500 });
  }
}
