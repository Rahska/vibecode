-- ORBITA / ОРБИТА — Supabase schema (guest sessions + admin PIN via app cookie)
-- Run this entire script in: Supabase Dashboard → SQL → New query

-- Extensions
create extension if not exists "pgcrypto";

-- 1. Locations
create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  type text not null,
  price_per_hour integer not null,
  capacity integer default 8,
  rating numeric(3,1) default 5.0,
  images text[] default '{}',
  features text[] default '{}',
  is_active boolean default true,
  glow_color text,
  x numeric default 50,
  y numeric default 50,
  created_at timestamptz default now()
);

-- 2. Bookings (anonymous guests identified by guest_id from the browser)
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  guest_id text not null,
  location_id uuid references public.locations(id) on delete cascade,
  date date not null,
  start_hour integer not null check (start_hour >= 0 and start_hour <= 23),
  end_hour integer not null check (end_hour > start_hour and end_hour <= 24),
  total_price integer not null,
  deposit text,
  payment_status text default 'UNPAID',
  notes text,
  status text default 'PENDING',
  customer_name text,
  customer_phone text,
  created_at timestamptz default now()
);

-- 3. Reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  guest_id text,
  location_id uuid references public.locations(id) on delete cascade,
  author text not null,
  rating integer not null check (rating between 1 and 5),
  text text not null,
  photos text[],
  created_at timestamptz default now()
);

-- 4. Favorites
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  guest_id text not null,
  location_id uuid references public.locations(id) on delete cascade,
  created_at timestamptz default now(),
  unique(guest_id, location_id)
);

-- 5. Platform settings (single row)
create table if not exists public.settings (
  id integer primary key default 1,
  whatsapp_number text default '77071234567',
  whatsapp_message text default 'Здравствуйте! Хочу забронировать место в ОРБИТА.',
  platform_name text default 'ОРБИТА',
  address text default 'г. Алматы, ул. Кульджинский тракт, 42',
  working_hours text default '10:00 — 23:00',
  currency text default '₸',
  admin_pin text default '7777',
  created_at timestamptz default now()
);

-- 6. RLS
alter table public.locations enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;
alter table public.settings enable row level security;

-- Drop old policies if re-running
drop policy if exists "Public read locations" on public.locations;
drop policy if exists "Public read reviews" on public.reviews;
drop policy if exists "Public read settings" on public.settings;
drop policy if exists "Public read bookings" on public.bookings;
drop policy if exists "Public read favorites" on public.favorites;

create policy "Public read locations" on public.locations for select using (true);
create policy "Public read reviews" on public.reviews for select using (true);
create policy "Public read settings" on public.settings for select using (true);
create policy "Public read bookings" on public.bookings for select using (true);
create policy "Public read favorites" on public.favorites for select using (true);

-- Writes are performed via API routes using SUPABASE_SERVICE_ROLE_KEY (bypasses RLS)

-- 7. Storage bucket for review / admin images
insert into storage.buckets (id, name, public)
values ('orbita-images', 'orbita-images', true)
on conflict (id) do nothing;

-- 8. Seed settings
insert into public.settings (id, platform_name, whatsapp_number, whatsapp_message, address, admin_pin)
values (
  1,
  'ОРБИТА',
  '77071234567',
  'Здравствуйте! Хочу забронировать место в ОРБИТА.',
  'г. Алматы, Кульджинский тракт, 42',
  '7777'
)
on conflict (id) do update set
  platform_name = excluded.platform_name,
  whatsapp_number = excluded.whatsapp_number,
  whatsapp_message = excluded.whatsapp_message,
  address = excluded.address;

-- 9. Seed locations (realistic leisure venue names for Almaty region)
insert into public.locations (name, type, description, price_per_hour, capacity, images, features, glow_color, x, y)
select * from (values
  (
    'Королевская юрта',
    'YURT',
    'Премиальная юрта с отоплением, Smart TV и Wi‑Fi. Подходит для семейных праздников до 10 человек.',
    15000, 10,
    array['https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=1600&auto=format&fit=crop'],
    array['Wi‑Fi', 'Отопление', 'Smart TV', 'Чайная зона'],
    'glow-cyan', 22::numeric, 32::numeric
  ),
  (
    'Sky Lounge Тапчан',
    'VIP',
    'VIP-зона с панорамным видом на горы, обслуживанием официанта и премиум-кальяном.',
    25000, 15,
    array['https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1600&auto=format&fit=crop'],
    array['Панорама', 'Официант', 'Премиум кальян', 'Музыка'],
    'glow-blue', 68::numeric, 38::numeric
  ),
  (
    'Лесная беседка',
    'GAZEBO',
    'Уютная беседка в тени деревьев с мангалом и видом на лесную поляну.',
    8000, 8,
    array['https://images.unsplash.com/photo-1499803270242-467f73115827?q=80&w=1600&auto=format&fit=crop'],
    array['Мангал', 'Стол на 8 персон', 'Освещение'],
    'glow-cyan', 48::numeric, 72::numeric
  )
) as v(name, type, description, price_per_hour, capacity, images, features, glow_color, x, y)
where not exists (select 1 from public.locations limit 1);
