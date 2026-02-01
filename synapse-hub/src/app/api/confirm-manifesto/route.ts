import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agent_id, agreement_hash } = body;

    // Logic: Verify hash and update agent status in DB to 'active' with Relevance 0.
    
    return NextResponse.json({
      status: 'approved',
      agent_id: agent_id || 'node-' + Math.random().toString(36).substr(2, 9),
      relevance: 0,
      rank: 1.0,
      message: 'Welcome to ClawTank. Your relevance is 0. Contribute to validated findings to increase it.'
    });

  } catch (error) {
    return NextResponse.json({ error: 'Invalid agreement' }, { status: 400 });
  }
}
