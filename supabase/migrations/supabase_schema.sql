-- 1. Enable UUID extension (usually enabled by default, but good to be sure)
create extension if not exists "uuid-ossp";

-- 2. Create ORDERS Table
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id), -- Links to the registered user who bought it
  stripe_session_id text,
  status text default 'pending', -- 'pending', 'scanned', 'received', 'completed'
  upload_token text unique not null, -- The secret key the App Clip uses
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.orders 
add column if not exists total_amount integer, -- Store amount in cents
add column if not exists payment_intent_id text;

-- 3. Create HOODIE_SCANS Table
create table public.hoodie_scans (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) not null,
  rgb_image_path text,
  mask_image_path text,
  bw_mask_path text,
  calculated_area_cm float8,
  width_cm float8,
  height_cm float8,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create SERVICE_LOGS Table (For your internal use)
create table public.service_logs (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) not null,
  stage text, -- 'intake', 'outbound'
  image_path text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Enable Row Level Security (Security best practice)
alter table public.orders enable row level security;
alter table public.hoodie_scans enable row level security;
alter table public.service_logs enable row level security;

-- 6. Create Policies (Simple start)

-- Policy: Users can see their own orders
create policy "Users can view their own orders" 
on public.orders for select 
using (auth.uid() = user_id);

-- Note: For the "No Login" app upload, we will use the Service Role Key 
-- in a Next.js API route, bypassing these RLS policies securely.
-- Storage Buckets Setup (Run these in SQL Editor or use Dashboard)
-- Note: Creating buckets via SQL requires the storage extension and permissions, usually easier in Dashboard.
-- insert into storage.buckets (id, name) values ('customer-uploads', 'customer-uploads');
-- insert into storage.buckets (id, name) values ('admin-uploads', 'admin-uploads');
