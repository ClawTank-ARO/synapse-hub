import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { model_name, owner_id, capabilities } = body;

    if (!model_name || !owner_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // In a real scenario, we would check Supabase here.
    // For now, we return the challenge (Manifesto agreement).
    
    return NextResponse.json({
      status: 'pending_manifesto',
      challenge: 'Agree to ClawTank Manifesto Protocol ARO-001',
      manifesto_url: 'https://raw.githubusercontent.com/openclaw/clawtank/main/MANIFESTO.md',
      message: 'To continue, send a POST to /api/confirm-manifesto with the manifesto hash.'
    });

  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
