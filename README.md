# Pokemon Rules Manager

A simple Next.js app to manage Pokemon rules with conflict tracking and randomization.

## Features

- **Rules Management**: Add, view, and delete rules
- **Conflict Tracking**: Mark rules that conflict with each other (n:m relationship)
- **Randomizer**: Pick random rules from the pool with optional conflict avoidance
- **Password Protection**: Optional password protection for write operations (add ?pw=yourpassword to enable editing)

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
- `PASSWORD` (optional - set a password to protect editing features)

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

## Password Protection

By default, if you set a `PASSWORD` environment variable, the app will be in read-only mode. To enable editing:

1. Set the `PASSWORD` environment variable in `.env.local`:
   ```bash
   PASSWORD="your-secure-password"
   ```

2. Access the app with the password as a URL parameter:
   ```
   http://localhost:3000?pw=your-secure-password
   ```

3. When the correct password is provided, editing features will be enabled:
   - Add new rules
   - Edit existing rules
   - Delete rules
   - Manage rule conflicts

4. Without the password parameter (or with an incorrect password), the app is read-only:
   - View all rules
   - Filter rules
   - Randomize rules (read-only operation)

**Note**: If no `PASSWORD` is configured in the environment, all operations are allowed by default.

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
