Reno Rangers CRM — a full-stack construction/renovation project management app built with Next.js (App Router), Prisma, and PostgreSQL (Supabase in production).

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up your environment variables:

   ```bash
   cp .env.example .env
   ```

   At minimum, `DATABASE_URL` and `DIRECT_URL` must point at a reachable Postgres
   database (see the comments in `.env.example` and in `prisma/schema.prisma`
   for what each variable does). For local development you can point both at
   the same local Postgres instance, e.g.:

   ```bash
   createuser -s renorangers
   createdb reno_rangers_crm -O renorangers
   ```

   ```
   DATABASE_URL="postgresql://renorangers@localhost:5432/reno_rangers_crm?schema=public"
   DIRECT_URL="postgresql://renorangers@localhost:5432/reno_rangers_crm?schema=public"
   ```

   `SUPABASE_URL` / `SUPABASE_ANON_KEY` are only needed for the document/photo
   upload features (`src/lib/supabaseStorage.ts`) and can be left unset for
   local development of everything else.

3. Apply database migrations:

   ```bash
   npx prisma migrate deploy
   ```

4. (Optional) Seed demo data — users, projects, tasks, invoices, etc.:

   ```bash
   npm run db:seed
   ```

   This creates one demo user per role, all with the password `demo1234`
   (e.g. `admin@renorangers.nl` / `demo1234`). The login page lists all demo
   accounts.

5. Run the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) — you'll be redirected
   to `/login`.

## Scripts

- `npm run dev` — start the Next.js dev server (Turbopack).
- `npm run build` — generate the Prisma client and create a production build.
- `npm run start` — run the production build.
- `npm run lint` — run ESLint.
- `npm run db:seed` — seed demo data (see above).
- `npm run db:reset` — drop and recreate the database, then reseed.

## Stack

- [Next.js](https://nextjs.org) (App Router, Server Actions)
- [Prisma](https://www.prisma.io) ORM with PostgreSQL
- [Supabase](https://supabase.com) for hosted Postgres and file storage
- Session auth via signed JWT cookies (`src/lib/auth.ts`, `src/middleware.ts`)
- Tailwind CSS

## Deploying

The app is designed to run on Vercel with a Supabase Postgres database. See
the `db` datasource comment in `prisma/schema.prisma` for why `DATABASE_URL`
and `DIRECT_URL` must point at different Supavisor pooler ports in that
setup.
