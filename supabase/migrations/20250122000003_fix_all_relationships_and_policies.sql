-- Fix all database relationship and policy issues

-- 1. Fix recurring_invoices table structure (only if tables exist)
DO $$
BEGIN
    -- Add template_invoice_id column if invoices table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices' AND table_schema = 'public') THEN
        ALTER TABLE public.recurring_invoices ADD COLUMN IF NOT EXISTS template_invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL;
    END IF;
    
    -- Add customer_id foreign key if customers table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers' AND table_schema = 'public') THEN
        ALTER TABLE public.recurring_invoices ADD CONSTRAINT recurring_invoices_customer_id_fkey 
          FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add missing indexes for performance (only if columns exist)
DO $$
BEGIN
    -- Add template_invoice_id index only if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'recurring_invoices' AND column_name = 'template_invoice_id' AND table_schema = 'public') THEN
        CREATE INDEX IF NOT EXISTS idx_recurring_invoices_template_invoice_id ON public.recurring_invoices(template_invoice_id);
    END IF;
    
    -- Add other indexes
    CREATE INDEX IF NOT EXISTS idx_recurring_invoices_next_invoice_date ON public.recurring_invoices(next_invoice_date);
    CREATE INDEX IF NOT EXISTS idx_recurring_invoices_is_active ON public.recurring_invoices(is_active);
END $$;

-- 2. Fix user_roles table policies (remove infinite recursion)
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can delete their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow authenticated users to manage user roles" ON public.user_roles;

-- Create simple, non-recursive policies for user_roles
CREATE POLICY "Enable read access for authenticated users" ON public.user_roles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.user_roles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.user_roles
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON public.user_roles
  FOR DELETE USING (auth.role() = 'authenticated');

-- 3. Fix currencies table policies (remove recursion)
DROP POLICY IF EXISTS "Users can view global and their own currencies" ON public.currencies;
DROP POLICY IF EXISTS "Users can insert their own currencies" ON public.currencies;
DROP POLICY IF EXISTS "Users can update their own currencies" ON public.currencies;
DROP POLICY IF EXISTS "Users can delete their own currencies" ON public.currencies;

-- Create simple policies for currencies
CREATE POLICY "Enable read access for all currencies" ON public.currencies
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.currencies
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.currencies
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON public.currencies
  FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Ensure all foreign key relationships exist (only if tables exist)
DO $$
BEGIN
    -- Fix quotes table to have user_id if missing
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quotes' AND table_schema = 'public') THEN
        ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON public.quotes(user_id);
        
        -- Update quotes RLS policies
        DROP POLICY IF EXISTS "Users can view their own quotes" ON public.quotes;
        DROP POLICY IF EXISTS "Users can insert their own quotes" ON public.quotes;
        DROP POLICY IF EXISTS "Users can update their own quotes" ON public.quotes;
        DROP POLICY IF EXISTS "Users can delete their own quotes" ON public.quotes;
        
        CREATE POLICY "Users can view their own quotes" ON public.quotes
          FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
        
        CREATE POLICY "Users can insert their own quotes" ON public.quotes
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update their own quotes" ON public.quotes
          FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);
        
        CREATE POLICY "Users can delete their own quotes" ON public.quotes
          FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);
    END IF;
END $$;

-- 5. Update recurring_invoices RLS policies
DROP POLICY IF EXISTS "Users can view their own recurring invoices" ON public.recurring_invoices;
DROP POLICY IF EXISTS "Users can insert their own recurring invoices" ON public.recurring_invoices;
DROP POLICY IF EXISTS "Users can update their own recurring invoices" ON public.recurring_invoices;
DROP POLICY IF EXISTS "Users can delete their own recurring invoices" ON public.recurring_invoices;

CREATE POLICY "Users can view their own recurring invoices" ON public.recurring_invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recurring invoices" ON public.recurring_invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring invoices" ON public.recurring_invoices
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring invoices" ON public.recurring_invoices
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Grant necessary permissions (only if tables exist)
DO $$
BEGIN
    -- Grant permissions on tables that exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'recurring_invoices' AND table_schema = 'public') THEN
        GRANT ALL PRIVILEGES ON public.recurring_invoices TO authenticated;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices' AND table_schema = 'public') THEN
        GRANT ALL PRIVILEGES ON public.invoices TO authenticated;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quotes' AND table_schema = 'public') THEN
        GRANT ALL PRIVILEGES ON public.quotes TO authenticated;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'currencies' AND table_schema = 'public') THEN
        GRANT ALL PRIVILEGES ON public.currencies TO authenticated;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles' AND table_schema = 'public') THEN
        GRANT ALL PRIVILEGES ON public.user_roles TO authenticated;
    END IF;
END $$;

-- 7. Create missing sequences permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;