# Easy Padhai — Master Project & Agent Handover Context

> **Last Updated:** September 2026  
> **Purpose:** This file contains the complete, authoritative operational context, architecture, links, credentials reference, and development rules for **Easy Padhai**. Any new AI chat session or developer must read this file first.

---

## 1. Quick Links & Services

| Service | Details / URL | Notes |
| :--- | :--- | :--- |
| **Live App (Production)** | [https://ep.studytube.co.in](https://ep.studytube.co.in) | Auto-deploys on push to `main` via Vercel |
| **GitHub Repository** | [https://github.com/riteshneha2011-commits/easy-padhai.git](https://github.com/riteshneha2011-commits/easy-padhai.git) | Default working branch: `main` |
| **Supabase Project** | [https://supabase.com/dashboard/project/bykqlnoftmqclyrtjiyp](https://supabase.com/dashboard/project/bykqlnoftmqclyrtjiyp) | Ref: `bykqlnoftmqclyrtjiyp` |
| **Supabase API URL** | `https://bykqlnoftmqclyrtjiyp.supabase.co` | Set in `.env` |
| **Cloudflare R2 Bucket** | `easypadhai-media` | Public CDN: `https://pub-5b335ec07c414198abab2b3fd75d60cd.r2.dev` |
| **AI LLM API** | Google AI Studio (Gemini 2.5) | Key configured in `.env` (`GEMINI_API_KEY`) |

---

## 2. Platform Admins & Roles

The platform recognizes these primary owner/admin accounts with full staff and administrative access across `/admin` and `/teach`:
- **ritesh.bhopal@gmail.com** (Owner / Super-Admin)
- **agarwalriteshai@gmail.com** (Co-Owner / Admin)

Role hierarchy: `admin` > `teacher` > `student`. Both owners have `role = 'admin'` in the `profiles` table.

---

## 3. Technology Stack & Architecture

- **Framework:** TanStack Start (Vite + Nitro SSR + TanStack Router)
- **Language & Runtime:** TypeScript (Strict), Node.js (ESM, "type": "module")
- **State & Server Fns:** TanStack Query + TanStack Start `createServerFn`
- **Database & Auth:** Supabase (PostgreSQL with RLS, Auth, Service Role Server Client)
- **Storage:** Cloudflare R2 (S3-compatible via AWS SDK v3)
- **Styling & UI:** Tailwind CSS, Radix UI primitives, Lucide Icons, Sonner (Toasts), Canvas-Confetti, KaTeX (Math rendering)

---

## 4. Key Systems & Features Built

### 4.1. Teacher Studio (`/teach`)
- **Curriculum Management:** Create/edit/delete Classes (9, 10, 11, 12), Subjects, Chapters, Lessons.
- **Scheduled Lecture Releases (Drip Content Engine):**
  - Segmented modes: **Publish Now**, **Schedule Later**, **Save as Draft**.
  - Always uses Indian Standard Time (IST, `Asia/Kolkata`, UTC+05:30) via `src/lib/schedule.ts`.
  - Date picker uses `toLocalDateTimeInputString` and inputs are normalized via `localDateTimeToIso`.
- **Media Uploads:** Audio, Video (YouTube/MP4/R2), PDF Notes, and Markdown/AI bullet summaries.
- **AI Quiz Builder:** Auto-generates MCQs from chapter/lesson topics, supports JSON and Markdown batch imports.

### 4.2. Admin & Growth Hub (`/admin`)
- **Learner Intelligence Center:**
  - View full user profile: Name, phone, email, board, city/state, school, dream goal, referrals.
  - Direct 1-tap **"WhatsApp Student"** chat button (`wa.me/...`).
  - 6 Key Metrics: Current Credits, Spent Credits, Total XP, Streak (current + max), Study Time (minutes + active days), Lessons Completed, Quizzes Taken.
  - 4 Activity Tabs:
    1. **Unlocked Lectures:** Detailed title, subject, chapter, media type (audio/video/pdf/summary), cost in credits, timestamp.
    2. **Completed Lessons:** All finished lectures with chapter context.
    3. **Quizzes & Tests:** Exact score (e.g. 8/10), percentage, Pass/Needs Review badges.
    4. **Wallet History:** Full audit trail with deltas (+/-) and timestamps.
- **Viral Micro-Challenges Hub:**
  - 1-click **⚡ Daily Challenge** generator (selects from 760+ questions bank).
  - Custom challenge builder by Class/Subject/Chapter.
  - 3 pre-written high-converting viral copy templates with WhatsApp share buttons.
  - Student Leads CRM with 1-tap follow-up chat.

### 4.3. Frictionless Micro-Challenges (`/c/:code`)
- Zero login barrier: Learners enter **Full Name** + **10-digit WhatsApp number** to start.
- 5 fast MCQs with 120-second live timer.
- **Economics:**
  - Score >= 80%: **10 Credits** (1 free lecture unlock) + **30 XP**.
  - Score >= 50%: **5 Credits** + **15 XP**.
  - Score < 50%: **0 Credits** + **5 Participation XP**.
- Anti-farming: 1 reward per challenge per phone. Unregistered guests capped at 20 credits max.
- **Leaderboard Isolation:** `/leaderboard` strictly filters only signed-in learners (`onboarding_completed: true`). Guests do not crowd out registered learners.

### 4.4. Student Classroom (`/learn/:slug`)
- Complete chapter syllabus playlist.
- Lesson 1 of every chapter is free; subsequent lessons require 10 credits.
- Scheduled lectures show premiere countdown cards with teaser badge: *"⏳ Unlocks [Date, Time]"*.
- Teachers/admins have *"Teacher Early Access Preview"* banner to review media early.
- Offline Notes: IndexedDB storage for audio and PDF with mobile-compatible fallback reader.

---

## 5. Critical Development Guidelines & Quality Protocols

### The "No-Crash" Quality Protocol
1. **Vite Does Not Typecheck During Build:** `npm run build` runs `vite build` which only transpiles code with esbuild. It **WILL NOT** fail on missing imports or undefined variables (such as missing `cn` or `Link`).
2. **ALWAYS run `npx tsc --noEmit`:** Before pushing any changes, run `npx tsc --noEmit` to verify that there are no syntax errors, missing imports, or type mismatches in modified files.
3. **Timezone Rule:** Easy Padhai operates in India. All scheduled dates must be parsed and displayed in **Indian Standard Time (Asia/Kolkata, UTC+05:30)** using the helpers in `src/lib/schedule.ts`. Never pass raw datetime strings without timezone to server functions.
4. **PowerShell Path Escaping:** Because TanStack Router uses routes like `learn.$slug.tsx` and `test.$testId.tsx`, PowerShell will try to treat `$slug` as a shell variable. Always wrap paths in single quotes when using git in PowerShell:
   ```powershell
   git add 'src/routes/learn.$slug.tsx'
   ```
   or use directory staging: `git add src/`.
5. **Clean Git Commits:** Write concise, descriptive commit messages following the Conventional Commits format (e.g. `feat: ...`, `fix: ...`). Always push to `origin main`.
