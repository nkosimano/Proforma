-- Add user_id column to currencies table
ALTER TABLE public.currencies ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add is_default column if it doesn't exist
ALTER TABLE public.currencies ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;

-- Remove the old is_base column and replace with is_default
ALTER TABLE public.currencies DROP COLUMN IF EXISTS is_base;

-- Update existing currencies to have no user_id (global currencies)
-- These will be available to all users as default options
UPDATE public.currencies SET user_id = NULL WHERE user_id IS NULL;

-- Update RLS policies to handle user-specific currencies
DROP POLICY IF EXISTS "Allow read access to currencies" ON public.currencies;
DROP POLICY IF EXISTS "Allow authenticated users to manage currencies" ON public.currencies;

-- New policies for user-specific currencies
CREATE POLICY "Users can view global and their own currencies" ON public.currencies
  FOR SELECT USING (
    user_id IS NULL OR 
    user_id = auth.uid()
  );

CREATE POLICY "Users can insert their own currencies" ON public.currencies
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );

CREATE POLICY "Users can update their own currencies" ON public.currencies
  FOR UPDATE USING (
    user_id = auth.uid()
  );

CREATE POLICY "Users can delete their own currencies" ON public.currencies
  FOR DELETE USING (
    user_id = auth.uid()
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_currencies_user_id ON public.currencies(user_id);
CREATE INDEX IF NOT EXISTS idx_currencies_user_default ON public.currencies(user_id, is_default) WHERE is_default = true;

-- Update the default currencies to not be default (users will set their own defaults)
UPDATE public.currencies SET is_default = false WHERE user_id IS NULL;