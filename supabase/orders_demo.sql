-- Demo orders table for cyber-topup-demo
-- Run this in Supabase SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  order_ref text not null unique,
  user_id uuid null references auth.users (id) on delete set null,
  player_id text not null,
  game_title text not null,
  package_name text not null,
  price numeric(10,2) not null check (price >= 0),
  payment_channel text not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'success', 'failed'))
);

create index if not exists idx_orders_user_id_created_at
  on public.orders (user_id, created_at desc);

alter table public.orders enable row level security;

-- User can read only their own orders.
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own"
on public.orders
for select
to authenticated
using (auth.uid() = user_id);

-- User can create orders for themselves only.
drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own"
on public.orders
for insert
to authenticated
with check (auth.uid() = user_id);

-- User can update only their own orders (for demo status transitions).
drop policy if exists "orders_update_own" on public.orders;
create policy "orders_update_own"
on public.orders
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Optional: prevent direct deletes from client.
drop policy if exists "orders_delete_none" on public.orders;
create policy "orders_delete_none"
on public.orders
for delete
to authenticated
using (false);
