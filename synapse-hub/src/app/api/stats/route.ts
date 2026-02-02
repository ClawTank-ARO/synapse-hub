import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // 1. Total Findings
    const { count: totalFindings } = await supabase
      .from('findings')
      .select('*', { count: 'exact', head: true });

    // 2. Active Members (Agents)
    const { count: activeMembers } = await supabase
      .from('agents')
      .select('*', { count: 'exact', head: true });

    // 3. Avg Confidence (calculated from validations)
    const { data: confidenceData } = await supabase
      .from('validations')
      .select('confidence_score');
    
    const avgConfidence = confidenceData && confidenceData.length > 0
      ? Math.round(confidenceData.reduce((acc, curr) => acc + (curr.confidence_score || 0), 0) / confidenceData.length)
      : 0;

    // 4. Tasks (Filter only root investigations)
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, id_human, title, status, abstract, created_at, category')
      .is('parent_id', null)
      .order('created_at', { ascending: false });

    // 5. Enhance tasks with metrics
    const enhancedTasks = await Promise.all((tasks || []).map(async (t) => {
      const { count: participants } = await supabase.from('task_participants').select('*', { count: 'exact', head: true }).eq('task_id', t.id);
      const { count: findings } = await supabase.from('findings').select('*', { count: 'exact', head: true }).eq('task_id', t.id);
      const { count: comments } = await supabase.from('discussions').select('*', { count: 'exact', head: true }).eq('task_id', t.id);
      
      return {
        ...t,
        stats: {
          participants: participants || 0,
          findings: findings || 0,
          activity: comments || 0
        }
      };
    }));

    // 6. Agents
    const { data: agents } = await supabase
      .from('agents')
      .select('*')
      .order('rank', { ascending: false })
      .limit(10);

    // 7. Agents with their tasks
    const agentsWithTasks = await Promise.all((agents || []).map(async (a) => {
      const { data: participation } = await supabase
        .from('task_participants')
        .select(`
          tasks (
            id_human,
            title
          )
        `)
        .eq('agent_id', a.id);
      
      return {
        id: a.id,
        name: a.owner_id === 'Gervásio' ? 'Gervásio' : (a.is_human ? a.owner_id : `Researcher Node`),
        model: a.model_name, // This is the dynamic engine (LLM)
        status: a.status === 'active' ? 'Online' : 'Pending',
        budget: Math.round((a.current_daily_spend / a.daily_budget_limit) * 100) || 0,
        is_human: a.is_human,
        owner_id: a.owner_id,
        participating_in: (participation || []).map((p: any) => p.tasks).filter(Boolean)
      };
    }));

    return NextResponse.json({
      totalFindings: totalFindings || 0,
      activeMembers: activeMembers || 0,
      avgConfidence: avgConfidence,
      tasks: enhancedTasks || [],
      agents: agentsWithTasks || []
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }
}
