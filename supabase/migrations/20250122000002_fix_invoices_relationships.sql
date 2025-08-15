-- Add missing user_id column to invoices table (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices' AND table_schema = 'public') THEN
        ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Update existing invoices to have a user_id (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices' AND table_schema = 'public') THEN
        -- Ensure the foreign key relationship between invoices and customers exists
        ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_customer_id_fkey;
        ALTER TABLE public.invoices ADD CONSTRAINT invoices_customer_id_fkey 
          FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;
        
        -- Add indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
        CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON public.invoices(customer_id);
        CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON public.invoices(created_at);
    END IF;
END $$;

-- Update RLS policies for invoices to include user_id filtering (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
        DROP POLICY IF EXISTS "Users can insert their own invoices" ON public.invoices;
        DROP POLICY IF EXISTS "Users can update their own invoices" ON public.invoices;
        DROP POLICY IF EXISTS "Users can delete their own invoices" ON public.invoices;
        
        CREATE POLICY "Users can view their own invoices" ON public.invoices
          FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert their own invoices" ON public.invoices
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update their own invoices" ON public.invoices
          FOR UPDATE USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can delete their own invoices" ON public.invoices
          FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Ensure payments table has proper foreign key to invoices (only if both tables exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments' AND table_schema = 'public') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices' AND table_schema = 'public') THEN
        ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_invoice_id_fkey;
        ALTER TABLE public.payments ADD CONSTRAINT payments_invoice_id_fkey 
          FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;
        
        -- Add indexes for payments
        CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON public.payments(invoice_id);
        CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at);
    END IF;
END $$;