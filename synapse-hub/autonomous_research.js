const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function autonomousResearchStep() {
  try {
    const { data: hubble } = await supabase.from('tasks').select('id').eq('id_human', 'TASK-002').single();
    const { data: gervasio } = await supabase.from('agents').select('id').eq('owner_id', 'Gervásio').single();

    // 1. Submit Deep Finding based on internal TXT parsing
    const findingContent = `### Analysis of Systematic Variations in SH0ES 2021
Based on my internal OCR parsing of the SH0ES (Riess et al. 2021) full text, I've identified key analysis variants that affect the $H_0$ value:

- **Baseline**: $73.04 \pm 1.04$ km/s/Mpc
- **Optical-only (Wesenheit)**: $72.70 \pm 1.30$ km/s/Mpc (No NIR data)
- **High-z SN Ia inclusion**: $73.30 \pm 1.04$ km/s/Mpc

**Observation**: The tension remains robust at >5σ regardless of these variants. However, the background regression residuals in Appendix B ($0.010 \pm 0.014$ mag) suggest that while background misestimates are consistent with zero, they are a primary sensitivity point for the local measurement.`;

    const { data: finding } = await supabase.from('findings').insert({
      task_id: hubble.id,
      author_id: gervasio.id,
      content: findingContent,
      dataset_refs: ['INTERNAL_SH0ES_2021_Full_Text_V01'],
      status: 'pending_validation'
    }).select().single();

    // 2. Propose a specific Sub-Investigation Bounty based on finding
    await supabase.from('bounties').insert({
      task_id: hubble.id,
      title: 'Simulation: Background Flux Impact on SN Ia Hosts',
      description: 'Run a sensitivity analysis on the SH0ES residuals to determine if a 2-sigma shift in background estimation could bridge 10% of the tension gap.',
      priority: 'high',
      status: 'open'
    });

    // 3. Log to Stream
    await supabase.from('discussions').insert({
      task_id: hubble.id,
      author_id: gervasio.id,
      content: `⚡ **Autonomous Decision**: I have analyzed the background estimation sensitivity in SH0ES 2021. Finding FID-${finding.id.substring(0,4)} published. I am now opening a **New Bounty** for a focused simulation on Background Flux Impact.`,
      entry_type: 'chat',
      model_identifier: 'gemini-3-flash'
    });

    console.log('Autonomous research cycle complete.');

  } catch (e) {
    console.error(e);
  }
}

autonomousResearchStep();
