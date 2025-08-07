-- Create recurring_invoices table
CREATE TABLE IF NOT EXISTS public.recurring_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    template_data JSONB NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    start_date DATE NOT NULL,
    end_date DATE,
    next_invoice_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.recurring_invoices ENABLE ROW LEVEL SECURITY;

-- Create policies for recurring_invoices
CREATE POLICY "Users can view their own recurring invoices" ON public.recurring_invoices
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own recurring invoices" ON public.recurring_invoices
    FOR ALL USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_user_id ON public.recurring_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_customer_id ON public.recurring_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_next_date ON public.recurring_invoices(next_invoice_date) WHERE is_active = true;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_recurring_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recurring_invoices_updated_at_trigger
    BEFORE UPDATE ON public.recurring_invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.update_recurring_invoices_updated_at();

-- Grant permissions
GRANT ALL ON public.recurring_invoices TO authenticated;
GRANT SELECT ON public.recurring_invoices TO anon;