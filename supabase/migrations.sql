-- ============================================================
-- Winti Strings – Supabase Migrations
-- Ausführen im Supabase SQL Editor
-- ============================================================

-- Customers-Tabelle
create table if not exists customers (
  id uuid references auth.users primary key,
  name text not null,
  email text not null,
  phone text,
  club text,
  racket_model text,
  status text default 'pending' check (status in ('pending', 'active', 'inactive')),
  created_at timestamp with time zone default now()
);

-- Stringings-Tabelle
create table if not exists stringings (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references customers(id) on delete cascade,
  date date not null,
  string_name text not null,
  tension_main numeric,
  tension_cross numeric,
  string_type text,
  note text,
  rating integer check (rating between 1 and 5),
  created_at timestamp with time zone default now()
);

-- Performance-Indizes
create index if not exists idx_stringings_customer_id on stringings(customer_id);
create index if not exists idx_stringings_date on stringings(date desc);
create index if not exists idx_customers_status on customers(status);

-- ============================================================
-- Row Level Security (RLS) aktivieren
-- ============================================================
alter table customers enable row level security;
alter table stringings enable row level security;

-- ============================================================
-- RLS-Policies für customers
-- ============================================================

-- SELECT: eigene Zeile oder Admin
create policy "customers_select" on customers
  for select using (
    auth.uid() = id
    or (select email from auth.users where id = auth.uid()) = 'ruben.olano@hotmail.com'
  );

-- INSERT: eigene Zeile (Selbstregistrierung) oder Admin
create policy "customers_insert" on customers
  for insert with check (
    auth.uid() = id
    or (select email from auth.users where id = auth.uid()) = 'ruben.olano@hotmail.com'
  );

-- UPDATE: eigene Zeile (Profil bearbeiten) oder Admin (Status ändern)
create policy "customers_update" on customers
  for update using (
    auth.uid() = id
    or (select email from auth.users where id = auth.uid()) = 'ruben.olano@hotmail.com'
  );

-- DELETE: nur Admin
create policy "customers_delete" on customers
  for delete using (
    (select email from auth.users where id = auth.uid()) = 'ruben.olano@hotmail.com'
  );

-- ============================================================
-- RLS-Policies für stringings
-- ============================================================

-- SELECT: eigene Bespannungen oder Admin
create policy "stringings_select" on stringings
  for select using (
    customer_id = auth.uid()
    or (select email from auth.users where id = auth.uid()) = 'ruben.olano@hotmail.com'
  );

-- INSERT: nur Admin darf Bespannungen erfassen
create policy "stringings_insert" on stringings
  for insert with check (
    (select email from auth.users where id = auth.uid()) = 'ruben.olano@hotmail.com'
  );

-- UPDATE: nur Admin
create policy "stringings_update" on stringings
  for update using (
    (select email from auth.users where id = auth.uid()) = 'ruben.olano@hotmail.com'
  );

-- DELETE: nur Admin
create policy "stringings_delete" on stringings
  for delete using (
    (select email from auth.users where id = auth.uid()) = 'ruben.olano@hotmail.com'
  );

-- ============================================================
-- HINWEIS: In Supabase Dashboard unter Authentication > URL Configuration
-- die Redirect URL http://localhost:5173 (dev) und deine Produktions-URL
-- zur Allowlist hinzufügen!
-- ============================================================
