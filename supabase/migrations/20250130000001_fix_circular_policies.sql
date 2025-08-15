-- Fix remaining circular policy issues completely

-- 1. Drop ALL existing policies on user_roles to start fresh
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can manage their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow user role creation during signup" ON public.user_roles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.user_roles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.user_roles;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.user_roles;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.user_roles;

-- 2. Create simple, non-recursive policies for user_roles (with guards for user_id presence)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_roles' AND column_name = 'user_id'
  ) THEN
    CREATE POLICY "Allow users to view their own roles" ON public.user_roles
      FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Allow users to insert their own roles" ON public.user_roles
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Allow users to update their own roles" ON public.user_roles
      FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Allow users to delete their own roles" ON public.user_roles
      FOR DELETE USING (auth.uid() = user_id);
  ELSE
    CREATE POLICY "Allow read access to user_roles" ON public.user_roles
      FOR SELECT USING (true);

    CREATE POLICY "Allow authenticated users to manage user_roles" ON public.user_roles
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END$$;

-- 3. Drop ALL existing policies on currencies to start fresh
DROP POLICY IF EXISTS "Users can view global and their own currencies" ON public.currencies;
DROP POLICY IF EXISTS "Users can insert their own currencies" ON public.currencies;
DROP POLICY IF EXISTS "Users can update their own currencies" ON public.currencies;
DROP POLICY IF EXISTS "Users can delete their own currencies" ON public.currencies;
DROP POLICY IF EXISTS "Enable read access for all currencies" ON public.currencies;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.currencies;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.currencies;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.currencies;
DROP POLICY IF EXISTS "Allow read access to currencies" ON public.currencies;
DROP POLICY IF EXISTS "Allow authenticated users to manage currencies" ON public.currencies;

-- 4. Create simple, non-recursive policies for currencies (with guards for user_id presence)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'currencies' AND column_name = 'user_id'
  ) THEN
    CREATE POLICY "Allow all users to read currencies" ON public.currencies
      FOR SELECT USING (true);

    CREATE POLICY "Allow authenticated users to insert currencies" ON public.currencies
      FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

    CREATE POLICY "Allow users to update their own currencies" ON public.currencies
      FOR UPDATE USING (user_id IS NULL OR auth.uid() = user_id);

    CREATE POLICY "Allow users to delete their own currencies" ON public.currencies
      FOR DELETE USING (user_id IS NULL OR auth.uid() = user_id);
  ELSE
    CREATE POLICY "Allow all users to read currencies" ON public.currencies
      FOR SELECT USING (true);

    CREATE POLICY "Allow authenticated users to insert currencies" ON public.currencies
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');

    CREATE POLICY "Enable update for authenticated users (no user_id)" ON public.currencies
      FOR UPDATE USING (auth.role() = 'authenticated');

    CREATE POLICY "Enable delete for authenticated users (no user_id)" ON public.currencies
      FOR DELETE USING (auth.role() = 'authenticated');
  END IF;
END$$;

-- 5. Ensure RLS is enabled but policies are simple
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;

-- 6. Grant basic permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.currencies TO authenticated;
GRANT SELECT ON public.user_roles TO anon;
GRANT SELECT ON public.currencies TO anon;

-- 7. Update the handle_new_user function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role_type TEXT := 'user';
    user_permissions JSONB;
BEGIN
    -- Check if this is the first user (make them admin)
    IF (SELECT COUNT(*) FROM auth.users) = 1 THEN
        user_role_type := 'admin';
        user_permissions := '[
            "invoice:create", "invoice:read", "invoice:update", "invoice:delete", "invoice:send",
            "quote:create", "quote:read", "quote:update", "quote:delete", "quote:convert",
            "customer:create", "customer:read", "customer:update", "customer:delete",
            "payment:create", "payment:read", "payment:update", "payment:delete",
            "recurring:create", "recurring:read", "recurring:update", "recurring:delete",
            "currency:manage", "currency:rates",
            "reports:view", "reports:export",
            "admin:users", "admin:roles", "admin:settings", "admin:backup"
        ]'::jsonb;
    ELSE
        user_permissions := '[
            "invoice:create", "invoice:read", "invoice:update", "invoice:send",
            "quote:create", "quote:read", "quote:update", "quote:convert",
            "customer:create", "customer:read", "customer:update",
            "payment:create", "payment:read", "payment:update",
            "recurring:create", "recurring:read", "recurring:update",
            "reports:view"
        ]'::jsonb;
    END IF;
    
    -- Create profile (ignore conflicts)
    INSERT INTO public.profiles (user_id, email, full_name, role)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', user_role_type)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Create default user role (ignore conflicts)
    INSERT INTO public.user_roles (user_id, role, name, description, permissions, is_active)
    VALUES (
        NEW.id, 
        user_role_type, 
        CASE WHEN user_role_type = 'admin' THEN 'Administrator' ELSE 'User' END,
        CASE WHEN user_role_type = 'admin' THEN 'Full system access with all permissions' ELSE 'Standard user access' END,
        user_permissions,
        true
    )
    ON CONFLICT DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Grant necessary permissions for the trigger function
GRANT INSERT ON public.profiles TO postgres;
GRANT INSERT ON public.user_roles TO postgres;
GRANT SELECT ON auth.users TO postgres;