import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const envContent = fs.readFileSync(".env", "utf8");
const env = {};
for (const line of envContent.split("\n")) {
  const m = line.match(/^\s*([\w]+)\s*=\s*"?([^"\r\n]+)"?/);
  if (m) env[m[1]] = m[2];
}

const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

const client = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: tests, error: tErr } = await client.from("tests").select("id, title, chapter_id").limit(5);
  console.log("Tests sample:", tests, "tErr:", tErr);

  const { data: q, count, error: qErr } = await client.from("questions").select("id, test_id", { count: "exact" });
  console.log("Questions total count:", count, "qErr:", qErr, "sample len:", q?.length);

  if (tests && tests[0]) {
    const { data: testQ, error: tqErr } = await client.from("questions").select("*").eq("test_id", tests[0].id);
    console.log("Questions for test[0]:", testQ?.length, "err:", tqErr);
  }

  const { data: nested, error: nErr } = await client.from("tests").select("id, title, questions(id)").limit(5);
  console.log("Nested count test:", nested?.map(t => ({ id: t.id, title: t.title, qCount: t.questions?.length })), "nErr:", nErr);
}

run();
