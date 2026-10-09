import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Load environment variables if running locally
let supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
let supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  try {
    if (fs.existsSync(".env")) {
      const envContent = fs.readFileSync(".env", "utf8");
      for (const line of envContent.split("\n")) {
        const m = line.match(/^\s*([\w]+)\s*=\s*"?([^"\r\n]+)"?/);
        if (m) {
          if (m[1] === "VITE_SUPABASE_URL" || m[1] === "SUPABASE_URL") supabaseUrl = m[2];
          if (m[1] === "VITE_SUPABASE_PUBLISHABLE_KEY") supabaseKey = m[2];
        }
      }
    }
  } catch {
    /* ignore */
  }
}

// Fallback to active project URL if missing in environment
supabaseUrl = supabaseUrl || "https://bykqlnoftmqclyrtjiyp.supabase.co";

if (!supabaseKey) {
  console.error("❌ Error: Supabase API key not provided.");
  process.exit(1);
}

const client = createClient(supabaseUrl, supabaseKey);

async function keepAlive() {
  const start = Date.now();
  console.log(`[Supabase Keep-Alive] Pinging ${supabaseUrl} at ${new Date().toISOString()}...`);

  // Query 1 row from subjects table to wake up / keep Postgres active
  const { data, error } = await client
    .from("subjects")
    .select("id, name")
    .limit(1);

  const duration = Date.now() - start;

  if (error) {
    console.error(`❌ Keep-alive query failed (${duration}ms):`, error.message);
    process.exit(1);
  }

  console.log(`✅ Supabase is ACTIVE! Query executed in ${duration}ms. Sample record:`, data);
  process.exit(0);
}

keepAlive();
