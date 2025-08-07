-- Add missing columns to user_roles table
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing records to have default values
UPDATE public.user_roles 
SET 
  name = CASE 
    WHEN role = 'admin' THEN 'Administrator'
    WHEN role = 'user' THEN 'User'
    WHEN role = 'viewer' THEN 'Viewer'
    ELSE INITCAP(role)
  END,
  description = CASE 
    WHEN role = 'admin' THEN 'Full system access with all permissions'
    WHEN role = 'user' THEN 'Standard user access'
    WHEN role = 'viewer' THEN 'Read-only access to most data'
    ELSE 'Custom role'
  END,
  permissions = CASE 
    WHEN role = 'admin' THEN '[
      "invoice:create", "invoice:read", "invoice:update", "invoice:delete", "invoice:send",
      "quote:create", "quote:read", "quote:update", "quote:delete", "quote:convert",
      "customer:create", "customer:read", "customer:update", "customer:delete",
      "payment:create", "payment:read", "payment:update", "payment:delete",
      "recurring:create", "recurring:read", "recurring:update", "recurring:delete",
      "currency:manage", "currency:rates",
      "reports:view", "reports:export",
      "admin:users", "admin:roles", "admin:settings", "admin:backup"
    ]'::jsonb
    WHEN role = 'user' THEN '[
      "invoice:create", "invoice:read", "invoice:update", "invoice:send",
      "quote:create", "quote:read", "quote:update", "quote:convert",
      "customer:create", "customer:read", "customer:update",
      "payment:create", "payment:read", "payment:update",
      "recurring:create", "recurring:read", "recurring:update",
      "reports:view"
    ]'::jsonb
    WHEN role = 'viewer' THEN '[
      "invoice:read", "quote:read", "customer:read", "payment:read",
      "recurring:read", "reports:view"
    ]'::jsonb
    ELSE '[]'::jsonb
  END,
  is_active = true,
  updated_at = NOW()
WHERE name IS NULL;

-- Update the trigger function to handle updated_at for user_roles
CREATE OR REPLACE FUNCTION public.update_user_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS update_user_roles_updated_at_trigger ON public.user_roles;
CREATE TRIGGER update_user_roles_updated_at_trigger
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_roles_updated_at();

-- Grant permissions to ensure the table is accessible
GRANT ALL ON public.user_roles TO authenticated;
GRANT SELECT ON public.user_roles TO anon;