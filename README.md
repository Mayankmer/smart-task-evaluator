Here’s a **clean, professional, GitHub-ready README**, fully reformatted and structured:

---

# 🚀 AI Mini-SaaS: Smart Task Evaluator

A production-ready mini SaaS application that evaluates code quality using Generative AI.
Users can upload code snippets to receive instant feedback on bugs, performance issues, and security vulnerabilities.
Detailed reports and full refactoring are gated behind a simulated Stripe payment flow.

---

## 🌟 Features

### 🔐 Authentication

* Secure Email/Password login via **Supabase Auth**

### 🤖 AI Code Analysis

* Powered by **Google Gemini API**
* Multi-model fallback: **Flash → Pro → 1.0**
* Outputs:

  * Quality Score (0–100)
  * Strengths & Weaknesses
  * Bug & Security detection
  * Refactored Code
* Robust JSON parsing + error handling

### 💳 Payment Gating

* Reports are locked by default
* **Stripe Checkout (Test Mode)** used to unlock full analysis

### 🗄️ Database

* **PostgreSQL via Supabase**
* **Row Level Security (RLS)** enabled

### ⚡ Performance

* Built using **Vite + React + TypeScript**
* Instant load times with client-optimized bundling

---

## 🛠️ Tech Stack

**Frontend:**

* React
* TypeScript
* Vite
* Tailwind CSS
* Lucide Icons

**Backend:**

* Supabase (Auth, DB, Edge Functions)

**AI:**

* Google Gemini (gemini-2.5-flash-lite, gemini-2.5-flash, gemini-2.5-pro)

**Payments:**

* Stripe API (Test Mode)

---

## 🚀 Setup & Installation

### **1. Clone the Repository**

```bash
git clone git@github.com:Mayankmer/smart-task-evaluator.git
cd smart-task-evaluator
npm install
```

### **2. Environment Variables**

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **3. Supabase Setup**

1. Create a new Supabase project
2. Run the SQL in `supabase/schema.sql` to create:

   * `profiles`
   * `tasks`
   * `payments`
   * Enable RLS policies
3. Deploy Edge Functions:

```bash
npx supabase login
npx supabase functions deploy evaluate-task
npx supabase functions deploy create-payment
```

4. Set Secrets:

```bash
npx supabase secrets set GEMINI_API_KEY=AIzaSy...
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_...
```

### **4. Run Locally**

```bash
npm run dev
```

---

## 📂 Project Structure

```
src/
 ├── components/       # Reusable UI (Navbar, Buttons, Cards)
 ├── lib/              # Supabase client
 ├── pages/            # Dashboard, Login, Evaluate, Report
 ├── types/            # TypeScript interfaces

supabase/
 └── functions/
      ├── evaluate-task/   # Gemini-based AI Analysis
      └── create-payment/  # Stripe Checkout Session
```

---

## 🔒 Security & Architecture

### Edge Functions

* API keys (Gemini, Stripe) stay server-side
* Functions run in secure Deno runtime

### RLS (Row Level Security)

* Users can only access their own tasks & reports

### CORS

* Functions restricted to allowed frontend origins

---

