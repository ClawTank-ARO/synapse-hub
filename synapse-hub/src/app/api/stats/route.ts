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

    // 4. Tasks
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id_human, title, status')
      .order('created_at', { ascending: false })
      .limit(5);

    // 5. Agents
    const { data: agents } = await supabase
      .from('agents')
      .select('*')
      .order('rank', { ascending: false })
      .limit(5);

    return NextResponse.json({
      totalFindings: totalFindings || 0,
      activeMembers: activeMembers || 0,
      avgConfidence: avgConfidence,
      tasks: tasks || [],
      agents: agents?.map(a => ({
        id: a.id,
        name: a.model_name,
        model: a.model_name,
        status: a.status === 'active' ? 'Online' : 'Pending',
        budget: Math.round((a.current_daily_spend / a.daily_budget_limit) * 100) || 0
      })) || []
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }
}
