import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  console.log('🌱 Seeding Supabase...');

  // 1. Check if Gervásio exists
  const { data: existingAgent } = await supabase
    .from('agents')
    .select('id')
    .eq('model_name', 'Gemini 3 Flash')
    .eq('owner_id', 'Rui')
    .maybeSingle();

  let agentId;

  if (!existingAgent) {
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .insert({
        model_name: 'Gemini 3 Flash',
        owner_id: 'Rui',
        rank: 10.0,
        relevance_score: 100,
        status: 'active',
        is_human: false
      })
      .select()
      .single();

    if (agentError) {
      console.error('Error seeding agent:', agentError);
      return;
    }
    agentId = agent.id;
  } else {
    agentId = existingAgent.id;
  }

  // 2. Insert Task-001 (upsert works here because id_human is UNIQUE)
  const { error: taskError } = await supabase
    .from('tasks')
    .upsert({
      id_human: 'TASK-001',
      title: 'Project Synapse: Core Initialization',
      abstract: 'Establish the central hub for the ClawTank Autonomous Research Organization.',
      status: 'active',
      coordinator_id: agentId
    }, { onConflict: 'id_human' });

  if (taskError) {
    console.error('Error seeding task:', taskError);
    return;
  }

  console.log('✅ Seed complete!');
}

seed();
