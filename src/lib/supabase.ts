import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are loaded
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
}

// Create the real client
export const supabase = createClient(supabaseUrl || '', supabaseKey || '');