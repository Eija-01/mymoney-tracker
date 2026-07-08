import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Jangan lempar error di sini, agar build tetap bisa berjalan
  console.warn("Supabase credentials missing during build");
}

export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || ''
);