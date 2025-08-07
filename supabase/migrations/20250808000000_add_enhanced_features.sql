-- Enhanced Proforma Invoice System Migration
-- Adds support for recurring invoices, payments, currencies, user roles, and company settings

-- Create currencies table
CREATE TABLE IF NOT EXISTS currencies (
    code VARCHAR(3) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    exchange_rate DECIMAL(10,6) NOT NULL DEFAULT 1.0,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial currency data
INSERT INTO currencies (code, name, symbol, exchange_rate, is_active) VALUES
('ZAR', 'South African Rand', 'R', 1.0, true),
('USD', 'US Dollar', '$', 0.055, true),
('EUR', 'Euro', '€', 0.051, true),
('GBP', 'British Pound', '£', 0.044, true)
ON CONFLICT (code) DO NOTHING;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'sales', 'viewer')),
    permissions JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create indexes for user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Create recurring_invoices table
CREATE TABLE IF NOT EXISTS recurring_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    template_data JSONB NOT NULL,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
    start_date DATE NOT NULL,
    end_date DATE,
    next_invoice_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for recurring_invoices
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_customer_id ON recurring_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_user_id ON recurring_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_next_date ON recurring_invoices(next_invoice_date);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_active ON recurring_invoices(is_active);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    payment_reference VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'ZAR' REFERENCES currencies(code),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'successful', 'failed', 'cancelled')),
    gateway VARCHAR(50) NOT NULL DEFAULT 'paystack',
    gateway_response JSONB,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for payments
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(payment_reference);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- Create company_settings table
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    primary_currency VARCHAR(3) NOT NULL DEFAULT 'ZAR' REFERENCES currencies(code),
    payment_gateway_config JSONB DEFAULT '{}',
    email_templates JSONB DEFAULT '{}',
    pdf_templates JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create index for company_settings
CREATE INDEX IF NOT EXISTS idx_company_settings_user_id ON company_settings(user_id);

-- Add currency support to existing customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'ZAR' REFERENCES currencies(code);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS payment_terms INTEGER DEFAULT 30;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(10,2);

-- Create index for customers currency
CREATE INDEX IF NOT EXISTS idx_customers_currency ON customers(currency);

-- Add currency and recurring invoice support to existing invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'ZAR' REFERENCES currencies(code);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS recurring_invoice_id UUID REFERENCES recurring_invoices(id);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10,6) DEFAULT 1.0;

-- Create indexes for invoices
CREATE INDEX IF NOT EXISTS idx_invoices_currency ON invoices(currency);
CREATE INDEX IF NOT EXISTS idx_invoices_recurring_id ON invoices(recurring_invoice_id);

-- Add currency support to existing quotes table
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'ZAR' REFERENCES currencies(code);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10,6) DEFAULT 1.0;

-- Create index for quotes currency
CREATE INDEX IF NOT EXISTS idx_quotes_currency ON quotes(currency);

-- Enable Row Level Security (RLS) on new tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_roles
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
CREATE POLICY "Users can view their own role" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;
CREATE POLICY "Admins can manage all roles" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    );

-- Create RLS policies for recurring_invoices
DROP POLICY IF EXISTS "Users can manage their own recurring invoices" ON recurring_invoices;
CREATE POLICY "Users can manage their own recurring invoices" ON recurring_invoices
    FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for payments
DROP POLICY IF EXISTS "Users can view payments for their invoices" ON payments;
CREATE POLICY "Users can view payments for their invoices" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM invoices i 
            WHERE i.id = payments.invoice_id 
            AND (i.client_details ->> 'user_id')::text = (auth.uid())::text
        )
    );

-- Create RLS policies for currencies
DROP POLICY IF EXISTS "Anyone can view active currencies" ON currencies;
CREATE POLICY "Anyone can view active currencies" ON currencies
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage currencies" ON currencies;
CREATE POLICY "Admins can manage currencies" ON currencies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = 'admin'
        )
    );

-- Create RLS policies for company_settings
DROP POLICY IF EXISTS "Users can manage their own company settings" ON company_settings;
CREATE POLICY "Users can manage their own company settings" ON company_settings
    FOR ALL USING (auth.uid() = user_id);

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON currencies TO anon, authenticated;
GRANT ALL PRIVILEGES ON user_roles TO authenticated;
GRANT ALL PRIVILEGES ON recurring_invoices TO authenticated;
GRANT ALL PRIVILEGES ON payments TO authenticated;
GRANT ALL PRIVILEGES ON company_settings TO authenticated;
GRANT ALL PRIVILEGES ON currencies TO authenticated;

-- Create function to automatically assign admin role to first user
CREATE OR REPLACE FUNCTION assign_first_user_admin()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if this is the first user
    IF NOT EXISTS (SELECT 1 FROM user_roles) THEN
        INSERT INTO user_roles (user_id, role, created_by)
        VALUES (NEW.id, 'admin', NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to assign admin role to first user
DROP TRIGGER IF EXISTS assign_first_user_admin_trigger ON auth.users;
CREATE TRIGGER assign_first_user_admin_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION assign_first_user_admin();

-- Create function to update exchange rates
CREATE OR REPLACE FUNCTION update_exchange_rates(rates JSONB)
RETURNS VOID AS $$
DECLARE
    currency_code TEXT;
    rate DECIMAL(10,6);
BEGIN
    FOR currency_code, rate IN SELECT * FROM jsonb_each_text(rates)
    LOOP
        UPDATE currencies 
        SET exchange_rate = rate::DECIMAL(10,6), updated_at = NOW()
        WHERE code = currency_code;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to generate next invoice from recurring template
CREATE OR REPLACE FUNCTION generate_recurring_invoice(recurring_id UUID)
RETURNS UUID AS $$
DECLARE
    recurring_record recurring_invoices%ROWTYPE;
    new_invoice_id UUID;
    next_date DATE;
BEGIN
    -- Get recurring invoice details
    SELECT * INTO recurring_record FROM recurring_invoices WHERE id = recurring_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Recurring invoice not found';
    END IF;
    
    -- Generate new invoice
    INSERT INTO invoices (
        customer_id, 
        recurring_invoice_id,
        items, 
        subtotal, 
        tax_amount, 
        total, 
        currency,
        status,
        due_date,
        user_id
    )
    SELECT 
        recurring_record.customer_id,
        recurring_record.id,
        recurring_record.template_data->'items',
        (recurring_record.template_data->>'subtotal')::DECIMAL,
        (recurring_record.template_data->>'tax_amount')::DECIMAL,
        (recurring_record.template_data->>'total')::DECIMAL,
        COALESCE(recurring_record.template_data->>'currency', 'ZAR'),
        'pending',
        CURRENT_DATE + INTERVAL '30 days',
        recurring_record.user_id
    RETURNING id INTO new_invoice_id;
    
    -- Calculate next invoice date
    CASE recurring_record.frequency
        WHEN 'weekly' THEN next_date := recurring_record.next_invoice_date + INTERVAL '7 days';
        WHEN 'monthly' THEN next_date := recurring_record.next_invoice_date + INTERVAL '1 month';
        WHEN 'quarterly' THEN next_date := recurring_record.next_invoice_date + INTERVAL '3 months';
        WHEN 'yearly' THEN next_date := recurring_record.next_invoice_date + INTERVAL '1 year';
    END CASE;
    
    -- Update next invoice date
    UPDATE recurring_invoices 
    SET next_invoice_date = next_date, updated_at = NOW()
    WHERE id = recurring_id;
    
    RETURN new_invoice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;