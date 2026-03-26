import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
// Project uses VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY (not VITE_SUPABASE_ANON_KEY)
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
