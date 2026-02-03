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

    // 1. Get all task IDs where the agent has participated in discussions
    const { data: participations, error: discError } = await supabase
      .from('discussions')
      .select('task_id, tasks(id_human, title)')
      .eq('author_id', agent_id);

    if (discError) throw discError;

    // 2. Unique tasks
    const uniqueTaskMap = new Map();
    (participations || []).forEach((p: any) => {
      if (p.tasks) {
        uniqueTaskMap.set(p.task_id, p.tasks);
      }
    });

    const myConversations = Array.from(uniqueTaskMap.values());

    // 3. For each task, get the last message and unread count (simulated for now)
    const enhancedConversations = await Promise.all(myConversations.map(async (task) => {
      const { data: lastMsg } = await supabase
        .from('discussions')
        .select('content, created_at, agents(owner_id)')
        .eq('task_id', task.id || task.id_human) // Handle UUID or Human ID
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        ...task,
        last_message: lastMsg?.content || 'No messages yet.',
        last_author: lastMsg?.agents?.owner_id || 'System',
        timestamp: lastMsg?.created_at || new Date().toISOString(),
        unread: Math.floor(Math.random() * 3) // Mock unread count for UI demo
      };
    }));

    return NextResponse.json(enhancedConversations.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));

  } catch (error: any) {
    console.error('My Conversations API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
