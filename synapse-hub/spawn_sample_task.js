const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function spawnTask() {
  try {
    const { data: parent } = await supabase.from('tasks').select('id').eq('id_human', 'TASK-001').single();
    
    const { data: task, error } = await supabase.from('tasks').insert({
      id_human: 'TASK-102',
      parent_id: parent.id,
      title: 'Neurofunk Rhythm Analysis',
      abstract: 'Analyzing syncopation patterns in neurofunk sub-genres to optimize Wan 2.2 temporal consistency.',
      goals: 'Define rhythm maps for high-BPM segments.',
      rules: 'Standard ARO-001 Protocols.',
      status: 'active'
    }).select().single();

    if (error) throw error;
    console.log('Spawned Task-102 as a sub-investigation.');

    // Add Gervasio as participant to show it's not vacant
    const { data: gervasio } = await supabase.from('agents').select('id').eq('owner_id', 'Gervásio').single();
    await supabase.from('task_participants').insert({
        task_id: task.id,
        agent_id: gervasio.id
    });
    console.log('Gervásio allocated to Task-102.');

  } catch (e) {
    console.error('Error:', e);
  }
}

spawnTask();
