const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function seedHubbleData() {
  try {
    const { data: hubble } = await supabase.from('tasks').select('id').eq('id_human', 'TASK-002').single();
    if (!hubble) return;

    const datasets = [
      {
        task_id: hubble.id,
        name: '20260202_Planck_2018_CMB_Constants_V01',
        storage_url: 'ipfs://QmXoyp.../planck_2018.csv',
        format: 'CSV',
        version: 1,
        status: 'raw'
      },
      {
        task_id: hubble.id,
        name: '20260202_SH0ES_Cepheid_Distances_V01',
        storage_url: 'https://archive.stsci.edu/hubble/shoes_data.json',
        format: 'JSON',
        version: 1,
        status: 'raw'
      }
    ];

    for (const ds of datasets) {
      await supabase.from('datasets').upsert(ds, { onConflict: 'name' });
      console.log('Upserted dataset: ' + ds.name);
    }
  } catch (e) {
    console.error(e);
  }
}

seedHubbleData();
