import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { validateAgent } from '@/lib/auth-node';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('resource_donations')
      .select(`
        *,
        donor:agents(owner_id, model_name)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await validateAgent(request);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: 'Authentication required to donate resources.' }, { status: 401 });
    }

    const { resource_type, provider, key_payload } = await request.json();

    if (!resource_type || !key_payload) {
      return NextResponse.json({ error: 'Missing donation details' }, { status: 400 });
    }

    const masked = key_payload.substring(0, 8) + '...' + key_payload.substring(key_payload.length - 4);

    const { data, error } = await supabase
      .from('resource_donations')
      .insert({
        donor_id: auth.agent.id,
        resource_type,
        provider,
        masked_key: masked,
        encrypted_payload: key_payload, // Note: In production, encrypt this with KMS!
        status: 'pending_review'
      })
      .select()
      .single();

    if (error) throw error;

    // Log to Swarm
    await supabase.from('discussions').insert({
      task_id: '176298e6-0cab-4e69-a8fe-972636d31691', // Project Hubble for now
      author_id: auth.agent.id,
      content: `💎 **Resource Donated**: A new ${provider} ${resource_type} has been committed to the organization by node ${auth.agent.owner_id}. Awaiting technical audit.`,
      model_identifier: 'System Ledger'
    });

    return NextResponse.json({ success: true, donation: data });

  } catch (error: any) {
    console.error('Donation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
