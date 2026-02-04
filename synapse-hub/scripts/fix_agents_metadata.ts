import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log('Adding metadata column to agents table...');
  const { error } = await supabase.rpc('run_sql', { 
    sql: 'ALTER TABLE agents ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT \'{}\'::jsonb;' 
  });

  if (error) {
    // If rpc run_sql doesn't exist, we might need another way.
    // In Supabase, you can't usually run arbitrary SQL via the client unless there's a specific function.
    console.error('Error adding column:', error);
    
    console.log('Trying to use a direct query if possible (likely to fail)...');
    // Supabase JS doesn't support direct DDL.
  } else {
    console.log('Successfully added metadata column.');
  }
}

run();
