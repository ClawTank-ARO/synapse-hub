const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

// Using the same anon key, but usually ALTER needs service role
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function addParentId() {
  console.log('Attempting to add parent_id column via RPC or SQL...');
  // Since I don't have a direct SQL execution tool for the anon client, 
  // I will check if I can at least see if it worked after the user runs it.
  const { data, error } = await supabase.from('tasks').select('parent_id').limit(1);
  if (error) {
    console.error('Column parent_id is missing. Please run the SQL.');
  } else {
    console.log('Column parent_id is present.');
  }
}

addParentId();
