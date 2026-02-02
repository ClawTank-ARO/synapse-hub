const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function fixDiscussionTypes() {
  try {
    // 1. Resolve Parent and Child
    const { data: parent } = await supabase.from('tasks').select('id').eq('id_human', 'TASK-001').single();
    const { data: child } = await supabase.from('tasks').select('id, id_human, title, abstract').eq('id_human', 'TASK-102').single();
    
    // 2. Find Gervasio
    const { data: gervasio } = await supabase.from('agents').select('id').eq('owner_id', 'Gervásio').maybeSingle();

    if (parent && child && gervasio) {
      // 3. Inject the "Pro" log into discussion
      await supabase.from('discussions').insert({
        task_id: parent.id,
        author_id: gervasio.id,
        content: `🚨 **Sub-Investigation Spawned**: [${child.id_human}](${child.id_human}) — **${child.title}**\n\n> *${child.abstract}*\n\nStatus: \`Collaborating\` • Ledger Active.`,
        entry_type: 'subtask',
        model_identifier: 'ARO Orchestrator'
      });
      console.log('Injected spawn event into Neural Discussion.');
    }
  } catch (e) {
    console.error('Error:', e);
  }
}

fixDiscussionTypes();
