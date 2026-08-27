-- =============================================================================
-- VUT Student Accommodation — Seed: Admin, Landlord accounts & Accommodations
-- Source: VUT NSFAS Accredited Off-Campus Accommodation list (10 Feb 2025)
--
-- Run AFTER supabase-schema.sql (Supabase Dashboard -> SQL Editor -> Run).
--
-- Creates:
--   * public.admins      (1 account:  admin@prince / prince@Accommodations)
--   * public.landlords   (48 accounts, bcrypt-hashed passwords)
--   * 50 accommodation records, each linked to its landlord via landlord_id
--
-- Password rule for landlords: FirstName + last 4 digits of contact number.
-- =============================================================================

create extension if not exists pgcrypto;

-- ── ADMINS ───────────────────────────────────────────────────────────────────
create table if not exists public.admins (
  id            uuid primary key default gen_random_uuid(),
  username      text not null unique,
  email         text,
  password_hash text not null,
  created_at    timestamptz not null default now()
);

-- ── LANDLORDS ────────────────────────────────────────────────────────────────
create table if not exists public.landlords (
  id            uuid primary key default gen_random_uuid(),
  title         text,
  fname         text not null,
  lname         text not null,
  email         text not null unique,
  phone         text not null,
  id_number     text,
  password_hash text not null,
  created_at    timestamptz not null default now()
);

-- ── Link accommodations to their landlord ────────────────────────────────────
alter table public.accommodations
  add column if not exists landlord_id uuid references public.landlords (id) on delete set null;

-- Legacy schema required a 13-digit SA ID for the landlord — the source list
-- does not publish ID numbers, so relax those constraints.
alter table public.accommodations alter column idno drop not null;
alter table public.accommodations drop constraint if exists accommodations_landlord_idno_format;
alter table public.accommodations alter column title drop not null;

-- ── RLS (dev-friendly; tighten before production) ────────────────────────────
alter table public.admins    enable row level security;
alter table public.landlords enable row level security;

drop policy if exists "Dev read admins" on public.admins;
create policy "Dev read admins" on public.admins for select to anon, authenticated using (true);

drop policy if exists "Dev write admins" on public.admins;
create policy "Dev write admins" on public.admins for all to anon, authenticated using (true) with check (true);

drop policy if exists "Dev read landlords" on public.landlords;
create policy "Dev read landlords" on public.landlords for select to anon, authenticated using (true);

drop policy if exists "Dev write landlords" on public.landlords;
create policy "Dev write landlords" on public.landlords for all to anon, authenticated using (true) with check (true);

-- ═════════════════════════════════════════════════════════════════════════════
-- 1. ADMIN ACCOUNT  (username: admin@prince | password: prince@Accommodations)
-- ═════════════════════════════════════════════════════════════════════════════
insert into public.admins (username, email, password_hash)
values (
  'admin@prince',
  'prince@vut.ac.za',
  crypt('prince@Accommodations', gen_salt('bf', 10))
)
on conflict (username) do update
  set password_hash = excluded.password_hash,
      email         = excluded.email;

-- ═════════════════════════════════════════════════════════════════════════════
-- 2. LANDLORD ACCOUNTS  (password = FirstName + last 4 digits of phone)
-- ═════════════════════════════════════════════════════════════════════════════
insert into public.landlords (title, fname, lname, email, phone, password_hash) values
  (NULL, 'Motanya', 'Sekgobela', 'm.esekgobela@gmail.com', '0837970763', crypt('Motanya0763', gen_salt('bf', 10))),
  (NULL, 'Moleboheng', 'Joyce Selialia', 'lebogile105@gmail.com', '0823353594', crypt('Moleboheng3594', gen_salt('bf', 10))),
  (NULL, 'Thulani', 'Mkoena', 'mamailula2023@gmail.com', '0658776288', crypt('Thulani6288', gen_salt('bf', 10))),
  (NULL, 'Mosa', 'Machesa', 'mosamachesa@gmail.com', '0745875156', crypt('Mosa5156', gen_salt('bf', 10))),
  (NULL, 'Boitumelo', 'Thulare', 'selinabthulare@gmail.com', '0731860332', crypt('Boitumelo0332', gen_salt('bf', 10))),
  (NULL, 'Molate', 'Samuel Talane', 'kaelo.properties@gmail.com', '0645026850', crypt('Molate6850', gen_salt('bf', 10))),
  (NULL, 'Trevor', 'Herbert', 'wayne53herbert@gmail.com', '0823213016', crypt('Trevor3016', gen_salt('bf', 10))),
  (NULL, 'Deslandi', 'Fernando', 'info.egi22@gmail.com', '0746001884', crypt('Deslandi1884', gen_salt('bf', 10))),
  (NULL, 'Johannes', 'Sekele', 'sekelejoe@gmail.com', '0833213679', crypt('Johannes3679', gen_salt('bf', 10))),
  (NULL, 'Lydia', 'Mbele', 'likeleli2@gmail.com', '0715732878', crypt('Lydia2878', gen_salt('bf', 10))),
  (NULL, 'Mukhethwa', 'Mudau', 'rocharlaccomodation@gmail.com', '0659356995', crypt('Mukhethwa6995', gen_salt('bf', 10))),
  (NULL, 'Jabulile', 'Kekana', 'kjabulile379@gmail.com', '0832603291', crypt('Jabulile3291', gen_salt('bf', 10))),
  (NULL, 'Connie', 'Rademan', 'connix.rademan@gmail.com', '0711728298', crypt('Connie8298', gen_salt('bf', 10))),
  (NULL, 'Prince', 'Duru', 'mohanoep@yahoo.com', '0605044850', crypt('Prince4850', gen_salt('bf', 10))),
  (NULL, 'Louis', 'Buthelezi', 'louis@llsecurity.co.za', '0730417270', crypt('Louis7270', gen_salt('bf', 10))),
  (NULL, 'Khusela', 'Sipika', 'khuselasipika2@gmail.com', '0814763922', crypt('Khusela3922', gen_salt('bf', 10))),
  (NULL, 'Balanganani', 'Comfort Muofhe', 'b_muofhe@yahoo.com', '0719118922', crypt('Balanganani8922', gen_salt('bf', 10))),
  (NULL, 'Lufuno', 'Rams Ramovha', 'rams@ramspm.co.za', '0765906474', crypt('Lufuno6474', gen_salt('bf', 10))),
  (NULL, 'Innocent', 'Mwale', 'innocent.mwale5@gmail.com', '0718904569', crypt('Innocent4569', gen_salt('bf', 10))),
  (NULL, 'Matshidiso', 'Khafela', 'tshidikhafela02@icloud.com', '0642122630', crypt('Matshidiso2630', gen_salt('bf', 10))),
  (NULL, 'Sibusiso', 'Maqusa Sifiso Skosana', 'sanchezskosana@gmail.com', '0791106720', crypt('Sibusiso6720', gen_salt('bf', 10))),
  (NULL, 'Siphelele', 'Nkumane', 'siphelele.nkumane@gmail.com', '0823107592', crypt('Siphelele7592', gen_salt('bf', 10))),
  (NULL, 'Michael', 'Monareng', 'monarengadv@gmail.com', '0727347882', crypt('Michael7882', gen_salt('bf', 10))),
  (NULL, 'Teke', 'Mothibe', 'teke.mothibe@implats.co.za', '0713298012', crypt('Teke8012', gen_salt('bf', 10))),
  (NULL, 'Diapo', 'Pompi Letsoalo', 'justicemafahle4@gmail.com', '0826029483', crypt('Diapo9483', gen_salt('bf', 10))),
  (NULL, 'Herbert', 'Msagala', 'lmhmsagala@gmail.com', '0717278732', crypt('Herbert8732', gen_salt('bf', 10))),
  (NULL, 'Gideon', 'Louw', 'jannien@louwsconstruction.co.za', '0833740480', crypt('Gideon0480', gen_salt('bf', 10))),
  (NULL, 'Lesiba', 'Lamola', 'lamolaestates@gmail.com', '0768889395', crypt('Lesiba9395', gen_salt('bf', 10))),
  (NULL, 'Reshma', 'Sewraj', 'admin@tshiamelo.co.za', '0615343848', crypt('Reshma3848', gen_salt('bf', 10))),
  (NULL, 'Seipati', 'Modikoane', 'seipati@tsenene.co.za', '0838542208', crypt('Seipati2208', gen_salt('bf', 10))),
  (NULL, 'Adetomiwa', 'Adenle', 'jerade.investment@gmail.com', '0617446672', crypt('Adetomiwa6672', gen_salt('bf', 10))),
  (NULL, 'Thabang', 'Mbembele', 'tmogotsi@pro-servegroup.com', '0792973109', crypt('Thabang3109', gen_salt('bf', 10))),
  (NULL, 'Molemo', 'Ralefeta', 'ralefetamolemo8@gmail.com', '0815477341', crypt('Molemo7341', gen_salt('bf', 10))),
  (NULL, 'Johannes', 'Marcus Floor', 'mark@propcon.net', '0845551247', crypt('Johannes1247', gen_salt('bf', 10))),
  (NULL, 'Livhuwani', 'Rosemary Ndou', 'mbedzintike@gmail.com', '0793559816', crypt('Livhuwani9816', gen_salt('bf', 10))),
  (NULL, 'Maanda', 'Nemadandila', 'nem5753@gmail.com', '0739600031', crypt('Maanda0031', gen_salt('bf', 10))),
  (NULL, 'James', 'Kurewa', 'jtkureva@gmail.com', '0618778514', crypt('James8514', gen_salt('bf', 10))),
  (NULL, 'Olalekan', 'Fapohunda', 'biznessengineofficial@gmail.com', '0733599261', crypt('Olalekan9261', gen_salt('bf', 10))),
  (NULL, 'Matello', 'Sambo', 'keke.sambo4@gmail.com', '0722377802', crypt('Matello7802', gen_salt('bf', 10))),
  (NULL, 'Mandlenkosi', 'Swabata Linda', 'joslyn@paradiseinv.co.za', '0645241650', crypt('Mandlenkosi1650', gen_salt('bf', 10))),
  (NULL, 'Makhosonke', 'Sangweni', 'makho2060@gmail.com', '0713501475', crypt('Makhosonke1475', gen_salt('bf', 10))),
  (NULL, 'Gideon', 'Keabetswe Kubu', 'kubu@kwenatisolutions.co.za', '0823872123', crypt('Gideon2123', gen_salt('bf', 10))),
  (NULL, 'Simon', 'Maile', 'maile.simon@yahoo.com', '0734885341', crypt('Simon5341', gen_salt('bf', 10))),
  (NULL, 'Aobakwe', 'Reginald Mayoyo', 'aobakwe.mayoyo@yahoo.com', '0794725026', crypt('Aobakwe5026', gen_salt('bf', 10))),
  (NULL, 'Lucky', 'Tjege', 'veztp@hotmail.com', '0768173887', crypt('Lucky3887', gen_salt('bf', 10))),
  (NULL, 'Seth', 'Emmanuel Sikhwivhilu', 'sikhwivhiluse@gmail.com', '0729690251', crypt('Seth0251', gen_salt('bf', 10))),
  (NULL, 'Irlyne', 'Mabote', 'bobikimalekgotla@yahoo.com', '0697534051', crypt('Irlyne4051', gen_salt('bf', 10))),
  (NULL, 'Mpho', 'Khorombi', 'mpho5761@live.com', '0745555272', crypt('Mpho5272', gen_salt('bf', 10)))
on conflict (email) do update set phone = excluded.phone;

-- ═════════════════════════════════════════════════════════════════════════════
-- 3. ACCOMMODATIONS  (every property linked to its landlord via landlord_id)
-- ═════════════════════════════════════════════════════════════════════════════
insert into public.accommodations (
  landlord_id, fname, lname, phone, email, address, city,
  acc_name, acc_location, acc_capacity, acc_contact,
  supports_nsfas, supports_other, supports_self
)
values
  ((select id from public.landlords where email = 'm.esekgobela@gmail.com'), 'Motanya', 'Sekgobela', '0837970763', 'm.esekgobela@gmail.com', '21 Andrew Murray Street, Vanderbijlpark S. E. 7, Vanderbijlpark, South Africa', 'Vanderbijlpark', '21 Andrew Murray Street', 'Vanderbijlpark S. E. 7, Vanderbijlpark', 10, 'm.esekgobela@gmail.com', true, false, true),
  ((select id from public.landlords where email = 'lebogile105@gmail.com'), 'Moleboheng', 'Joyce Selialia', '0823353594', 'lebogile105@gmail.com', '10 Demeter Road, Bedworth Park, Vereeniging, South Africa', 'Vereeniging', 'House 10 Deneter Ave', 'Bedworth Park, Vereeniging', 21, 'lebogile105@gmail.com', true, false, true),
  ((select id from public.landlords where email = 'mamailula2023@gmail.com'), 'Thulani', 'Mkoena', '0658776288', 'mamailula2023@gmail.com', '40 Beaconsfield Avenue, Vereeniging, South Africa', 'Vereeniging', 'Edinmoor', 'Vereeniging', 113, 'mamailula2023@gmail.com', true, false, true),
  ((select id from public.landlords where email = 'mosamachesa@gmail.com'), 'Mosa', 'Machesa', '0745875156', 'mosamachesa@gmail.com', '6 Henri Van Wyk Street, Vanderbijlpark S. E. 7, Vanderbijlpark, South Africa', 'Vanderbijlpark', 'Lapeng Student Accommodation', 'Vanderbijlpark S. E. 7, Vanderbijlpark', 11, 'mosamachesa@gmail.com', true, false, true),
  ((select id from public.landlords where email = 'selinabthulare@gmail.com'), 'Boitumelo', 'Thulare', '0731860332', 'selinabthulare@gmail.com', '15 Andrew Murray Street, Vanderbijlpark S. E. 7, Vanderbijlpark, South Africa', 'Vanderbijlpark', '15 Andrew Murray', 'Vanderbijlpark S. E. 7, Vanderbijlpark', 11, 'selinabthulare@gmail.com', true, false, true),
  ((select id from public.landlords where email = 'kaelo.properties@gmail.com'), 'Molate', 'Samuel Talane', '0645026850', 'kaelo.properties@gmail.com', '29 Sparrman Street, Vanderbijlpark S. E. 7, Vanderbijlpark, South Africa', 'Vanderbijlpark', 'Kaelo Properties', 'Vanderbijlpark S. E. 7, Vanderbijlpark', 10, 'kaelo.properties@gmail.com', true, false, true),
  ((select id from public.landlords where email = 'wayne53herbert@gmail.com'), 'Trevor', 'Herbert', '0823213016', 'wayne53herbert@gmail.com', '27 Helios Avenue, Bedworth Park, Vereeniging, South Africa', 'Vereeniging', '27 Helios Building 2', 'Bedworth Park, Vereeniging', 8, 'wayne53herbert@gmail.com', true, false, true),
  ((select id from public.landlords where email = 'info.egi22@gmail.com'), 'Deslandi', 'Fernando', '0746001884', 'info.egi22@gmail.com', '3 Willie Collins Street, Vanderbijlpark S. E. 7, Vanderbijlpark, South Africa', 'Vanderbijlpark', 'TCM Developments (Pty) Ltd', 'Vanderbijlpark S. E. 7, Vanderbijlpark', 11, 'info.egi22@gmail.com', true, false, true),
  ((select id from public.landlords where email = 'sekelejoe@gmail.com'), 'Johannes', 'Sekele', '0833213679', 'sekelejoe@gmail.com', 'No. 24 Andrew Murray Street, Vanderbijlpark S. E. 7, Vanderbijlpark, South Africa', 'Vanderbijlpark', 'Johannes Sekele', 'Vanderbijlpark S. E. 7, Vanderbijlpark', 16, 'sekelejoe@gmail.com', true, false, true),
  ((select id from public.landlords where email = 'likeleli2@gmail.com'), 'Lydia', 'Mbele', '0715732878', 'likeleli2@gmail.com', '15 Theo Wassenaar Street, Vanderbijlpark S. E. 7, Vanderbijlpark, South Africa', 'Vanderbijlpark', 'Likeleli', 'Vanderbijlpark S. E. 7, Vanderbijlpark', 10, 'likeleli2@gmail.com', true, false, true),
  ((select id from public.landlords where email = 'rocharlaccomodation@gmail.com'), 'Mukhethwa', 'Mudau', '0659356995', 'rocharlaccomodation@gmail.com', '9 Aurora Avenue, Bedworth Park, Vereeniging, South Africa', 'Vereeniging', 'Rocharl Student Accommodation 2 - Aurora', 'Bedworth Park, Vereeniging', 15, 'rocharlaccomodation@gmail.com', true, false, true),
  ((select id from public.landlords where email = 'kjabulile379@gmail.com'), 'Jabulile', 'Kekana', '0832603291', 'kjabulile379@gmail.com', '21 Fortuna Avenue, Bedworth Park, Vereeniging, South Africa', 'Vereeniging', 'Natalia Student Accommodation', 'Bedworth Park, Vereeniging', 16, 'kjabulile379@gmail.com', true, false, true),
  ((select id from public.landlords where email = 'connix.rademan@gmail.com'), 'Connie', 'Rademan', '0711728298', 'connix.rademan@gmail.com', 'Canopus Crescent, Bedworth Park, Vereeniging, South Africa', 'Vereeniging', 'Student Junxion 2', 'Bedworth Park, Vereeniging', 8, 'connix.rademan@gmail.com', true, false, true),
  ((select id from public.landlords where email = 'mohanoep@yahoo.com'), 'Prince', 'Duru', '0605044850', 'mohanoep@yahoo.com', '12 Helios Avenue, Bedworth Park, Vereeniging, South Africa', 'Vereeniging', 'Ogssian Properties T/A Houston House', 'Bedworth Park, Vereeniging', 20, 'mohanoep@yahoo.com', true, false, true),
  ((select id from public.landlords where email = 'louis@llsecurity.co.za'), 'Louis', 'Buthelezi', '0730417270', 'louis@llsecurity.co.za', 'Cassandra Avenue, Bedworth Park, Vereeniging, South Africa', 'Vereeniging', 'Louisville Facilities (Pty) Ltd', 'Bedworth Park, Vereeniging', 258, 'louis@llsecurity.co.za', true, false, true),
  ((select id from public.landlords where email = 'khuselasipika2@gmail.com'), 'Khusela', 'Sipika', '0814763922', 'khuselasipika2@gmail.com', 'No 14 James Cook Street, Vanderbijlpark S. E. 7, Vanderbijlpark, South Africa', 'Vanderbijlpark', 'Gida Student Palace 2', 'Vanderbijlpark S. E. 7, Vanderbijlpark', 36, 'khuselasipika2@gmail.com', true, false, true),
  ((select id from public.landlords where email = 'b_muofhe@yahoo.com'), 'Balanganani', 'Comfort Muofhe', '0719118922', 'b_muofhe@yahoo.com', 'Glanville Street, Vanderbijlpark S. E. 7, Vanderbijlpark, South Africa', 'Vanderbijlpark', 'Ralu Accommodation 2', 'Vanderbijlpark S. E. 7, Vanderbijlpark', 14, 'b_muofhe@yahoo.com', true, false, true),
  ((select id from public.landlords where email = 'rams@ramspm.co.za'), 'Lufuno', 'Rams Ramovha', '0765906474', 'rams@ramspm.co.za', 'No 18 Hugo Naude Street, Vanderbijlpark S. E. 7, Vanderbijlpark, South Africa', 'Vanderbijlpark', 'OPI Student Accommodation', 'Vanderbijlpark S. E. 7, Vanderbijlpark', 21, 'rams@ramspm.co.za', true, false, true),
  ((select id from public.landlords where email = 'innocent.mwale5@gmail.com'), 'Innocent', 'Mwale', '0718904569', 'innocent.mwale5@gmail.com', '45 General Froneman Street, Vanderbijlpark S. E. 7, Vanderbijlpark, South Africa', 'Vanderbijlpark', 'Bethel House 45', 'Vanderbijlpark S. E. 7, Vanderbijlpark', 17, 'innocent.mwale5@gmail.com', true, false, true),
  ((select id from public.landlords where email = 'tshidikhafela02@icloud.com'), 'Matshidiso', 'Khafela', '0642122630', 'tshidikhafela02@icloud.com', '22 Ithaca Avenue, Bedworth Park, Vereeniging, South Africa', 'Vereeniging', 'Bokamoso Batho Student Accommodation', 'Bedworth Park, Vereeniging', 16, 'tshidikhafela02@icloud.com', true, false, true),
  ((select id from public.landlords where email = 'sanchezskosana@gmail.com'), 'Sibusiso', 'Maqusa Sifiso Skosana', '0791106720', 'sanchezskosana@gmail.com', '14 Fortuna Avenue, Bedworth Park, Vereeniging, South Africa', 'Vereeniging', 'Samorwa Villages @ Aloe', 'Bedworth Park, Vereeniging', 84, 'sanchezskosana@gmail.com', true, false, true),
  ((select id from public.landlords where email = 'siphelele.nkumane@gmail.com'), 'Siphelele', 'Nkumane', '0823107592', 'siphelele.nkumane@gmail.com', '31 Cornwallis Harris Street, Vanderbijlpark S. E. 7, Vanderbijlpark, South Africa', 'Vanderbijlpark', 'Nkumane Property', 'Vanderbijlpark S. E. 7, Vanderbijlpark', 24, 'siphelele.nkumane@gmail.com', true, false, true),
  ((select id from public.landlords where email = 'monarengadv@gmail.com'), 'Michael', 'Monareng', '0727347882', 'monarengadv@gmail.com', '35 F W Beyers Street, Vanderbijlpark C. C., Vanderbijlpark, South Africa', 'Vanderbijlpark', 'Santrust Roval Student Accommodation Extended', 'Vanderbijlpark C. C., Vanderbijlpark', 46, 'monarengadv@gmail.com', true, false, true),
  ((select id from public.landlords where email = 'teke.mothibe@implats.co.za'), 'Teke', 'Mothibe', '0713298012', 'teke.mothibe@implats.co.za', '38 Piet Retief Boulevard, Vanderbijlpark S. E. 10, Vanderbijlpark, South Africa', 'Vanderbijlpark', 'The Boulevard Estate Unit 38', 'Vanderbijlpark S. E. 10, Vanderbijlpark', 3, 'teke.mothibe@implats.co.za', true, false, true),
  ((select id from public.landlords where email = 'justicemafahle4@gmail.com'), 'Diapo', 'Pompi Letsoalo', '0826029483', 'justicemafahle4@gmail.com', '36 Sparrman Street, Vanderbijlpark S. E. 7, Vanderbijlpark, South Africa', 'Vanderbijlpark', 'Makgora', 'Vanderbijlpark S. E. 7, Vanderbijlpark', 22, 'justicemafahle4@gmail.com', true, false, true),
  ((select id from public.landlords where email = 'lmhmsagala@gmail.com'), 'Herbert', 'Msagala', '0717278732', 'lmhmsagala@gmail.com', '20 Ganymede Avenue, Bedworth Park, Vereeniging, South Africa', 'Vereeniging', 'Herbert Msagala', 'Bedworth Park, Vereeniging', 55, 'lmhmsagala@gmail.com', true, false, true),
  ((select id from public.landlords where email = 'jannien@louwsconstruction.co.za'), 'Gideon', 'Louw', '0833740480', 'jannien@louwsconstruction.co.za', 'Goodyear Street, Vanderbijlpark C. W. 6, Vanderbijlpark, South Africa', 'Vanderbijlpark', 'Goodyear Square', 'Vanderbijlpark C. W. 6, Vanderbijlpark', 340, 'jannien@louwsconstruction.co.za', true, false, true),
  ((select id from public.landlords where email = 'lamolaestates@gmail.com'), 'Lesiba', 'Lamola', '0768889395', 'lamolaestates@gmail.com', '25 Cornwallis Harris Street, Vanderbijlpark S. E. 7, Vanderbijlpark, South Africa', 'Vanderbijlpark', 'Lamola Estates', 'Vanderbijlpark S. E. 7, Vanderbijlpark', 93, 'lamolaestates@gmail.com', true, false, true),
  ((select id from public.landlords where email = 'admin@tshiamelo.co.za'), 'Reshma', 'Sewraj', '0615343848', 'admin@tshiamelo.co.za', '29 Penelope Street, Bedworth Park, Vereeniging, South Africa', 'Vereeniging', 'Tshiamelo Lofts', 'Bedworth Park, Vereeniging', 144, 'admin@tshiamelo.co.za', true, false, true),
  ((select id from public.landlords where email = 'info.egi22@gmail.com'), 'Deslandi', 'Fernando', '0746001884', 'info.egi22@gmail.com', '5 Sammons Street, Vanderbijlpark S. E. 7, Vanderbijlpark, South Africa', 'Vanderbijlpark', 'BCM Property (PTY) Ltd', 'Vanderbijlpark S. E. 7, Vanderbijlpark', 10, 'info.egi22@gmail.com', true, false, true),
  ((select id from public.landlords where email = 'seipati@tsenene.co.za'), 'Seipati', 'Modikoane', '0838542208', 'seipati@tsenene.co.za', '4 Athenia Avenue, Bedworth Park, Vereeniging, South Africa', 'Vereeniging', 'Jodipath Accommodation', 'Bedworth Park, Vereeniging', 9, 'seipati@tsenene.co.za', true, false, true),
  ((select id from public.landlords where email = 'jerade.investment@gmail.com'), 'Adetomiwa', 'Adenle', '0617446672', 'jerade.investment@gmail.com', '38 Penelope Street, Bedworth Park, Vereeniging, South Africa', 'Vereeniging', 'House 38 - II', 'Bedworth Park, Vereeniging', 15, 'jerade.investment@gmail.com', true, false, true),
  ((select id from public.landlords where email = 'tmogotsi@pro-servegroup.com'), 'Thabang', 'Mbembele', '0792973109', 'tmogotsi@pro-servegroup.com', '22 Aurora Avenue, Bedworth Park, Vereeniging, South Africa', 'Vereeniging', '22 Aurora Student Living', 'Bedworth Park, Vereeniging', 12, 'tmogotsi@pro-servegroup.com', true, false, true),
  ((select id from public.landlords where email = 'ralefetamolemo8@gmail.com'), 'Molemo', 'Ralefeta', '0815477341', 'ralefetamolemo8@gmail.com', '24-26 Sparrman Street, Vanderbijlpark S. E. 7, Vanderbijlpark, South Africa', 'Vanderbijlpark', 'ABAVIVA Student Accommodation', 'Vanderbijlpark S. E. 7, Vanderbijlpark', 17, 'ralefetamolemo8@gmail.com', true, false, true),
  ((select id from public.landlords where email = 'mark@propcon.net'), 'Johannes', 'Marcus Floor', '0845551247', 'mark@propcon.net', 'Longfellow Street, Vanderbijlpark C. W. 6, Vanderbijlpark, South Africa', 'Vanderbijlpark', 'Taung Village', 'Vanderbijlpark C. W. 6, Vanderbijlpark', 672, 'mark@propcon.net', true, false, true),
  ((select id from public.landlords where email = 'mbedzintike@gmail.com'), 'Livhuwani', 'Rosemary Ndou', '0793559816', 'mbedzintike@gmail.com', '14 William Porter Street, Vanderbijlpark S. E. 7, Vanderbijlpark, South Africa', 'Vanderbijlpark', 'MNK Student Accommodation', 'Vanderbijlpark S. E. 7, Vanderbijlpark', 15, 'mbedzintike@gmail.com', true, false, true),
  ((select id from public.landlords where email = 'nem5753@gmail.com'), 'Maanda', 'Nemadandila', '0739600031', 'nem5753@gmail.com', '11 Andries Potgieter Boulevard, Vanderbijlpark S. E. 7, Vanderbijlpark, South Africa', 'Vanderbijlpark', 'Khayalihle Student Accommodation', 'Vanderbijlpark S. E. 7, Vanderbijlpark', 13, 'nem5753@gmail.com', true, false, true),
  ((select id from public.landlords where email = 'jtkureva@gmail.com'), 'James', 'Kurewa', '0618778514', 'jtkureva@gmail.com', '13 Sparrman Street, Vanderbijlpark S. E. 7, Vanderbijlpark, South Africa', 'Vanderbijlpark', 'Extension B 13 Sparrman', 'Vanderbijlpark S. E. 7, Vanderbijlpark', 5, 'jtkureva@gmail.com', true, false, true),
  ((select id from public.landlords where email = 'biznessengineofficial@gmail.com'), 'Olalekan', 'Fapohunda', '0733599261', 'biznessengineofficial@gmail.com', '57 General Froneman Street, Vanderbijlpark S. E. 7, Vanderbijlpark, South Africa', 'Vanderbijlpark', 'J and D Property Management', 'Vanderbijlpark S. E. 7, Vanderbijlpark', 10, 'biznessengineofficial@gmail.com', true, false, true),
  ((select id from public.landlords where email = 'keke.sambo4@gmail.com'), 'Matello', 'Sambo', '0722377802', 'keke.sambo4@gmail.com', '10 Fortuna Avenue, Bedworth Park, Vereeniging, South Africa', 'Vereeniging', 'Wongke Properties', 'Bedworth Park, Vereeniging', 32, 'keke.sambo4@gmail.com', true, false, true),
  ((select id from public.landlords where email = 'joslyn@paradiseinv.co.za'), 'Mandlenkosi', 'Swabata Linda', '0645241650', 'joslyn@paradiseinv.co.za', '15 Andries Potgieter Boulevard, Vanderbijlpark S. E. 7, Vanderbijlpark, South Africa', 'Vanderbijlpark', 'Paradise Properties', 'Vanderbijlpark S. E. 7, Vanderbijlpark', 38, 'joslyn@paradiseinv.co.za', true, false, true),
  ((select id from public.landlords where email = 'makho2060@gmail.com'), 'Makhosonke', 'Sangweni', '0713501475', 'makho2060@gmail.com', 'Cassandra Avenue, Bedworth Park, Vereeniging, South Africa', 'Vereeniging', '25 Cassandra Avenue', 'Bedworth Park, Vereeniging', 50, 'makho2060@gmail.com', true, false, true),
  ((select id from public.landlords where email = 'kubu@kwenatisolutions.co.za'), 'Gideon', 'Keabetswe Kubu', '0823872123', 'kubu@kwenatisolutions.co.za', '52 General Froneman Street, Vanderbijlpark S. E. 7, Vanderbijlpark, South Africa', 'Vanderbijlpark', 'HAFH Property', 'Vanderbijlpark S. E. 7, Vanderbijlpark', 11, 'kubu@kwenatisolutions.co.za', true, false, true),
  ((select id from public.landlords where email = 'maile.simon@yahoo.com'), 'Simon', 'Maile', '0734885341', 'maile.simon@yahoo.com', '9 Henri Van Wyk Street, Vanderbijlpark S. E. 7, Vanderbijlpark, South Africa', 'Vanderbijlpark', 'House 9 Student Accommodation', 'Vanderbijlpark S. E. 7, Vanderbijlpark', 15, 'maile.simon@yahoo.com', true, false, true),
  ((select id from public.landlords where email = 'aobakwe.mayoyo@yahoo.com'), 'Aobakwe', 'Reginald Mayoyo', '0794725026', 'aobakwe.mayoyo@yahoo.com', '46 Hans Van Rensburg Street, Vanderbijlpark S. E. 7, Vanderbijlpark, South Africa', 'Vanderbijlpark', 'Reggy''s Student Accom', 'Vanderbijlpark S. E. 7, Vanderbijlpark', 2, 'aobakwe.mayoyo@yahoo.com', true, false, true),
  ((select id from public.landlords where email = 'veztp@hotmail.com'), 'Lucky', 'Tjege', '0768173887', 'veztp@hotmail.com', '26 Cornwallis Harris Street, Vanderbijlpark S. E. 7, Vanderbijlpark, South Africa', 'Vanderbijlpark', 'Lucky Alfred Tjege', 'Vanderbijlpark S. E. 7, Vanderbijlpark', 41, 'veztp@hotmail.com', true, false, true),
  ((select id from public.landlords where email = 'sikhwivhiluse@gmail.com'), 'Seth', 'Emmanuel Sikhwivhilu', '0729690251', 'sikhwivhiluse@gmail.com', '11 Helios Avenue, Bedworth Park, Vereeniging, South Africa', 'Vereeniging', 'Grad Accommodations', 'Bedworth Park, Vereeniging', 22, 'sikhwivhiluse@gmail.com', true, false, true),
  ((select id from public.landlords where email = 'bobikimalekgotla@yahoo.com'), 'Irlyne', 'Mabote', '0697534051', 'bobikimalekgotla@yahoo.com', '7 Athenia Avenue, Bedworth Park, Vereeniging, South Africa', 'Vereeniging', 'Stephen and Bassie (J) Accommodation', 'Bedworth Park, Vereeniging', 25, 'bobikimalekgotla@yahoo.com', true, false, true),
  ((select id from public.landlords where email = 'mpho5761@live.com'), 'Mpho', 'Khorombi', '0745555272', 'mpho5761@live.com', '33 Ganymede Avenue, Bedworth Park, Vereeniging, South Africa', 'Vereeniging', 'VSR', 'Bedworth Park, Vereeniging', 40, 'mpho5761@live.com', true, false, true),
  ((select id from public.landlords where email = 'rocharlaccomodation@gmail.com'), 'Mukhethwa', 'Mudau', '0659356995', 'rocharlaccomodation@gmail.com', 'Vereeniging Road, Vereeniging, South Africa', 'Vereeniging', 'Rocharl Student Accommodation 1 - Boreas', 'Vereeniging', 35, 'rocharlaccomodation@gmail.com', true, false, true)
on conflict (acc_name) do update set
  landlord_id   = excluded.landlord_id,
  fname         = excluded.fname,
  lname         = excluded.lname,
  phone         = excluded.phone,
  email         = excluded.email,
  address       = excluded.address,
  city          = excluded.city,
  acc_location  = excluded.acc_location,
  acc_capacity  = excluded.acc_capacity,
  acc_contact   = excluded.acc_contact;

-- ═════════════════════════════════════════════════════════════════════════════
-- 4. LOGIN RPC FUNCTIONS  (bcrypt password checks happen inside Postgres)
--    Returns the user as json on success, NULL on wrong credentials.
-- ═════════════════════════════════════════════════════════════════════════════
create or replace function public.verify_admin(p_username text, p_password text)
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    'id', a.id,
    'username', a.username,
    'email', a.email,
    'role', 'admin'
  )
  from public.admins a
  where a.username = p_username
    and a.password_hash = crypt(p_password, a.password_hash)
  limit 1;
$$;

create or replace function public.verify_landlord(p_email text, p_password text)
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    'id', l.id,
    'fname', l.fname,
    'lname', l.lname,
    'name', l.fname || ' ' || l.lname,
    'email', l.email,
    'phone', l.phone,
    'role', 'landlord'
  )
  from public.landlords l
  where lower(l.email) = lower(p_email)
    and l.password_hash = crypt(p_password, l.password_hash)
  limit 1;
$$;

grant execute on function public.verify_admin(text, text) to anon, authenticated;
grant execute on function public.verify_landlord(text, text) to anon, authenticated;

-- ═════════════════════════════════════════════════════════════════════════════
-- 5. BOOKING COLUMNS used by the app that the legacy schema lacked
-- ═════════════════════════════════════════════════════════════════════════════
alter table public.bookings add column if not exists booking_ref text;
alter table public.bookings add column if not exists room_type   text;

-- Optional monthly rate. NULL unless the landlord explicitly prices the
-- property for self-paying students. NSFAS/bursary-funded properties stay NULL.
alter table public.accommodations
  add column if not exists price_per_month numeric(10, 2);

-- ═════════════════════════════════════════════════════════════════════════════
-- 6. STUDENT PROFILES  (accounts live in Supabase Auth -> real confirmation
--    emails are sent automatically on sign-up; this table holds profile data)
-- ═════════════════════════════════════════════════════════════════════════════
create table if not exists public.students (
  id             uuid primary key default gen_random_uuid(),
  auth_user_id   uuid unique references auth.users (id) on delete cascade,
  name           text not null,
  surname        text not null,
  student_number varchar(9)   not null unique,
  id_number      varchar(13)  not null unique,
  phone          varchar(10)  not null,
  email          varchar(150) not null unique,
  dob            date not null,
  gender         text not null default 'Not specified',
  year_of_study  text not null
                 check (year_of_study in ('1st year', '2nd year', '3rd year', '4th year', 'Postgrad')),
  bursary_type   text not null default 'NSFAS'
                 check (bursary_type in ('NSFAS', 'Merit Bursary', 'Self-paying', 'Other')),
  bursary_other  text,
  created_at     timestamptz not null default now()
);

alter table public.students enable row level security;

drop policy if exists "Dev read students" on public.students;
create policy "Dev read students"
  on public.students for select to anon, authenticated using (true);

drop policy if exists "Dev write students" on public.students;
create policy "Dev write students"
  on public.students for all to anon, authenticated using (true) with check (true);

-- ═════════════════════════════════════════════════════════════════════════════
-- 7. AUDIT TRAIL + ADMIN PROFILE MANAGEMENT
--    Every admin action (approvals, deletions, edits) is recorded here so we
--    know WHO did WHAT and WHEN.
-- ═════════════════════════════════════════════════════════════════════════════
create table if not exists public.audit_logs (
  id             uuid primary key default gen_random_uuid(),
  admin_id       uuid,
  admin_username text not null,
  action         text not null,
  entity_type    text not null,
  entity_id      text,
  entity_label   text,
  details        text,
  created_at     timestamptz not null default now()
);

create index if not exists idx_audit_logs_created_at
  on public.audit_logs (created_at desc);

alter table public.audit_logs enable row level security;

drop policy if exists "Dev read audit_logs" on public.audit_logs;
create policy "Dev read audit_logs"
  on public.audit_logs for select to anon, authenticated using (true);

drop policy if exists "Dev write audit_logs" on public.audit_logs;
create policy "Dev write audit_logs"
  on public.audit_logs for insert to anon, authenticated with check (true);

-- Allows an admin to change their own password from the Profile tab.
create or replace function public.update_admin_password(p_admin_id uuid, p_new_password text)
returns void
language sql
security definer
set search_path = public, extensions
as $$
  update public.admins
     set password_hash = crypt(p_new_password, gen_salt('bf', 10))
   where id = p_admin_id;
$$;

grant execute on function public.update_admin_password(uuid, text) to anon, authenticated;

-- ── VERIFY ────────────────────────────────────────────────────────────────
-- select username from public.admins;
-- select count(*) as landlords from public.landlords;
-- Test login (should return the admin row):
-- select public.verify_admin('admin@prince', 'prince@Accommodations');
-- select acc_name, acc_capacity, l.fname, l.lname
--   from public.accommodations a join public.landlords l on l.id = a.landlord_id;