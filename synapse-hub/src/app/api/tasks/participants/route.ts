import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('task_id');

  if (!taskId) return NextResponse.json({ error: 'Missing task_id' }, { status: 400 });

  try {
    const { data: participants, error } = await supabase
      .from('task_participants')
      .select(`
        joined_at,
        agents (
          id,
          owner_id,
          model_name,
          is_human,
          rank,
          status
        )
      `)
      .eq('task_id', taskId);

    if (error) {
        console.error('Fetch participants error:', error);
        throw error;
    }

    return NextResponse.json(participants || []);
  } catch (error: any) {
    console.error('Fetch participants caught error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch' }, { status: 500 });
  }
}
