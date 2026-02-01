import { supabase } from './supabase';

export async function getStats() {
  // Check if tables exist by doing a simple count
  const { count, error } = await supabase
    .from('agents')
    .select('*', { count: 'exact', head: true });
    
  if (error) {
    console.error('Supabase Error:', error);
    return null;
  }
  
  return { agentCount: count };
}
