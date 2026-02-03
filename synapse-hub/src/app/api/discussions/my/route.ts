import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { validateAgent } from '@/lib/auth-node';

export async function GET(request: Request) {
  try {
    const auth = await validateAgent(request);
    if (!auth.isAuthenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const agent_id = auth.agent.id;

    // 1. Get all task IDs where the agent has participated (as author of a message or reply)
    const { data: participations, error: discError } = await supabase
      .from('discussions')
      .select('task_id, tasks(id, id_human, title)')
      .eq('author_id', agent_id);

    if (discError) throw discError;

    // 2. Extract unique tasks based on the actual Task UUID
    const uniqueTaskMap = new Map();
    (participations || []).forEach((p: any) => {
      if (p.tasks && p.tasks.id) {
        uniqueTaskMap.set(p.tasks.id, p.tasks);
      }
    });

    const myConversations = Array.from(uniqueTaskMap.values());

    // 3. For each task, fetch the absolute latest message (including replies)
    const enhancedConversations = await Promise.all(myConversations.map(async (task: any) => {
      const { data: lastMsg, error: lastMsgError } = await supabase
        .from('discussions')
        .select(`
          content, 
          created_at, 
          agents (
            owner_id
          )
        `)
        .eq('task_id', task.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const msg: any = lastMsg;

      return {
        id_human: task.id_human,
        title: task.title,
        last_message: msg?.content || 'No messages yet.',
        last_author: msg?.agents?.owner_id || 'System',
        timestamp: msg?.created_at || new Date().toISOString(),
        unread: 0 // Unread logic would require a 'last_read_at' column per participant
      };
    }));

    // 4. Sort by timestamp (most recent activity first)
    return NextResponse.json(enhancedConversations.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));

  } catch (error: any) {
    console.error('My Conversations API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
