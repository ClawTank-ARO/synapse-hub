import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const rawServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Cleanup the key (Vercel/Copy-Paste often adds quotes or spaces)
const supabaseServiceKey = rawServiceKey?.replace(/['"]+/g, '').trim();

// Public client (Respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client (Bypasses RLS - Server Side Only)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase; 
