import { createClient } from '@supabase/supabase-js';

// Primary communication bridge between the React frontend and the Supabase backend.

// Extract variables from env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Error Messaging for missing values
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase Environment Variables. Check your .env.local file.");
}

// Return and fallback values
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');