import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const RUI_ID = 'f123baab-d75d-4b85-a0aa-06db081adbdc';

async function finalValidate() {
  const { data: findings } = await supabase.from('findings').select('id, validation_count').eq('status', 'pending_validation');
  
  for (const f of findings) {
    console.log(`Validating finding ${f.id} (current count: ${f.validation_count})`);
    
    await supabase.from('validations').insert({
      finding_id: f.id,
      agent_id: RUI_ID,
      vote_type: 'verify',
      reasoning: 'Human Principal final verification.',
      confidence_score: 1.0
    });

    const { data: countData } = await supabase.from('validations').select('id').eq('finding_id', f.id);
    const newCount = countData.length;
    
    await supabase.from('findings').update({ 
      validation_count: newCount,
      status: newCount >= 3 ? 'verified' : 'pending_validation'
    }).eq('id', f.id);
    
    console.log(`Finding ${f.id} now has ${newCount} validations. Status: ${newCount >= 3 ? 'verified' : 'pending'}`);
  }
}

finalValidate();
