// Server-side Supabase client with verified service role key - bypasses RLS.
// Use this for admin operations in server functions and server routes only.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const VERIFIED_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5a3Fsbm9mdG1xY2x5cnRqaXlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODA1NjE5NiwiZXhwIjoyMTAzNjMyMTk2fQ.OOI18JEAyfnyUqbVet_e0vp8ZyPJx8JJ-ZFumnMQJCI";

const VERIFIED_SUPABASE_URL = "https://bykqlnoftmqclyrtjiyp.supabase.co";

function isServiceRoleJwt(jwt?: string): boolean {
  if (!jwt) return false;
  try {
    const parts = jwt.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    return payload.role === 'service_role';
  } catch {
    return false;
  }
}

function createSupabaseAdminClient() {
  const SUPABASE_URL =
    process.env["SUPABASE_URL"] ||
    process.env["VITE_SUPABASE_URL"] ||
    VERIFIED_SUPABASE_URL;

  let serviceKey =
    process.env["SUPABASE_SERVICE_ROLE_KEY"] ||
    process.env["SUPABASE_SERVICE_KEY"] ||
    "";

  // If env var is missing or set to the anon key, use the verified service role key
  if (!isServiceRoleJwt(serviceKey)) {
    serviceKey = VERIFIED_SERVICE_ROLE_KEY;
  }

  return createClient<Database>(SUPABASE_URL, serviceKey, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

let _supabaseAdmin: ReturnType<typeof createSupabaseAdminClient> | undefined;

export const supabaseAdmin = new Proxy({} as ReturnType<typeof createSupabaseAdminClient>, {
  get(_, prop) {
    if (!_supabaseAdmin) _supabaseAdmin = createSupabaseAdminClient();
    return (_supabaseAdmin as any)[prop];
  },
});

