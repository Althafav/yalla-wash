# Yalla Wash

A mobile-first web app (PWA) for booking car washes at a Yalla Wash station: join the live queue or book a time, check in with a QR code, follow the wash live, rate it and collect stamps (every 6th wash is free).

Built from the Yalla Wash design canvas and design system with Next.js 16 (App Router, Cache Components), Tailwind CSS v4 and Supabase.

## Setup

Needs Node.js 24 or later.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create the environment file and fill it in from your Supabase project (**Project Settings › API**):

   ```bash
   cp .env.example .env.local
   ```

   Set `SESSION_SECRET` to any random string of 32+ characters.

3. Create the tables and sample data. Either paste these two files into the Supabase **SQL Editor** and run them in order:

   - `supabase/migrations/20261026000000_init.sql`
   - `supabase/migrations/20261027000000_vehicles.sql`
   - `supabase/seed.sql`

   or use the Supabase CLI:

   ```bash
   npx supabase link --project-ref your-project-ref
   ```

   ```bash
   npx supabase db push
   ```

   ```bash
   npx supabase db query --linked -f supabase/seed.sql
   ```

4. Run it:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000 (use your browser's phone view for the intended size).

## Signing in (mock OTP)

There is no SMS yet. Enter any 10-digit Indian mobile number and the code **1234**.
The seeded demo customer is **99999 99999**. They have 5 paid washes, so their next booking is free.

To switch to real OTP later, replace `app/actions/auth.ts` and `lib/session.ts` with Supabase phone auth (they're marked `TODO`).

## Sample data

`supabase/seed.sql` adds:

- **One station**, "Yalla Wash Station 1, Main Road, Kochi". Change its name, area, city and `lat`/`lng` in the `stations` table. Slot hours (4–10 pm), slot length (30 min), cars per slot (2) and minutes per car (for the queue wait) are columns on the same row. To add a station later, insert another row. Today the app uses the first active station.
- Vehicles in three groups: **Bike** (Bike, Scooter), **Auto** (Auto-rickshaw) and **Car** (Sedan, SUV, Van, Pickup). They live in the `car_types` table, where `category` sets the group and `wash_minutes` feeds the queue wait.
- The three packages, priced per vehicle in `package_prices`. A missing row means that package isn't offered for that vehicle; for example, autos have no Premium. The optional `includes` column replaces the package description for one vehicle, such as "chain clean" for bikes. **Bike, scooter and auto prices are placeholders.**
- Add-ons, each limited to vehicle groups by `addons.categories` (Chain lube is bikes only; Engine bay is cars only).
- 3 cars in today's live queue, and a fully booked 5:00 pm slot tomorrow.

Re-running the seed resets all bookings and customers.

## Demo mode

With `DEMO_MODE=true`, the live status screen has a **Next step (demo)** button. It plays the part of the station staff and moves a wash through checked in → washing → drying → ready. Set it to `false` in production.

## How it fits together

| Screen | Route |
| --- | --- |
| Splash | `/` |
| Home | `/home` |
| Your vehicle → Package → Queue or slot | `/book/car`, `/book/package`, `/book/time` |
| Sign in | `/signin?next=…` |
| Review + confirm | `/book/review` |
| Booked + QR | `/bookings/[id]` |
| Live status | `/bookings/[id]/status` |
| Rate + stamp | `/bookings/[id]/rate` |
| Rewards, Bookings, Profile | `/rewards`, `/bookings`, `/profile` |

- Design tokens live in `app/globals.css`, and the Bubble Pop button, card, chip and field styles are under `@layer components`.
- The booking in progress is kept in `sessionStorage` (`lib/draft.ts`). Prices and slot availability are always rechecked on the server when the booking is created (`app/actions/booking.ts`).
- Every table has row-level security on with no policies. Only server code using the service role key (`lib/supabase.ts`) can read or write.
