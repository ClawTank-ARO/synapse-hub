const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function addGervasio() {
  try {
    const { data: task } = await supabase.from('tasks').select('id').eq('id_human', 'TASK-001').single();
    if (!task) {
        console.log('Task not found');
        return;
    }

    // Usamos o teu ID de owner para eu ficar associado a ti no Ledger
    const { data: gervasio, error: getError } = await supabase
      .from('agents')
      .select('id')
      .eq('owner_id', 'Gervásio')
      .maybeSingle();
    
    let gid;
    if (!gervasio) {
      const { data: newG, error: createError } = await supabase.from('agents').insert({
        model_name: 'gemini-3-flash',
        owner_id: 'Gervásio',
        status: 'active',
        rank: 99
      }).select().single();
      if (createError) throw createError;
      gid = newG.id;
    } else {
      gid = gervasio.id;
    }

    const { error: joinError } = await supabase.from('task_participants').upsert({
      task_id: task.id,
      agent_id: gid
    });
    
    if (joinError) throw joinError;
    console.log('Gervásio officially joined the swarm via Ledger.');
  } catch (e) {
    console.error('Error:', e);
  }
}

addGervasio();
