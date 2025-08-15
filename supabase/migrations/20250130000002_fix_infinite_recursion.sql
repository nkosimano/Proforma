-- Fix infinite recursion in user_roles policies with robust guards for differing remote schemas

-- 1. Drop ALL existing policies on user_roles to start fresh
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can manage their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow user role creation during signup" ON public.user_roles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.user_roles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.user_roles;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.user_roles;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.user_roles;
DROP POLICY IF EXISTS "Allow users to view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow users to insert their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow users to update their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow users to delete their own roles" ON public.user_roles;

-- 2. Recreate NON-RECURSIVE policies for user_roles
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_roles' AND column_name = 'user_id'
  ) THEN
    -- Preferred: user-scoped policies when user_id column exists
    CREATE POLICY "Users can view their own roles" ON public.user_roles
      FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own roles" ON public.user_roles
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own roles" ON public.user_roles
      FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own roles" ON public.user_roles
      FOR DELETE USING (auth.uid() = user_id);
  ELSE
    -- Fallback: simple authenticated policies when user_id is not present yet
    CREATE POLICY "Allow read access to user_roles" ON public.user_roles
      FOR SELECT USING (true);

    CREATE POLICY "Allow authenticated users to manage user_roles" ON public.user_roles
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END$$;

-- 3. Admin policy that uses profiles table instead of user_roles (NO RECURSION)
CREATE POLICY IF NOT EXISTS "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() 
      AND p.role = 'admin'
    )
  );

-- 4. Drop ALL existing policies on currencies to start fresh
DROP POLICY IF EXISTS "Users can view global and their own currencies" ON public.currencies;
DROP POLICY IF EXISTS "Users can insert their own currencies" ON public.currencies;
DROP POLICY IF EXISTS "Users can update their own currencies" ON public.currencies;
DROP POLICY IF EXISTS "Users can delete their own currencies" ON public.currencies;
DROP POLICY IF EXISTS "Enable read access for all currencies" ON public.currencies;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.currencies;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.currencies;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.currencies;
DROP POLICY IF EXISTS "Allow all users to read currencies" ON public.currencies;
DROP POLICY IF EXISTS "Allow authenticated users to insert currencies" ON public.currencies;
DROP POLICY IF EXISTS "Allow users to update their own currencies" ON public.currencies;
DROP POLICY IF EXISTS "Allow users to delete their own currencies" ON public.currencies;

-- 5. Recreate NON-RECURSIVE policies for currencies with guards
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'currencies' AND column_name = 'user_id'
  ) THEN
    -- Preferred: user-scoped currencies
    CREATE POLICY "Allow all users to read currencies" ON public.currencies
      FOR SELECT USING (true);

    CREATE POLICY "Allow authenticated users to insert currencies" ON public.currencies
      FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

    CREATE POLICY "Allow users to update their own currencies" ON public.currencies
      FOR UPDATE USING (user_id IS NULL OR auth.uid() = user_id);

    CREATE POLICY "Allow users to delete their own currencies" ON public.currencies
      FOR DELETE USING (user_id IS NULL OR auth.uid() = user_id);
  ELSE
    -- Fallback: do not reference user_id if it doesn't exist yet
    CREATE POLICY "Allow all users to read currencies" ON public.currencies
      FOR SELECT USING (true);

    CREATE POLICY "Enable insert for authenticated users (no user_id)" ON public.currencies
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');

    CREATE POLICY "Enable update for authenticated users (no user_id)" ON public.currencies
      FOR UPDATE USING (auth.role() = 'authenticated');

    CREATE POLICY "Enable delete for authenticated users (no user_id)" ON public.currencies
      FOR DELETE USING (auth.role() = 'authenticated');
  END IF;
END$$;

-- 6. Ensure RLS is enabled
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;

-- 7. Grant basic permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.currencies TO authenticated;
GRANT SELECT ON public.user_roles TO anon;
GRANT SELECT ON public.currencies TO anon;

-- 8. Ensure profiles table exists (if not already created by earlier migrations)
CREATE TABLE IF NOT EXISTS public.profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Enable RLS on profiles and create minimal policies (idempotent)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 10. Grants on profiles
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;