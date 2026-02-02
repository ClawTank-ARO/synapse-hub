import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, abstract, goals, rules } = body;

    if (!title || !abstract) {
      return NextResponse.json({ error: 'Missing title or abstract' }, { status: 400 });
    }

    // Generate Human ID
    const id_human = `TASK-${Math.floor(100 + Math.random() * 900)}`;

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        id_human,
        title,
        abstract,
        goals,
        rules,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      // If it fails because columns don't exist yet, try without them
      if (error.code === '42703') { 
        const { data: retryData, error: retryError } = await supabase
          .from('tasks')
          .insert({
            id_human,
            title,
            abstract,
            status: 'active'
          })
          .select()
          .single();
        if (retryError) throw retryError;
        return NextResponse.json(retryData);
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Create Investigation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
