# Easy Padhai - Project Connections & Database Reference

> ⚠️ **CRITICAL INSTRUCTION FOR ALL AGENTS & DEVELOPERS:**
> **DO NOT USE SUPABASE MCP TOOLS.**
> The Supabase MCP server is linked to an outdated/wrong test project (`sfjkhwauadkomcesyobb`).
> **NEVER** run queries or commands through Supabase MCP.
> Always connect using the official project credentials stored in `.env` or run Node.js verification scripts via `@supabase/supabase-js`.

---

## 1. Supabase (Primary Database & Auth)

- **Project ID**: `bykqlnoftmqclyrtjiyp`
- **Project URL**: `https://bykqlnoftmqclyrtjiyp.supabase.co`
- **Client Anon Key**: Stored in `.env` as `VITE_SUPABASE_PUBLISHABLE_KEY`
- **Service Role Secret Key**: Stored in `.env` as `SUPABASE_SERVICE_ROLE_KEY`

### Direct Node Verification Pattern
To inspect or query the database safely without MCP:
```js
import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Reads credentials securely from .env
const env = Object.fromEntries(
  fs.readFileSync(".env", "utf8")
    .split("\n")
    .map((l) => l.match(/^\s*([\w]+)\s*=\s*"?([^"\r\n]+)"?/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]])
);

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
```

---

## 2. Cloudflare R2 Storage (Media, Audios, Notes)

- **Account ID**: `91967d91c37ef6aff74bb4addb0ee6ea`
- **Bucket Name**: `easypadhai-media`
- **Public CDN URL**: `https://pub-5b335ec07c414198abab2b3fd75d60cd.r2.dev`
- **R2 Access Keys**: Stored in `.env` as `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY`

---

## 3. Google Gemini AI API

- **API Key**: Stored in `.env` as `GEMINI_API_KEY`

---

## 4. Production Deployment & URLs

- **Live URL**: `https://ep.studytube.co.in`
- **Repository Branch**: `main` (auto-deploys to Vercel on git push)
- **Local Build Verification Command**:
  ```powershell
  $env:VERCEL="1"; npm run build
  ```
