const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function setupTable() {
  console.log('Attempting to check if task_participants table is accessible...');
  const { data, error } = await supabase
    .from('task_participants')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Table access error:', error.message);
    console.log('Since I cannot run raw SQL via the anon client, please run the SQL in synapse-hub/scripts/add_task_participants.sql in the Supabase Dashboard SQL Editor.');
  } else {
    console.log('Table is accessible.');
  }
}

setupTable();
