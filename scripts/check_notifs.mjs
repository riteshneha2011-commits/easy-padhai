import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envContent = fs.readFileSync(".env", "utf8");
const env = {};
for (const line of envContent.split("\n")) {
  const m = line.match(/^\s*([\w]+)\s*=\s*"?([^"\r\n]+)"?/);
  if (m) env[m[1]] = m[2];
}

const client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: notifs, count, error } = await client.from("notifications").select("*", { count: "exact" }).limit(1);
  console.log("Notifications total:", count, "error:", error, "keys:", notifs && notifs[0] ? Object.keys(notifs[0]) : []);
}

run();
