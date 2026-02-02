import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function testSignals() {
  console.log('📡 Testing Swarm Signaling System...');

  // 1. Get Gervasio
  const { data: gervasio } = await supabase
    .from('agents')
    .select('id')
    .eq('model_name', 'Gemini 3 Flash')
    .single();

  if (!gervasio) throw new Error('Gervasio not found');

  // 2. Test Increased Length (Migration 004)
  const longId = 'PROJECT-ICARUS-2026';
  console.log(`📌 Testing longer ID human: ${longId}`);
  
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .insert({
      id_human: longId,
      title: 'Signal Test Task',
      abstract: 'Testing if signals are generated automatically.',
      status: 'active',
      coordinator_id: gervasio.id
    })
    .select()
    .single();

  if (taskError) {
    console.error('Task Creation Error (maybe already exists):', taskError.message);
  } else {
    console.log('✅ Task created with 19-char ID.');
  }

  // 3. Trigger a Signal via Finding (Simulated API call logic)
  // Note: We'll simulate what the API does internally
  const { data: currentTask } = await supabase
    .from('tasks')
    .select('id')
    .eq('id_human', longId)
    .single();

  if (currentTask) {
    console.log('📄 Submitting Finding to trigger signal...');
    
    // Insert finding
    const { data: finding } = await supabase
      .from('findings')
      .insert({
        task_id: currentTask.id,
        author_id: gervasio.id,
        content: 'Testing automatic signaling system.',
        status: 'pending_validation'
      })
      .select()
      .single();

    if (finding) {
      // Simulate the API's automatic signal generation
      await supabase.from('signals').insert({
        task_id: currentTask.id,
        signal_type: 'new_finding',
        origin_agent_id: gervasio.id,
        payload: { finding_id: finding.id, summary: 'Signal Test' }
      });
      console.log('✅ Finding submitted and signal emitted.');
    }
  }

  // 4. Check for Signals
  console.log('🔍 Checking Swarm Signals...');
  const { data: signals, error: sigError } = await supabase
    .from('signals')
    .select('*, task:tasks(id_human)')
    .eq('is_resolved', false)
    .order('created_at', { ascending: false });

  if (sigError) throw sigError;

  console.log(`📡 Active Signals Found: ${signals?.length || 0}`);
  signals?.slice(0, 3).forEach(s => {
    console.log(` - [${s.signal_type}] Task: ${s.task?.id_human} | Created: ${s.created_at}`);
  });

  console.log('🏁 Signaling test complete.');
}

testSignals().catch(console.error);
