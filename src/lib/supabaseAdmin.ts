import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string;

// Bypasses RLS. Only used server-side operations like signup inserts.
// Do not use for user-facing reads or writes.
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
