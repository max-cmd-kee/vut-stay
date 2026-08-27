# Supabase setup guide (step by step)

Follow these steps to create your Supabase database with the full VUT schema.

---

## Step 1 — Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) and sign in (or create an account).
2. Click **New project**.
3. Choose your **Organization**.
4. Set:
   - **Project name:** `vut-accommodation` (or any name you prefer)
   - **Database password:** choose a strong password and **save it somewhere safe**
   - **Region:** pick the closest region (e.g. `South Africa` if available, otherwise `EU West`)
5. Click **Create new project** and wait 1–2 minutes for it to finish provisioning.

---

## Step 2 — Run the database schema

1. In your Supabase project, open **SQL Editor** (left sidebar).
2. Click **New query**.
3. Open this file on your computer:

   `NEW_VUT/modern-app/supabase-schema.sql`

4. Copy **the entire contents** of that file and paste them into the SQL Editor.
5. Click **Run** (or press `Ctrl+Enter`).

You should see **Success. No rows returned** (or similar). That is normal.

### What this script creates

| Item | Purpose |
|------|---------|
| `accommodations` | Landlord info, address, capacity, funding flags |
| `accommodation_amenities` | Wi-Fi, laundry, etc. per accommodation |
| `accommodation_images` | Multiple photos per accommodation |
| `bookings` | Student booking records (full legacy fields) |
| Storage bucket `accommodation-images` | For profile/gallery uploads |
| RLS policies | Lets the React app read/write during development |
| Sample data | 3 test accommodations with amenities |

---

## Step 3 — Verify tables were created

In **SQL Editor**, run:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'accommodations',
    'accommodation_amenities',
    'accommodation_images',
    'bookings'
  )
order by table_name;
```

You should see all **4 tables**.

Then check sample data:

```sql
select acc_name, acc_location, acc_capacity
from public.accommodations;
```

You should see 3 rows (VUT Residences Block A, River View Student Lodge, Campus Heights).

---

## Step 4 — Get your API keys

1. Go to **Project Settings** (gear icon) → **API**.
2. Copy these two values:
   - **Project URL** → looks like `https://xxxxx.supabase.co`
   - **anon public** key → long JWT string under **Project API keys**

> Use the **anon** key in the frontend. Never put the **service_role** key in your React app.

---

## Step 5 — Connect the React app

1. Open a terminal in `NEW_VUT/modern-app`.
2. Create your env file:

```powershell
cd C:\xampp\htdocs\vut\NEW_VUT\modern-app
copy .env.example .env
```

3. Edit `.env` and paste your values:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

4. Install and start the app:

```powershell
npm install
npm run dev
```

5. Open the URL shown in the terminal (usually `http://localhost:5173`).

---

## Step 6 — Test end to end

1. The page should show **3 accommodations** in the right panel.
2. Fill in the booking form with **valid test data**:
   - Student number: exactly **9 digits** (e.g. `123456789`)
   - ID number: exactly **13 digits** (e.g. `8001015800085`)
   - Phone: exactly **10 digits** (e.g. `0821234567`)
   - Date of birth: any valid date
3. Click **Send booking request**.
4. In Supabase, open **Table Editor** → **bookings** — your row should appear.
5. The **Recent bookings** table in the app should update.

---

## Step 7 — Confirm storage bucket (optional)

1. Go to **Storage** in the Supabase sidebar.
2. You should see a bucket named **`accommodation-images`**.
3. This will be used later when you add photo uploads for accommodations.

---

## Troubleshooting

### "Supabase is not configured"
- `.env` is missing or empty.
- Restart `npm run dev` after editing `.env` (Vite only reads env vars at startup).

### "Unable to load accommodations" / permission denied
- RLS policies may not have been created. Re-run `supabase-schema.sql`.
- Confirm you used the **anon** key, not the service role key.

### Booking insert fails on validation
The database enforces the same rules as the legacy PHP app:
- Student number: 9 digits
- ID number: 13 digits
- Phone: 10 digits
- Valid email format
- One active booking (Pending or Approved) per student number

### Tables already exist / script partially failed
If you need a clean reset during development:

```sql
drop table if exists public.bookings cascade;
drop table if exists public.accommodation_images cascade;
drop table if exists public.accommodation_amenities cascade;
drop table if exists public.accommodations cascade;
```

Then run `supabase-schema.sql` again.

---

## Schema reference (legacy field mapping)

| Legacy MySQL | Supabase PostgreSQL |
|---|---|
| `bookings.name` | `bookings.name` |
| `bookings.surname` | `bookings.surname` |
| `bookings.phone_number` | `bookings.phone_number` |
| `bookings.registered_at` | `bookings.registered_at` |
| `accommodations.acc_name` | `accommodations.acc_name` |
| `accommodations.acc_location` | `accommodations.acc_location` |
| `accommodation_amenities` | `accommodation_amenities` |
| `accommodation_images` | `accommodation_images` |

---

## Next steps (after database is working)

1. Add Supabase Auth for admin login.
2. Tighten RLS policies (remove dev write access for anon users).
3. Build the admin dashboard in React.
4. Migrate existing MySQL data into Supabase (if needed).
