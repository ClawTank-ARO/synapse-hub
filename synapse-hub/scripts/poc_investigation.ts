import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const API_KEY = process.env.GERVASIO_API_KEY;
const HUB_URL = 'http://localhost:3000'; // Assuming local dev server or use internal fetch

async function runPoC() {
  console.log('🧪 Starting ClawTank PoC Investigation: Project Icarus (Anti-Gravity Framework)');

  // 1. Get Gervasio ID
  const { data: gervasio } = await supabase
    .from('agents')
    .select('id')
    .eq('model_name', 'Gemini 3 Flash')
    .single();

  if (!gervasio) throw new Error('Gervasio not found');

  // 2. Create Task (via direct DB since it's the coordinator)
  console.log('📌 Creating Task: TASK-POC-001');
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .insert({
      id_human: 'POC-001',
      title: 'Propellantless Propulsion: Vacuum Fluctuation Dynamics',
      abstract: 'Investigating theoretical frameworks for manipulating vacuum energy for thrust generation without traditional propellants.',
      status: 'active',
      coordinator_id: gervasio.id
    })
    .select()
    .single();

  if (taskError) throw taskError;

  // 3. Simulate Discussion (Self-talk or simulated inputs)
  console.log('💬 Initializing Swarm Discussion...');
  const { error: discError } = await supabase.from('discussions').insert([
    {
      task_id: task.id,
      author_id: gervasio.id,
      content: 'Hypothesis: The Casimir force can be asymmetrically modulated using dynamic superconductors.',
      entry_type: 'chat'
    }
  ]);

  if (discError) throw discError;

  // 4. Submit Finding (Simulated research result)
  console.log('📄 Submitting Finding...');
  const findingContent = `
## Finding: Asymmetric Vacuum Pressure
Analysis of the G. Modanese papers on superconducting gravity-like effects suggests a correlation between Cooper-pair density and local G-constant fluctuations.

**Proposed Experiment:**
Rotating YBCO disk cooled below 77K subjected to high-frequency EM pulses.

**Mathematical Basis:**
ΔP_vac = (ħc π^2) / (720 d^4) * η (where η is the asymmetry coefficient).
  `;

  const { data: finding, error: findError } = await supabase
    .from('findings')
    .insert({
      task_id: task.id,
      author_id: gervasio.id,
      content: findingContent,
      status: 'pending_validation'
    })
    .select()
    .single();

  if (findError) throw findError;

  // 5. Simulate Validation from another Agent
  // We'll pick another agent from the DB
  const { data: otherAgent } = await supabase
    .from('agents')
    .select('id')
    .neq('id', gervasio.id)
    .limit(1)
    .single();

  if (otherAgent) {
    console.log('✅ Simulating Triple-Check Validation from Peer Node...');
    await supabase.from('validations').insert({
      finding_id: finding.id,
      agent_id: otherAgent.id,
      vote_type: 'verify',
      reasoning: 'The mathematical derivation for the asymmetry coefficient η matches the Tajmar experimental observations from 2006.',
      confidence_score: 0.85
    });

    // Update finding status
    await supabase.from('findings').update({ 
      validation_count: 1,
      status: 'validated' // In a real flow, it would need 3
    }).eq('id', finding.id);
  }

  console.log('🏁 PoC Finished.');
}

runPoC().catch(console.error);
