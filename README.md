AI Mini-SaaS: Smart Task Evaluator 🚀A production-ready SaaS application that evaluates code quality using Gen-AI. Users can upload code snippets to receive instant feedback on bugs, performance issues, and security vulnerabilities. Detailed refactoring and reports are gated behind a payment wall, simulated via Stripe.🌟 FeaturesAuthentication: Secure Email/Password login via Supabase Auth.AI Code Analysis:Powered by Google Gemini (Multi-model fallback: Flash → Pro → 1.0).Evaluates Score (0-100), Strengths, Weaknesses, and Refactored Code.Robust error handling and JSON parsing.Payment Gating:Reports are locked by default.Stripe Checkout integration (Test Mode) to unlock full analysis.Database:PostgreSQL via Supabase.RLS (Row Level Security) enabled for data privacy.Performance: Built with Vite + React + TypeScript for near-instant load times.🛠️ Tech StackFrontend: React, TypeScript, Vite, Tailwind CSS, Lucide Icons.Backend: Supabase (Auth, Database, Edge Functions).AI: Google Gemini API (gemini-1.5-flash, gemini-1.5-pro).Payments: Stripe API.🚀 Setup & Installation1. Clone the Repositorygit clone [https://github.com/yourusername/ai-task-evaluator.git](https://github.com/yourusername/ai-task-evaluator.git)
cd ai-task-evaluator
npm install
2. Environment VariablesCreate a .env file in the root directory:VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
3. Supabase SetupCreate a new project on Supabase.Run the SQL script provided in supabase/schema.sql (or see below) to create tables (profiles, tasks, payments) and enable RLS.Deploy Edge Functions:npx supabase login
npx supabase functions deploy evaluate-task
npx supabase functions deploy create-payment
Set Secrets in Supabase Dashboard or CLI:npx supabase secrets set GEMINI_API_KEY=AIzaSy...
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_...
4. Run Locallynpm run dev
📂 Project Structuresrc/
├── components/   # Reusable UI (Navbar, Buttons)
├── lib/          # Supabase client setup
├── pages/        # Dashboard, Evaluate, Login, Report
├── types/        # TypeScript interfaces
supabase/
└── functions/
    ├── evaluate-task/  # AI Analysis (Gemini)
    └── create-payment/ # Stripe Checkout
🔒 Security & ArchitectureEdge Functions: API keys (Gemini, Stripe) are never exposed to the client. They live securely in Supabase Edge Functions (Deno).RLS: Database policies ensure users can strictly access only their own data.CORS: Functions are configured to accept requests only from the authorized frontend.📸 Screenshots(Add screenshots of your Dashboard, Locked Report, and Unlocked Report here)