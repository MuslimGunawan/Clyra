import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tcxrgpbsszlbcsjkfisa.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjeHJncGJzc3psYmNzamtmaXNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NTgzNTUsImV4cCI6MjEwMzQzNDM1NX0.lDbj_cZhkghyPjrUZ03AM9oTMRle73ePyt-XB2o3MOE";

// Public Supabase Client (safe for browser client components)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server Admin Supabase Client (bypasses RLS, used exclusively in API Route handlers)
export function getServiceSupabase() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
