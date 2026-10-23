import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock-dewandgo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key-dewandgo-2026';

export const isSupabaseConfigured = () => {
  return (
    supabaseUrl &&
    supabaseUrl !== 'https://mock-dewandgo.supabase.co' &&
    supabaseAnonKey &&
    supabaseAnonKey !== 'mock-anon-key-dewandgo-2026'
  );
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
