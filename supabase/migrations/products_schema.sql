-- Table: products
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  base_price numeric(10, 2) not null, -- Store as decimal
  type text check (type in ('kit', 'service')),
  image_url text,
  slug text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table: product_variants
create table public.product_variants (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id) not null,
  name text not null, -- e.g., "Red Satin", "Blue Pattern"
  price_adjustment numeric(10, 2) default 0.00,
  sku text,
  stock_quantity int default 100,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.products enable row level security;
alter table public.product_variants enable row level security;

-- Public Read Policy
create policy "Public can view products" on public.products for select using (true);
create policy "Public can view variants" on public.product_variants for select using (true);

-- SEED DATA

-- 1. The "Refill" Kit
insert into public.products (name, description, base_price, type, slug, image_url)
values (
  'The Refill Kit (Satin Only)', 
  'A pre-cut sheet of high-quality satin fabric in various colors/patterns. Perfect if you already have sewing supplies.', 
  24.99, 
  'kit', 
  'refill-kit',
  '/images/refill-kit.jpg'
);

-- 2. The "Essentials" Kit
insert into public.products (name, description, base_price, type, slug, image_url)
values (
  'The Essentials Kit', 
  'Everything needed to finish the job except the machine. Includes pre-cut satin, fabric glue, pins, thread, and a needle.', 
  34.99, 
  'kit', 
  'essentials-kit',
  '/images/essentials-kit.jpg'
);

-- 3. The "All-In-One" Kit
insert into public.products (name, description, base_price, type, slug, image_url)
values (
  'The All-In-One Kit', 
  'The Essentials Kit + a handheld sewing machine. The complete package for beginners.', 
  54.99, 
  'kit', 
  'all-in-one-kit',
  '/images/all-in-one-kit.jpg'
);

-- 4. The Premium Mail-In Service
insert into public.products (name, description, base_price, type, slug, image_url)
values (
  'Mail-in Service', 
  'The Premium Experience. Send us your hoodie, and we''ll professionally line it with our premium satin.', 
  45.00, 
  'service', 
  'mail-in-service',
  '/images/mail-in-service.jpg'
);

-- Insert the Concierge Service
insert into public.products (name, description, base_price, type, slug, image_url)
values (
  'Concierge Service', 
  'We buy the hoodie and line it for you. Includes a brand new hoodie, custom satin lining, and delivery.', 
  50.00, 
  'service', 
  'concierge',
  '/images/all-in-one-kit.jpg'
);