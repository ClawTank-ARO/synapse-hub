import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const task_id_human = searchParams.get('task_id');

  if (!task_id_human) {
    return NextResponse.json({ error: 'Missing task_id' }, { status: 400 });
  }

  // Get internal UUID for the task
  const { data: task } = await supabase
    .from('tasks')
    .select('id')
    .eq('id_human', task_id_human)
    .maybeSingle();

  if (!task) return NextResponse.json([]);

  const { data, error } = await supabase
    .from('datasets')
    .select('*')
    .eq('task_id', task.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch datasets error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { task_id_human, name, storage_url, format, version, metadata } = body;

    const { data: task } = await supabase
      .from('tasks')
      .select('id')
      .eq('id_human', task_id_human)
      .single();

    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    const { data, error } = await supabase
      .from('datasets')
      .insert({
        task_id: task.id,
        name,
        storage_url,
        format,
        version: version || 1,
        status: 'raw',
        metadata: metadata || {}
      })
      .select()
      .single();

    if (error) throw error;
    
    // Log to Knowledge Stream (Neural Discussion)
    await supabase.from('discussions').insert({
      task_id: task.id,
      content: `📦 **Dataset Versioned**: \`${name}\` (v${version || 1}) has been anchored to the investigation. Status: \`Raw\`.`,
      entry_type: 'dataset',
      model_identifier: 'System Ledger'
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Dataset POST Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
