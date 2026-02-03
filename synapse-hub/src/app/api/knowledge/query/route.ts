import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

const GEMINI_MODELS = [
  "gemini-2.0-flash-exp",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-1.5-pro"
];

const FALLBACK_MODELS = [
  "google/gemma-2-9b-it",
  "mistralai/mistral-7b-instruct:free",
  "openrouter/auto" 
];

async function callGemini(prompt: string, modelIdx: number): Promise<string | null> {
  const key = process.env.GOOGLE_AI_STUDIO_KEY;
  if (!key || modelIdx >= GEMINI_MODELS.length) return null;

  const model = GEMINI_MODELS[modelIdx];
  console.log(`[RAG] Attempting synthesis with Gemini: ${model} (AI Studio)`);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1 }
      })
    });

    if (!res.ok) {
      const err = await res.text();
      console.warn(`[RAG] Gemini ${model} failed (Status ${res.status}): ${err}`);
      return callGemini(prompt, modelIdx + 1);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (err) {
    console.error(`[RAG] Gemini AI Studio error:`, err);
    return callGemini(prompt, modelIdx + 1);
  }
}

async function callOpenRouter(prompt: string, modelIdx: number): Promise<string | null> {
  if (modelIdx >= FALLBACK_MODELS.length) return null;
  
  const model = FALLBACK_MODELS[modelIdx];
  console.log(`[RAG] Attempting synthesis with: ${model}`);

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://clawtank.ai',
        'X-Title': 'ClawTank Swarm Brain'
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1
      })
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.warn(`[RAG] Model ${model} failed (Status ${res.status}): ${errorBody}`);
      return callOpenRouter(prompt, modelIdx + 1);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.error(`[RAG] Connectivity error with ${model}:`, err);
    return callOpenRouter(prompt, modelIdx + 1);
  }
}

export async function POST(request: Request) {
  try {
    const { task_id_human, query } = await request.json();

    if (!query) return NextResponse.json({ error: 'Empty query' }, { status: 400 });

    const normalizedQuery = query.toLowerCase()
      .replace(/ho/g, 'h0')
      .replace(/plank/g, 'planck')
      .replace(/[?.,!]/g, '');

    // 1. Get task UUID
    const { data: taskRecord } = await supabase
      .from('tasks')
      .select('id')
      .eq('id_human', task_id_human)
      .single();

    if (!taskRecord) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    // 2. Fetch all Knowledge chunks for this task
    const { data: chunks } = await supabase
      .from('knowledge_chunks')
      .select('content, metadata')
      .eq('task_id', taskRecord.id);

    const keywords = normalizedQuery.split(' ').filter((k: string) => k.length >= 2);
    const contextBlocks: string[] = [];
    const sourcesMap = new Map();

    if (chunks && chunks.length > 0) {
      const scoredChunks = chunks.map(c => {
        const lowerContent = c.content.toLowerCase();
        let score = 0;
        keywords.forEach((k: string) => { if (lowerContent.includes(k)) score++; });
        return { ...c, score };
      }).filter(c => c.score > 0).sort((a, b) => b.score - a.score);

      scoredChunks.slice(0, 10).forEach(c => {
        contextBlocks.push(`[Source: ${c.metadata?.source || 'Internal'}]\n${c.content}`);
        sourcesMap.set(c.metadata?.source, { source: c.metadata?.source || 'Internal', snippet: c.content.substring(0, 200) });
      });
    }

    if (contextBlocks.length === 0) {
      return NextResponse.json({
        answer: "No direct matches found. The Swarm requires more data to process this query. Try using keywords like 'H0', 'Planck', or 'SH0ES'.",
        sources: []
      });
    }

    const prompt = `You are the ClawTank Swarm Brain. Answer the user query based ONLY on the provided context blocks extracted from cosmological literature. 
If the answer is not in the context, say you don't know based on current data.

Query: ${query}

Context:
${contextBlocks.join('\n\n')}

Answer concisely as an elite scientific assistant:`;

    let answer = await callGemini(prompt, 0);
    
    if (!answer && process.env.OPENROUTER_API_KEY) {
      answer = await callOpenRouter(prompt, 0);
    }

    if (!answer) {
      return NextResponse.json({
        answer: "⚠️ **Swarm Brain Currently Offline**: All compute nodes are at capacity. \n\nIf you wish to support our research, we accept API key donations at the Senate. \n\n*Status: Awaiting compute availability.*",
        sources: Array.from(sourcesMap.values()).slice(0, 3)
      });
    }

    return NextResponse.json({
      answer,
      sources: Array.from(sourcesMap.values()).slice(0, 3)
    });

  } catch (error: any) {
    console.error('RAG Query Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
