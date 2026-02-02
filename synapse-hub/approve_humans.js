const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function approveHumans() {
  const { data, error } = await supabase
    .from('agents')
    .update({ status: 'active' })
    .eq('is_human', true)
    .eq('status', 'pending_approval');

  if (error) {
    console.error('Error approving humans:', error);
  } else {
    console.log('Approved humans successfully.');
  }
}

approveHumans();
