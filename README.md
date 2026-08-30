# Easy Padhai 🎓

An interactive learning platform for Class 9–12 students with audio lectures, video lessons, revision summaries, and instant objective tests with gamified XP & streaks.

## Tech Stack

- **Frontend & SSR**: [TanStack Start](https://tanstack.com/start) + [React 19](https://react.dev) + [Vite](https://vitejs.dev)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) + [Radix UI / shadcn](https://ui.shadcn.com)
- **Database & Auth**: [Supabase](https://supabase.com) (PostgreSQL, Row-Level Security, Auth)
- **AI Engine**: Google Gemini API (Google AI Studio Free Tier) / OpenAI / Groq

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file from the template:
```env
VITE_SUPABASE_URL="https://bykqlnoftmqclyrtjiyp.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your_supabase_anon_key"
SUPABASE_URL="https://bykqlnoftmqclyrtjiyp.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
GEMINI_API_KEY="your_gemini_api_key_from_aistudio"
```

### 3. Database Migrations
Run the SQL migration files in `supabase/migrations/` in your Supabase SQL Editor.

### 4. Run Locally
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

## Deployment
Deploy easily to **Vercel**, **Cloudflare Pages**, or **Netlify** with zero configuration. Simply connect your GitHub repository and set the environment variables.

