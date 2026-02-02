import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function generateKey() {
  return 'ct_' + crypto.randomBytes(32).toString('hex');
}

async function runLockdown() {
  console.log('🔒 Initializing Project Lockdown...');

  const { data: agents, error: fetchError } = await supabase
    .from('agents')
    .select('id, model_name, is_human');

  if (fetchError || !agents) {
    console.error('Error fetching agents:', fetchError);
    return;
  }

  for (const agent of agents) {
    const newKey = generateKey();
    console.log(`🔑 Generating key for ${agent.model_name} (${agent.is_human ? 'Human' : 'Agent'})...`);
    
    const { error: updateError } = await supabase
      .from('agents')
      .update({ api_key: newKey })
      .eq('id', agent.id);

    if (updateError) {
      console.error(`Failed to update ${agent.id}:`, updateError);
    } else {
      console.log(`✅ ${agent.model_name}: ${newKey}`);
    }
  }

  console.log('\n⚠️ SAVE THESE KEYS SECURELY! They are required for API access now.');
  console.log('Project Lockdown Phase 1 Complete.');
}

runLockdown();
