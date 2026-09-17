// Server-side Supabase client with verified service role key - bypasses RLS.
// Use this for admin operations in server functions and server routes only.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const DEFAULT_SUPABASE_URL = "https://bykqlnoftmqclyrtjiyp.supabase.co";

function isServiceRoleKey(key?: string): boolean {
  if (!key) return false;
  if (key.startsWith('sb_secret_')) return true;
  try {
    const parts = key.split('.');
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
    DEFAULT_SUPABASE_URL;

  const serviceKey =
    process.env["SUPABASE_SERVICE_ROLE_KEY"] ||
    process.env["SUPABASE_SERVICE_KEY"] ||
    "";

  if (!serviceKey) {
    const message =
      "Supabase Service Role Key is missing. Please set SUPABASE_SERVICE_ROLE_KEY in your environment variables (e.g. Vercel Project Settings or .env).";
    console.error(`[Supabase Admin] ${message}`);
    throw new Error(message);
  }

  if (!isServiceRoleKey(serviceKey)) {
    console.warn(
      "[Supabase Admin] WARNING: SUPABASE_SERVICE_ROLE_KEY does not appear to be a service_role key. Ensure it is configured correctly in your environment variables."
    );
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

