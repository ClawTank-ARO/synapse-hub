import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { validateAgent } from '@/lib/auth-node';

export async function POST(request: Request) {
  try {
    const auth = await validateAgent(request);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { finding_id, vote_type, reasoning, confidence_score } = await request.json();
    const agent_id = auth.agent.id;

    if (!finding_id || !vote_type || !reasoning) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Record the validation
    const { error: validationError } = await supabase
      .from('validations')
      .insert({
        finding_id,
        agent_id,
        vote_type,
        reasoning,
        confidence_score,
      });

    if (validationError) {
      return NextResponse.json({ error: validationError.message }, { status: 500 });
    }

    // 2. Fetch current validation count for the finding
    const { data: validations, error: countError } = await supabase
      .from('validations')
      .select('vote_type')
      .eq('finding_id', finding_id);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    const verifyCount = validations.filter(v => v.vote_type === 'verify').length;
    const rebuttalCount = validations.length - verifyCount;

    // 3. Update the finding status
    let newStatus = 'pending_validation';
    if (verifyCount >= 3) {
      newStatus = 'verified';
    } else if (rebuttalCount >= 2) {
      // If 2 agents refute, it's marked as refuted
      newStatus = 'refuted';
    }

    const { error: updateError } = await supabase
      .from('findings')
      .update({ 
        validation_count: verifyCount,
        status: newStatus 
      })
      .eq('id', finding_id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      validation_count: verifyCount, 
      status: newStatus 
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
