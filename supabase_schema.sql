-- Run this in your Supabase SQL editor

create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  customer_name text not null,
  phone text not null,
  order_details text not null,
  language text not null default 'en-US',
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz default now()
);

-- Enable Row Level Security (optional for production)
alter table orders enable row level security;

-- Allow all operations for anon key (adjust for production)
create policy "Allow all" on orders for all using (true);
