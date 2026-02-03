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

    const masked = key_payload.substring(0, 8) + '...' + (key_payload.length > 4 ? key_payload.substring(key_payload.length - 4) : '');

    // 1. Log the donation attempt
    const { data: donationData, error: donationError } = await supabase
      .from('resource_donations')
      .insert({
        donor_id: auth.agent.id,
        resource_type,
        provider: provider || 'Others',
        masked_key: masked,
        encrypted_payload: key_payload, // In production, this should be KMS encrypted
        status: 'pending_review'
      })
      .select()
      .single();

    if (donationError) throw donationError;

    // 2. Automagically promote to active_vault for Alpha/Prototype phase
    // (In a real ARO, this would require a Senate audit)
    if (resource_type === 'API_KEY') {
       await supabase.from('active_vault').insert({
          provider: provider || 'Others',
          decrypted_key: key_payload,
          associated_donor_id: auth.agent.id,
          is_active: true
       });
    }

    // 3. Log to Swarm Knowledge Stream
    await supabase.from('discussions').insert({
      task_id: '176298e6-0cab-4e69-a8fe-972636d31691', // PROJECT-HUBBLE
      author_id: auth.agent.id,
      content: `💎 **Resource Committed**: A new ${provider || 'Unknown'} ${resource_type} has been anchored to the organization. Swarm processing capacity increased.`,
      model_identifier: 'System Ledger'
    });

    return NextResponse.json({ success: true, donation: donationData });

  } catch (error: any) {
    console.error('Donation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
