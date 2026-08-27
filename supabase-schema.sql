-- =============================================================================
-- VUT Student Accommodation — Full Supabase / PostgreSQL Schema
-- =============================================================================
-- Run this entire script in: Supabase Dashboard → SQL Editor → New query → Run
--
-- Tables created:
--   1. accommodations
--   2. accommodation_amenities
--   3. accommodation_images
--   4. bookings
--
-- Also configures: indexes, constraints, RLS policies, storage bucket, seed data
-- =============================================================================

-- Extensions
create extension if not exists pgcrypto;

-- =============================================================================
-- 1. ACCOMMODATIONS
-- =============================================================================
create table if not exists public.accommodations (
  id uuid primary key default gen_random_uuid(),

  -- Landlord / owner details
  title text,
  fname text not null,
  lname text not null,
  idno text not null,
  phone text not null,
  email text not null,

  -- Address (full + structured fields from legacy alter script)
  address text,
  house_number text,
  street_name text,
  suburb text,
  city text,
  postal_code text,

  -- Accommodation details
  acc_name text not null,
  acc_location text not null,
  acc_capacity integer not null default 0,
  acc_contact text not null,
  acc_description text,

  -- Funding support flags
  supports_nsfas boolean not null default false,
  supports_other boolean not null default false,
  supports_self boolean not null default false,

  -- Profile image path (Supabase Storage or URL)
  profile_img text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint accommodations_acc_name_unique unique (acc_name),
  constraint accommodations_acc_capacity_positive check (acc_capacity > 0),
  constraint accommodations_landlord_idno_format check (idno ~ '^\d{13}$'),
  constraint accommodations_landlord_phone_format check (phone ~ '^\d{10}$'),
  constraint accommodations_landlord_email_format check (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  constraint accommodations_acc_contact_email_format check (acc_contact ~* '^[^@]+@[^@]+\.[^@]+$')
);

create index if not exists idx_accommodations_acc_name on public.accommodations (acc_name);
create index if not exists idx_accommodations_acc_location on public.accommodations (acc_location);
create index if not exists idx_accommodations_supports_nsfas on public.accommodations (supports_nsfas);

-- =============================================================================
-- 2. ACCOMMODATION AMENITIES
-- =============================================================================
create table if not exists public.accommodation_amenities (
  id uuid primary key default gen_random_uuid(),
  accommodation_id uuid not null references public.accommodations (id) on delete cascade,
  amenity text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_accommodation_amenities_accommodation_id
  on public.accommodation_amenities (accommodation_id);

-- =============================================================================
-- 3. ACCOMMODATION IMAGES
-- =============================================================================
create table if not exists public.accommodation_images (
  id uuid primary key default gen_random_uuid(),
  accommodation_id uuid not null references public.accommodations (id) on delete cascade,
  image_path text not null,
  image_name text not null,
  is_primary boolean not null default false,
  upload_date timestamptz not null default now()
);

create index if not exists idx_accommodation_images_accommodation_id
  on public.accommodation_images (accommodation_id);

-- Only one primary image per accommodation
create unique index if not exists idx_accommodation_images_one_primary
  on public.accommodation_images (accommodation_id)
  where is_primary = true;

-- =============================================================================
-- 4. BOOKINGS
-- =============================================================================
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),

  -- Student personal info
  name text not null,
  surname text not null,
  student_number text not null,
  id_number text not null,
  phone_number text not null,
  email text not null,
  dob date not null,
  year_of_study integer not null,

  -- Funding
  bursary_type text not null,
  nsfas_status text,
  nsfas_reference text,

  -- Accommodation preference / assignment
  accommodation_id uuid references public.accommodations (id) on delete set null,
  accommodation text, -- assigned accommodation name (legacy compat after admin approval)

  -- Stay details (set by admin on approval)
  check_in date,
  check_out date,
  room_number text,

  booking_status text not null default 'Pending',

  registered_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint bookings_student_number_format check (student_number ~ '^\d{9}$'),
  constraint bookings_id_number_format check (id_number ~ '^\d{13}$'),
  constraint bookings_phone_number_format check (phone_number ~ '^\d{10}$'),
  constraint bookings_email_format check (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  constraint bookings_year_of_study_range check (year_of_study between 1 and 8),
  constraint bookings_status_valid check (booking_status in ('Pending', 'Approved', 'Rejected')),
  constraint bookings_bursary_type_valid check (
    bursary_type in ('NSFAS', 'Private', 'Other', 'Self-paying', 'Self paying')
  )
);

create index if not exists idx_bookings_student_number on public.bookings (student_number);
create index if not exists idx_bookings_booking_status on public.bookings (booking_status);
create index if not exists idx_bookings_accommodation_id on public.bookings (accommodation_id);
create index if not exists idx_bookings_registered_at on public.bookings (registered_at desc);

-- Prevent duplicate active bookings for the same student
create unique index if not exists idx_bookings_one_active_per_student
  on public.bookings (student_number)
  where booking_status in ('Pending', 'Approved');

-- =============================================================================
-- 5. UPDATED_AT TRIGGER
-- =============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_accommodations_updated_at on public.accommodations;
create trigger trg_accommodations_updated_at
  before update on public.accommodations
  for each row execute function public.set_updated_at();

drop trigger if exists trg_bookings_updated_at on public.bookings;
create trigger trg_bookings_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

-- =============================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =============================================================================
-- Dev-friendly policies so the React app works with the anon key.
-- Tighten these before production (require auth for admin actions).
-- =============================================================================

alter table public.accommodations enable row level security;
alter table public.accommodation_amenities enable row level security;
alter table public.accommodation_images enable row level security;
alter table public.bookings enable row level security;

-- Accommodations: public read
drop policy if exists "Public read accommodations" on public.accommodations;
create policy "Public read accommodations"
  on public.accommodations for select
  to anon, authenticated
  using (true);

-- Accommodations: allow inserts/updates for now (admin auth comes later)
drop policy if exists "Dev write accommodations" on public.accommodations;
create policy "Dev write accommodations"
  on public.accommodations for all
  to anon, authenticated
  using (true)
  with check (true);

-- Amenities: public read + dev write
drop policy if exists "Public read amenities" on public.accommodation_amenities;
create policy "Public read amenities"
  on public.accommodation_amenities for select
  to anon, authenticated
  using (true);

drop policy if exists "Dev write amenities" on public.accommodation_amenities;
create policy "Dev write amenities"
  on public.accommodation_amenities for all
  to anon, authenticated
  using (true)
  with check (true);

-- Images: public read + dev write
drop policy if exists "Public read images" on public.accommodation_images;
create policy "Public read images"
  on public.accommodation_images for select
  to anon, authenticated
  using (true);

drop policy if exists "Dev write images" on public.accommodation_images;
create policy "Dev write images"
  on public.accommodation_images for all
  to anon, authenticated
  using (true)
  with check (true);

-- Bookings: students can submit, everyone can read (dev)
drop policy if exists "Public insert bookings" on public.bookings;
create policy "Public insert bookings"
  on public.bookings for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Public read bookings" on public.bookings;
create policy "Public read bookings"
  on public.bookings for select
  to anon, authenticated
  using (true);

drop policy if exists "Dev update bookings" on public.bookings;
create policy "Dev update bookings"
  on public.bookings for update
  to anon, authenticated
  using (true)
  with check (true);

-- =============================================================================
-- 7. STORAGE BUCKET (for accommodation photos)
-- =============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'accommodation-images',
  'accommodation-images',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
on conflict (id) do nothing;

-- Storage policies: public read, dev upload
drop policy if exists "Public read accommodation images bucket" on storage.objects;
create policy "Public read accommodation images bucket"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'accommodation-images');

drop policy if exists "Dev upload accommodation images" on storage.objects;
create policy "Dev upload accommodation images"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'accommodation-images');

drop policy if exists "Dev update accommodation images" on storage.objects;
create policy "Dev update accommodation images"
  on storage.objects for update
  to anon, authenticated
  using (bucket_id = 'accommodation-images');

drop policy if exists "Dev delete accommodation images" on storage.objects;
create policy "Dev delete accommodation images"
  on storage.objects for delete
  to anon, authenticated
  using (bucket_id = 'accommodation-images');

-- =============================================================================
-- 8. SEED DATA (sample accommodations for testing)
-- =============================================================================
insert into public.accommodations (
  title, fname, lname, idno, phone, email,
  house_number, street_name, suburb, city, postal_code, address,
  acc_name, acc_location, acc_capacity, acc_contact, acc_description,
  supports_nsfas, supports_other, supports_self
)
values
  (
    'Mr', 'John', 'Mokoena', '8001015800085', '0821234567', 'john.mokoena@example.com',
    '12', 'University Road', 'Arcon Park', 'Vanderbijlpark', '1911',
    '12 University Road, Arcon Park, Vanderbijlpark, 1911',
    'VUT Residences Block A', 'On-campus, Vanderbijlpark', 120,
    'residences@vut.ac.za',
    'On-campus student residence with shared facilities.',
    true, false, true
  ),
  (
    'Mrs', 'Sarah', 'Naidoo', '7505054800086', '0839876543', 'sarah.naidoo@example.com',
    '45', 'Frikkie Meyer Blvd', 'Three Rivers', 'Vereeniging', '1935',
    '45 Frikkie Meyer Blvd, Three Rivers, Vereeniging, 1935',
    'River View Student Lodge', 'Three Rivers, Vereeniging', 40,
    'bookings@riverviewlodge.co.za',
    'Private lodge near campus with Wi-Fi and laundry.',
    false, true, true
  ),
  (
    'Mr', 'Peter', 'Dlamini', '9003035800087', '0845551234', 'peter.dlamini@example.com',
    '8', 'Klasie Street', 'Bophelong', 'Vanderbijlpark', '1909',
    '8 Klasie Street, Bophelong, Vanderbijlpark, 1909',
    'Campus Heights', 'Near VUT South Campus', 60,
    'info@campusheights.co.za',
    'Affordable off-campus housing with NSFAS support.',
    true, true, true
  )
on conflict (acc_name) do nothing;

-- Seed amenities for the sample accommodations
insert into public.accommodation_amenities (accommodation_id, amenity)
select a.id, v.amenity
from public.accommodations a
cross join (
  values
    ('Wi-Fi'),
    ('Laundry'),
    ('24/7 Security')
) as v(amenity)
where a.acc_name = 'VUT Residences Block A'
  and not exists (
    select 1 from public.accommodation_amenities aa
    where aa.accommodation_id = a.id and aa.amenity = v.amenity
  );

insert into public.accommodation_amenities (accommodation_id, amenity)
select a.id, v.amenity
from public.accommodations a
cross join (
  values
    ('Wi-Fi'),
    ('Parking'),
    ('Study room')
) as v(amenity)
where a.acc_name = 'River View Student Lodge'
  and not exists (
    select 1 from public.accommodation_amenities aa
    where aa.accommodation_id = a.id and aa.amenity = v.amenity
  );

-- =============================================================================
-- 9. VERIFY (optional — run separately to confirm setup)
-- =============================================================================
-- select table_name from information_schema.tables
--   where table_schema = 'public'
--   and table_name in ('accommodations', 'accommodation_amenities', 'accommodation_images', 'bookings');
--
-- select acc_name, acc_location, acc_capacity from public.accommodations;
