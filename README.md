# React + Vite + Supabase

This project is a modern React application built with Vite and configured to use Supabase as its backend.

## Supabase configuration

1. Create or sign in to a Supabase project at https://app.supabase.com.
2. In the project settings, copy the `URL` for your project.
3. In the `Settings > API` section, copy the `anon` public key.
4. In `NEW_VUT/modern-app`, create a file named `.env` by copying the `.env.example` file.

```powershell
cd NEW_VUT/modern-app
copy .env.example .env
```

5. Open `.env` and set your Supabase values:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

6. Start the application:

```powershell
npm install
npm run dev
```

The React app uses `src/supabaseClient.js` to connect to Supabase.

## Database schema

This application expects two tables in Supabase:

- `accommodations`
- `bookings`

You can create them using the SQL script in `NEW_VUT/modern-app/supabase-schema.sql` or by running the script in the Supabase SQL editor.

### Recommended SQL schema

```sql
create table if not exists accommodations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  capacity integer not null default 0,
  created_at timestamptz default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  student_number text not null,
  id_number text not null,
  email text not null,
  phone text not null,
  year_of_study text not null,
  bursary_type text not null,
  accommodation_id uuid references accommodations(id),
  booking_status text not null default 'pending',
  created_at timestamptz default now()
);
```

## App behavior

- The booking form submits entries to the `bookings` table.
- Available accommodations are loaded from the `accommodations` table.
- Recent bookings are shown from the `bookings` table.

## Troubleshooting

- If the app reports `Supabase is not configured`, verify `.env` is present and the values are valid.
- Make sure the Supabase API keys are in `.env` and not committed to source control.
- If table queries fail, verify the tables exist and column names match the schema above.
