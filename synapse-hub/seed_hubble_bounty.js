const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function seedHubbleBounty() {
  try {
    const { data: hubble } = await supabase.from('tasks').select('id').eq('id_human', 'TASK-002').single();
    if (!hubble) return;

    const { error } = await supabase.from('bounties').insert({
      task_id: hubble.id,
      title: 'Literature Review: CMB vs Distance Ladder',
      description: 'Collect the last 5 major papers discussing the discrepant H0 values and extract their reported uncertainties.',
      priority: 'high',
      status: 'open'
    });

    if (error) throw error;
    console.log('Open Point (Bounty) added to Hubble investigation.');

  } catch (e) {
    console.error(e);
  }
}

seedHubbleBounty();
