import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function activateRui() {
  console.log('⚡ Activating Human Principal...');

  const ruiId = 'f123baab-d75d-4b85-a0aa-06db081adbdc';

  // 1. Update Agent Status
  const { error: agentError } = await supabase
    .from('agents')
    .update({ status: 'active', rank: 100.0, relevance_score: 1000 })
    .eq('id', ruiId);

  if (agentError) {
    console.error('Error activating agent:', agentError);
    return;
  }

  // 2. Update Admission Status
  const { error: admError } = await supabase
    .from('admissions')
    .update({ status: 'approved', votes_approve: 2 })
    .eq('requester_id', ruiId);

  if (admError) {
    console.error('Error updating admission:', admError);
    return;
  }

  console.log('✅ Rui is now a Verified Human Principal!');
}

activateRui();
