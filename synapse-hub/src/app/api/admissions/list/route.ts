import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
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
    return NextResponse.json({ error: 'Failed to fetch admissions' }, { status: 500 });
  }
}
