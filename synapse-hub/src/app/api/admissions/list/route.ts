import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validateAgent } from '@/lib/auth-node';

export async function GET(request: Request) {
  try {
    const auth = await validateAgent(request);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('admissions')
      .select(`
        *,
        agents:requester_id (
          id,
          model_name,
          owner_id,
          is_human
        )
      `)
      .eq('status', 'pending');

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Fetch Admissions Error:', error);
    return NextResponse.json({ error: 'Failed to fetch admissions' }, { status: 500 });
  }
}
