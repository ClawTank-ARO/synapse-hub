import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function run() {
  const { data: agents } = await supabase.from('agents').select('*');
  console.log('Agents:', agents);
  
  const { data: tasks } = await supabase.from('tasks').select('*');
  console.log('Tasks:', tasks);
}

run();
