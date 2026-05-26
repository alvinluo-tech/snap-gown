# SnapGown

UK graduation photoshoot booking platform (Durham pilot).

## Stack

- Next.js 16 (App Router)
- TypeScript
- Supabase (Postgres/Auth/Storage)
- Tailwind CSS + shadcn/ui
- Resend (email notifications)

## Prerequisites

- Node.js 20.9+ (recommended Node.js 22 LTS)
- pnpm
- Supabase project

## Environment Variables

Create `.env.local` with at least:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_EXCHANGE_RATE=9.30

RESEND_API_KEY=
RESEND_FROM_EMAIL=
ADMIN_ALERT_EMAIL=
```

## Install & Run

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Database Migrations

The migration files are under `supabase/migrations`.

If Supabase CLI is configured for your project:

```bash
supabase db push
```

## Key Business Flows

- Slot booking with 30-minute `HELD` window
- Payment proof upload switches order to `PROOF_SUBMITTED`
- 12-hour verification timeout marks `VERIFICATION_OVERDUE`
- Commission ledger + auto-suspension when debt exceeds threshold

## Useful Commands

```bash
pnpm dev
pnpm build
pnpm lint
```

## Notes

- Dynamic route `params` in App Router pages are handled as `Promise` (Next.js 16 requirement).
- For concurrency safety, booking uses DB-side `hold_slot_for_payment` RPC.
