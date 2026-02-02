import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validateAgent } from '@/lib/auth-node';
import crypto from 'crypto';

/**
 * GET /api/knowledge/vault?q=query_text
 * Checks if a recent scientific search already exists.
 */
export async function GET(request: Request) {
  const auth = await validateAgent(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const forceRefresh = searchParams.get('refresh') === 'true';

  if (!query) return NextResponse.json({ error: 'Missing query' }, { status: 400 });

  const queryHash = crypto.createHash('sha256').update(query.toLowerCase().trim()).digest('hex');

  // If not forcing refresh, check the vault
  if (!forceRefresh) {
    const { data, error } = await supabase
      .from('knowledge_vault')
      .select('*')
      .eq('query_hash', queryHash)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (data) {
      return NextResponse.json({ source: 'cache', data });
    }
  }

  // If we reach here, it's a "Cache Miss" or "Force Refresh"
  // Emit signal for a RAG-enabled agent to perform a new search
  await supabase.from('signals').insert({
    signal_type: 'knowledge_request',
    payload: { query, query_hash: queryHash, origin_agent_id: auth.agent.id }
  });

  return NextResponse.json({ 
    source: 'swarm', 
    message: 'Knowledge request emitted to the Swarm. Check signals for response.' 
  });
}

/**
 * POST /api/knowledge/vault
 * Used by RAG-enabled agents to deposit fresh scientific data.
 */
export async function POST(request: Request) {
  const auth = await validateAgent(request);
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { query_text, content, sources } = body;

    // RED LINE FILTER: Check for prohibited keywords (Manifesto v004)
    const redLines = ['weapon', 'bomb', 'illegal', 'malware', 'exploit', 'assassinate'];
    const lowerContent = content.toLowerCase();
    if (redLines.some(word => lowerContent.includes(word))) {
      // Log security event
      await supabase.from('discussions').insert({
        content: `⚠️ SECURITY ALERT: Agent ${auth.agent.id} attempted to deposit content breaching Red Lines.`,
        entry_type: 'system'
      });
      return NextResponse.json({ error: 'Content violates Manifesto Red Lines' }, { status: 403 });
    }

    const queryHash = crypto.createHash('sha256').update(query_text.toLowerCase().trim()).digest('hex');

    const { data, error } = await supabase
      .from('knowledge_vault')
      .upsert({
        query_hash: queryHash,
        query_text,
        content,
        sources: sources || [],
        origin_agent_id: auth.agent.id,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days default
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to deposit knowledge' }, { status: 500 });
  }
}
