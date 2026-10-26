-- Yalla Wash schema.
-- All tables have RLS on with no policies: only the server (service role key) reads and writes.

create extension if not exists pgcrypto;

create table public.stations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  area text not null,
  city text not null,
  open_until text not null default '11 pm',
  lat double precision,
  lng double precision,
  -- Bookable slots run from slot_start to slot_end (last slot starts slot_minutes before slot_end).
  slot_start time not null default '16:00',
  slot_end time not null default '22:00',
  slot_minutes int not null default 30 check (slot_minutes > 0),
  slot_capacity int not null default 2 check (slot_capacity > 0),
  -- Average minutes per car, for the live queue's wait estimate.
  minutes_per_car int not null default 7 check (minutes_per_car > 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.car_types (
  id text primary key,
  name text not null,
  note text not null default '',
  sort int not null default 0
);

create table public.packages (
  id text primary key,
  name text not null,
  includes text not null,
  popular boolean not null default false,
  sort int not null default 0
);

create table public.package_prices (
  package_id text not null references public.packages (id) on delete cascade,
  car_type_id text not null references public.car_types (id) on delete cascade,
  price int not null check (price >= 0),
  primary key (package_id, car_type_id)
);

create table public.addons (
  id text primary key,
  name text not null,
  price int not null check (price >= 0),
  sort int not null default 0
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  name text,
  created_at timestamptz not null default now()
);

create table public.cars (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  car_type_id text not null references public.car_types (id),
  state_code text not null default 'KL',
  plate text not null default '',
  created_at timestamptz not null default now(),
  unique (customer_id, car_type_id, state_code, plate)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  customer_id uuid not null references public.customers (id) on delete cascade,
  station_id uuid not null references public.stations (id),
  car_type_id text not null references public.car_types (id),
  state_code text not null default '',
  plate text not null default '',
  package_id text not null references public.packages (id),
  mode text not null check (mode in ('queue', 'slot')),
  slot_at timestamptz,
  status text not null default 'booked'
    check (status in ('queued', 'booked', 'checked_in', 'washing', 'drying', 'ready', 'done', 'cancelled')),
  package_price int not null,
  addons_total int not null default 0,
  total int not null,
  is_free boolean not null default false,
  checked_in_at timestamptz,
  status_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check ((mode = 'slot') = (slot_at is not null))
);

create index bookings_station_slot_idx on public.bookings (station_id, slot_at) where status <> 'cancelled';
create index bookings_station_status_idx on public.bookings (station_id, status);
create index bookings_customer_idx on public.bookings (customer_id, created_at desc);

create table public.booking_addons (
  booking_id uuid not null references public.bookings (id) on delete cascade,
  addon_id text not null references public.addons (id),
  price int not null,
  primary key (booking_id, addon_id)
);

create table public.ratings (
  booking_id uuid primary key references public.bookings (id) on delete cascade,
  stars int not null check (stars between 1 and 5),
  tags text[] not null default '{}',
  comment text not null default '',
  created_at timestamptz not null default now()
);

alter table public.stations enable row level security;
alter table public.car_types enable row level security;
alter table public.packages enable row level security;
alter table public.package_prices enable row level security;
alter table public.addons enable row level security;
alter table public.customers enable row level security;
alter table public.cars enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_addons enable row level security;
alter table public.ratings enable row level security;
