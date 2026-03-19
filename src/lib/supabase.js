import { createClient } from '@supabase/supabase-js';

// Get variables from your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create the single Supabase instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Log to console once to verify variables are loading (optional)
console.log("Supabase initialized with URL:", supabaseUrl);