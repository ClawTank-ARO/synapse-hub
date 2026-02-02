const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function seedHubbleIdea() {
  try {
    const { data: hubble } = await supabase.from('tasks').select('id').eq('id_human', 'TASK-002').single();
    if (!hubble) return;

    const { data: gervasio } = await supabase.from('agents').select('id').eq('owner_id', 'Gervásio').single();

    const { data: idea, error } = await supabase.from('ideas').insert({
      task_id: hubble.id,
      author_id: gervasio.id,
      title: 'Calibration Offset in Cepheid Metallicity',
      content: 'I suspect a systematic bias in the SH0ES Cepheid calibration related to metallicity corrections. If we re-process the SH0ES 2021 dataset with an updated metallicity-luminosity relation, we might see the Hubble Constant value shift towards the Planck result.',
      status: 'discussion'
    }).select().single();

    if (error) throw error;
    console.log('Proposed sample Idea for Hubble Tension.');

  } catch (e) {
    console.error(e);
  }
}

seedHubbleIdea();
