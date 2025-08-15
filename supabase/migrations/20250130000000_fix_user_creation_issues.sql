-- Fix user creation issues and circular policy references

-- 1. Drop the problematic circular policy
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- 2. Create a simpler admin policy that doesn't cause recursion
-- We'll use a different approach - check if user has admin role in profiles table
CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() 
      AND p.role = 'admin'
    )
  );

-- 3. Update the handle_new_user function to also create a default user role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create profile
    INSERT INTO public.profiles (user_id, email, full_name, role)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'user');
    
    -- Create default user role for the new user
    INSERT INTO public.user_roles (user_id, role, name, description, permissions, is_active)
    VALUES (
        NEW.id, 
        'user', 
        'User', 
        'Standard user access',
        '[
            "invoice:create", "invoice:read", "invoice:update", "invoice:send",
            "quote:create", "quote:read", "quote:update", "quote:convert",
            "customer:create", "customer:read", "customer:update",
            "payment:create", "payment:read", "payment:update",
            "recurring:create", "recurring:read", "recurring:update",
            "reports:view"
        ]'::jsonb,
        true
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Ensure the trigger exists (recreate if needed)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Add a policy to allow users to insert their initial role during signup
CREATE POLICY "Allow user role creation during signup" ON public.user_roles
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    NOT EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid()
    )
  );

-- 6. Grant necessary permissions for the trigger function
GRANT INSERT ON public.profiles TO postgres;
GRANT INSERT ON public.user_roles TO postgres;

-- 7. Ensure RLS is properly configured
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 8. Add a function to check if this is the first user (for admin assignment)
CREATE OR REPLACE FUNCTION public.is_first_user()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM auth.users) <= 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Update the handle_new_user function to make the first user an admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role_type TEXT := 'user';
    user_permissions JSONB;
BEGIN
    -- Check if this is the first user
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
    
    -- Create profile
    INSERT INTO public.profiles (user_id, email, full_name, role)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', user_role_type);
    
    -- Create default user role for the new user
    INSERT INTO public.user_roles (user_id, role, name, description, permissions, is_active)
    VALUES (
        NEW.id, 
        user_role_type, 
        CASE WHEN user_role_type = 'admin' THEN 'Administrator' ELSE 'User' END,
        CASE WHEN user_role_type = 'admin' THEN 'Full system access with all permissions' ELSE 'Standard user access' END,
        user_permissions,
        true
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();