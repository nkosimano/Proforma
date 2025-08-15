-- Fix user_roles role check constraint to allow 'user' role (and migrate any legacy 'sales' to 'user')

-- 1) Update any existing rows using legacy 'sales' role to 'user'
UPDATE public.user_roles
SET role = 'user'
WHERE role = 'sales';

-- 2) Drop existing CHECK constraint if present
ALTER TABLE public.user_roles
DROP CONSTRAINT IF EXISTS user_roles_role_check;

-- 3) Recreate CHECK constraint with the correct allowed roles
ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_role_check
CHECK (role IN ('admin', 'user', 'viewer'));

-- 4) Ensure unique index remains valid (no-op if already exists)
CREATE UNIQUE INDEX IF NOT EXISTS user_roles_user_id_role_idx
  ON public.user_roles (user_id, role);