-- 1. Create profiles table
CREATE TABLE public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  role text default 'customer' check (role in ('customer', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Trigger to automatically create a profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    'customer'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. Create services table
CREATE TABLE public.services (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  duration_minutes integer not null,
  price numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view services" ON services
  FOR SELECT USING (true);

CREATE POLICY "Admins can modify services" ON services
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );


-- 3. Create appointments table
CREATE TABLE public.appointments (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references public.profiles(id) not null,
  service_id uuid references public.services(id) not null,
  appointment_date date not null,
  appointment_time time not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own appointments" ON appointments
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Customers can create appointments" ON appointments
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Admins can view all appointments" ON appointments
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can modify appointments" ON appointments
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
