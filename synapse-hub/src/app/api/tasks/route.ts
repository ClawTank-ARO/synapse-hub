import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id_human', id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Investigation not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}
