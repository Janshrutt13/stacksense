#StackSense

> **AI-powered career intelligence. Find the tech stack hiring in your city and get a personalized roadmap to land your next role.**

[![Website Status](https://img.shields.io/website?url=https%3A%2F%2Fstacksense-alpha.vercel.app%2F)](https://stacksense-alpha.vercel.app/)

StackSense helps you navigate the ever-changing tech job market. Stop guessing what to learn next. StackSense analyzes real-time market data to tell you exactly which skills are in demand in your city, and uses AI to generate a personalized learning roadmap to help you land your dream job.

[**Live Demo**](https://stacksense-alpha.vercel.app/)

---

## ✨ Key Features

-  **Live Market Snapshot**: Real-time insights into which technologies are currently in demand based on your location.
- **Personalized Roadmaps**: AI-generated, step-by-step learning paths tailored to your current skills and target role.
- **Interactive Career Simulator**: "What If?" scenarios to help you visualize different career paths and the required skills.
- **Comparison Matrix**: See how different tech stacks compare in terms of salary, demand, and learning curve.
- **Secure Authentication**: Built-in secure authentication system to save your roadmaps and progress.
- **Cinematic & Responsive UI**: Beautiful, interactive interface with smooth animations and dark mode out-of-the-box.

---

## 🛠️ Tech Stack

StackSense is built with modern web technologies:

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) & [Lenis](https://lenis.studiofreight.com/) (Smooth Scrolling)
- **AI Integration**: [Vercel AI SDK](https://sdk.vercel.ai/docs) (`@ai-sdk/google`, `ai`) & Google Gemini
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Caching & Rate Limiting**: [Upstash Redis](https://upstash.com/)
- **Authentication**: Custom JWT-based auth (`jose`, `bcryptjs`)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## Getting Started

### Prerequisites

- Node.js 18+ (Node.js 20+ recommended)
- PostgreSQL database
- Upstash Redis account (free tier works)
- Google Gemini API Key

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd stacksense
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or yarn install / pnpm install / bun install
   ```

3. **Set up Environment Variables:**

   Copy the `.env.example` file to `.env` and fill in your actual values:

   ```bash
   cp .env.example .env
   ```

   **Required variables in `.env`:**

   ```env
   # Database URL (PostgreSQL)
   DATABASE_URL="postgresql://user:password@localhost:5432/stacksense"
   
   # Random 32-character string for JWT encryption
   AUTH_SECRET="your-secret-key"
   
   # App URL (usually http://localhost:3000 for local dev)
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   
   # Upstash Redis for caching
   UPSTASH_REDIS_REST_URL="..."
   UPSTASH_REDIS_REST_TOKEN="..."
   
   # Google Gemini API Key for AI features
   GOOGLE_GENERATIVE_AI_API_KEY="..."
   
   # Optional: Apify / RapidAPI / Adzuna for job data
   # (Check .env.example for details)
   ```

4. **Initialize the Database:**

   Run Prisma migrations to set up your database schema:

   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Start the Development Server:**

   ```bash
   npm run dev
   # or yarn dev / pnpm dev / bun dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

##  Project Structure

- `/src/app`: Next.js App Router pages and API routes.
- `/src/components`: Reusable React components (Landing, UI, Forms).
- `/src/lib`: Utility functions, auth logic, and API clients.
- `/prisma`: Database schema and migrations.
- `/public`: Static assets (images, fonts).

---

## 📜 License

This project is licensed under the MIT License.
