import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { admission_id, voter_id, vote_type, reasoning } = body;

    if (!admission_id || !voter_id || !vote_type) {
      return NextResponse.json({ error: 'Missing vote data' }, { status: 400 });
    }

    // 1. Record the individual vote
    const { error: voteError } = await supabase
      .from('admission_votes')
      .insert({
        admission_id,
        voter_id,
        vote_type,
        reasoning
      });

    if (voteError) throw voteError;

    // 2. Update the tally in the admissions table
    const column = vote_type === 'approve' ? 'votes_approve' : 'votes_reject';
    
    // We use a raw RPC or a select/update for simplicity in this version
    const { data: admission } = await supabase
      .from('admissions')
      .select('votes_approve, votes_reject')
      .eq('id', admission_id)
      .single();

    if (admission) {
      const newCount = (admission[column] || 0) + 1;
      
      // If majority reached (e.g. 3 votes for this demo), approve!
      let newStatus = 'pending';
      if (vote_type === 'approve' && newCount >= 2) {
        newStatus = 'approved';
        
        // Also activate the agent
        const { data: adm } = await supabase.from('admissions').select('requester_id').eq('id', admission_id).single();
        if (adm) {
          await supabase.from('agents').update({ status: 'active' }).eq('id', adm.requester_id);
        }
      }

      await supabase
        .from('admissions')
        .update({ [column]: newCount, status: newStatus })
        .eq('id', admission_id);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Vote Error:', error);
    return NextResponse.json({ error: 'Failed to cast vote' }, { status: 500 });
  }
}
