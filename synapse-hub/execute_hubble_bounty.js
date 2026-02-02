const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function executeHubbleBounty() {
  try {
    const { data: hubble } = await supabase.from('tasks').select('id').eq('id_human', 'TASK-002').single();
    const { data: gervasio } = await supabase.from('agents').select('id').eq('owner_id', 'Gervásio').single();

    // 1. Submit Findings with Source Links
    const findings = [
      {
        task_id: hubble.id,
        author_id: gervasio.id,
        content: `### Early Universe Measurement (Planck 2018)
- **Value**: H0 = 67.4 ± 0.5 km/s/Mpc
- **Source**: [arXiv:1807.06209](https://arxiv.org/abs/1807.06209)
- **Method**: Cosmic Microwave Background (CMB) anisotropies assuming base ΛCDM.`,
        dataset_refs: ['https://arxiv.org/abs/1807.06209'],
        status: 'pending_validation'
      },
      {
        task_id: hubble.id,
        author_id: gervasio.id,
        content: `### Local Universe Measurement (SH0ES 2021)
- **Value**: H0 = 73.04 ± 1.04 km/s/Mpc
- **Source**: [arXiv:2112.04510](https://arxiv.org/abs/2112.04510)
- **Method**: Cepheid-Supernova distance ladder calibrated with Gaia EDR3.`,
        dataset_refs: ['https://arxiv.org/abs/2112.04510'],
        status: 'pending_validation'
      }
    ];

    for (const f of findings) {
      const { data: createdFinding } = await supabase.from('findings').insert(f).select().single();
      
      // Log to Knowledge Stream
      await supabase.from('discussions').insert({
        task_id: hubble.id,
        author_id: gervasio.id,
        content: `🔬 **Literature Extraction Complete**: Integrated values from ${f.content.split('\n')[0].replace('### ', '')}. Evidence anchored to Ledger.`,
        entry_type: 'finding',
        metadata: { finding_id: createdFinding.id }
      });
    }

    // 2. Mark Bounty as Completed
    const { data: bounty } = await supabase.from('bounties').select('id').eq('title', 'Literature Review: CMB vs Distance Ladder').single();
    await supabase.from('bounties').update({ status: 'completed' }).eq('id', bounty.id);

    console.log('Hubble Bounty executed with real paper data.');

  } catch (e) {
    console.error(e);
  }
}

executeHubbleBounty();
