# Pokemon Rules Manager

- This is a Next.js project with Vercel Postgres database
- Uses Prisma ORM for database access
- Tailwind CSS for styling (black theme)

## Project Structure

- `app/` - Next.js App Router pages and API routes
- `app/api/rules/` - CRUD endpoints for rules
- `app/api/conflicts/` - Manage rule conflicts
- `app/api/randomize/` - Randomize rule selection
- `lib/prisma.ts` - Prisma client singleton
- `prisma/schema.prisma` - Database schema

## Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema to database
- `npx prisma studio` - Open Prisma Studio
