-- 1. Таблицы профилей
create table public.profiles (
  id uuid references auth.users(id) primary key,
  display_name text,
  phone text,
  avatar_url text,
  role text default 'user', -- 'user' | 'admin'
  created_at timestamptz default now()
);

-- 2. Триггер для создания профиля при регистрации
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, phone)
  values (
    new.id, 
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Таблица локаций
create table public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  type text not null,
  price_per_hour integer not null,
  capacity integer,
  rating numeric(3,1) default 5.0,
  images text[],
  features text[],
  is_active boolean default true,
  glow_color text,
  x numeric default 50,
  y numeric default 50,
  created_at timestamptz default now()
);

-- 4. Таблица бронирований
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  location_id uuid references public.locations(id) on delete cascade,
  date date not null,
  start_hour integer not null,
  end_hour integer not null,
  total_price integer not null,
  deposit text,
  payment_status text default 'UNPAID', -- 'UNPAID', 'DEPOSIT_PAID', 'FULLY_PAID'
  notes text,
  status text default 'PENDING', -- 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'
  customer_name text,
  customer_phone text,
  created_at timestamptz default now()
);

-- 5. Таблица отзывов
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  location_id uuid references public.locations(id) on delete cascade,
  author text not null,
  rating integer check (rating between 1 and 5),
  text text not null,
  photos text[],
  created_at timestamptz default now()
);

-- 6. Таблица избранного
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  location_id uuid references public.locations(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, location_id)
);

-- 7. Таблица настроек
create table public.settings (
  id integer primary key default 1,
  whatsapp_number text default '77001234567',
  whatsapp_message text,
  platform_name text default 'ОРБИТА',
  address text,
  working_hours text,
  currency text default '₸',
  admin_pin text default '7777',
  created_at timestamptz default now()
);

-- 8. Включение RLS
alter table public.profiles enable row level security;
alter table public.locations enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;
alter table public.settings enable row level security;

-- 9. Политики безопасности (RLS Policies)

-- Локации: все видят, только админ меняет
create policy "Public read locations" on public.locations for select using (true);
create policy "Admin manage locations" on public.locations using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Профили: каждый видит свой, админ видит все
create policy "Users view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admin view all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Бронирования: пользователь видит свои, админ видит все
create policy "Users manage own bookings" on public.bookings for all using (auth.uid() = user_id);
create policy "Admin manage all bookings" on public.bookings for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Отзывы: все видят, пользователи создают свои
create policy "Public read reviews" on public.reviews for select using (true);
create policy "Users create reviews" on public.reviews for insert with check (auth.uid() = user_id);
create policy "Users manage own reviews" on public.reviews for update using (auth.uid() = user_id);
create policy "Admin delete any reviews" on public.reviews for delete using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Избранное: каждый управляет своим
create policy "Users manage own favorites" on public.favorites for all using (auth.uid() = user_id);

-- Настройки: все видят, только админ меняет
create policy "Public read settings" on public.settings for select using (true);
create policy "Admin manage settings" on public.settings for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 10. Начальные данные (Seed Data)
insert into public.settings (id, platform_name, whatsapp_number, admin_pin)
values (1, 'ОРБИТА', '77001234567', '7777')
on conflict (id) do nothing;

insert into public.locations (name, type, price_per_hour, capacity, images, glow_color, x, y)
values 
('Королевская юрта V1', 'YURT', 15000, 10, array['https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=1600'], 'glow-cyan', 20, 30),
('Sky Lounge Тапчан', 'VIP', 25000, 15, array['https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1600'], 'glow-blue', 70, 40),
('Лесная беседка', 'GAZEBO', 8000, 8, array['https://images.unsplash.com/photo-1499803270242-467f73115827?q=80&w=1600'], 'glow-cyan', 45, 70);
