# Ellz Luxe Fragranz

Luxury fragrance e-commerce for a Ghana-first boutique. Next.js App Router, TypeScript, Tailwind, Supabase, and Paystack.

Demonstration catalog copy and photography are labeled as such. Business policies, contact details, and founder claims are placeholders until the owner approves them.

## Prerequisites

- Node.js 22+
- npm
- A Supabase project (for auth, persistent catalog, orders, and admin mutations)
- A Paystack account (for live payment). Without keys, checkout still creates **unpaid** orders and never fakes success.

## Local development

```bash
cp .env.example .env.local
npm install
npm run dev
```

Without Supabase keys the storefront runs in **demonstration mode**: catalog and cart come from committed seed data plus httpOnly cookies. This is explicitly separate from production database behavior.

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

End-to-end (install browsers once with `npx playwright install chromium`):

```bash
npm run test:e2e
```

## Environment variables

See `.env.example`. Never commit secrets.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for auth redirects, Paystack callbacks, sitemap |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (RLS applies) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only. Never expose in the browser |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Public Paystack key |
| `PAYSTACK_SECRET_KEY` | Server-only Paystack secret |
| `PAYSTACK_WEBHOOK_SECRET` | Optional; defaults to the secret key for HMAC |

## Supabase

Without keys the shop runs in demonstration mode (seed catalog + cookies). With keys, catalog, auth, carts, and orders use your project.

### 1. Copy API keys

In the [Supabase dashboard](https://supabase.com/dashboard) open your project → **Project Settings** → **API**. Copy:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (server only)

Put them in `.env.local` (never commit that file):

```bash
cp .env.example .env.local
```

Restart `npm run dev` after saving. Next.js only reads `NEXT_PUBLIC_*` at server start.

### 2. Apply the schema

**Option A — CLI (preferred)**

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

The project ref is the subdomain in the URL: `https://<project-ref>.supabase.co`.

**Option B — SQL editor**

Run the files in `supabase/migrations/` **in order**, in the dashboard SQL editor:

1. `0001_init.sql`
2. `0002_seed_catalog.sql`
3. `0003_storage.sql`

### 3. Auth redirects

**Authentication** → **URL configuration**:

- Site URL: `http://localhost:3000` (add your Vercel URL in production)
- Redirect URLs: `http://localhost:3000/auth/callback` and `{PRODUCTION_URL}/auth/callback`

### 4. First administrator

Sign up on `/signup`, then in the SQL editor (customers cannot self-assign admin):

```sql
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'you@your-email.com'
);
```

Open `/admin` while signed in as that user.

Row Level Security is enabled. Public users can read published catalog and store settings. Customers can read and update their own profile (not `role`) and their own orders. Carts, payments, inventory, and order creation go through server-side service-role workflows, including `checkout_create_order` which locks variant rows to prevent overselling.

## Paystack

1. Create a Paystack business (GHS).
2. Set secret/public keys in the environment.
3. Webhook URL: `{SITE_URL}/api/webhooks/paystack`
   - Events: `charge.success`
   - Signature verified with HMAC SHA-512
   - Payment rows are idempotent on `provider_reference`
4. Orders are marked paid **only** after a verified webhook — not because the browser returned to `/checkout/confirmation`.

Refunds from `/admin/orders/[id]` call the Paystack refund API. There is no admin control to fabricate a paid status.

## Deployment (Vercel)

1. Import the Git repository.
2. Set all environment variables.
3. Production URL must match `NEXT_PUBLIC_SITE_URL`, Supabase Auth redirects, and the Paystack webhook URL.
4. Run a production build locally (`npm run build`) before claiming a successful deploy.

This repository does not assert that a live Vercel deployment has been performed.

## Image attribution

Temporary demonstration photographs in `public/images` were downloaded from [Unsplash](https://unsplash.com). Some stock frames depict third-party bottles and **must be replaced** with Ellz-owned photography before launch. They are placeholders only.

## Remaining configuration

- Real product photography and live SKUs
- Confirmed contact, delivery fees, and legal copy
- Supabase project + admin profile
- Paystack keys and webhook
- Optional email delivery for contact form (currently persisted to `contact_messages` when the database is connected)
