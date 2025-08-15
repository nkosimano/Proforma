-- Add user_id column to user_roles table
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add created_by column for tracking who created the role
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Delete any existing user_roles records that don't have a valid user_id
-- This is safe for development/testing environments
DELETE FROM public.user_roles WHERE user_id IS NULL;

-- Make user_id NOT NULL after cleaning up existing records
ALTER TABLE public.user_roles 
ALTER COLUMN user_id SET NOT NULL;

-- Update RLS policies to use user_id
DROP POLICY IF EXISTS "Allow read access to user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow authenticated users to manage user_roles" ON public.user_roles;

-- Create new policies that respect user_id
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own roles" ON public.user_roles
    FOR ALL USING (auth.uid() = user_id);

-- Allow admins to manage all roles (if they have admin role)
CREATE POLICY "Admins can manage all roles" ON public.user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin' 
            AND ur.is_active = true
        )
    );

-- Grant permissions
GRANT ALL ON public.user_roles TO authenticated;
GRANT SELECT ON public.user_roles TO anon;