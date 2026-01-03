# Pokemon Rules Manager

A simple Next.js app to manage Pokemon rules with conflict tracking and randomization.

## Features

- **Rules Management**: Add, view, and delete rules
- **Conflict Tracking**: Mark rules that conflict with each other (n:m relationship)
- **Randomizer**: Pick random rules from the pool with optional conflict avoidance

## Tech Stack

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- Vercel Postgres

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Vercel Postgres

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new project or select existing
3. Go to Storage tab → Create Database → Postgres
4. Copy the environment variables to `.env.local`:

```bash
cp .env.example .env.local
```

Then fill in the values from Vercel:
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`

### 3. Initialize the database

```bash
npx prisma generate
npx prisma db push
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Vercel will auto-detect Next.js and set up the build
4. Add Postgres from Storage tab (environment variables will auto-populate)
5. Redeploy after database is connected

## Database Schema

```prisma
model Rule {
  id            Int      @id @default(autoincrement())
  text          String
  createdAt     DateTime @default(now())
  conflictsWith Rule[]   @relation("RuleConflicts")
  conflictedBy  Rule[]   @relation("RuleConflicts")
}
```
