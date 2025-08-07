-- Create currencies table
CREATE TABLE IF NOT EXISTS public.currencies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(3) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  exchange_rate DECIMAL(10, 6) DEFAULT 1.0,
  is_base BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access to currencies" ON public.currencies
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage currencies" ON public.currencies
  FOR ALL USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT SELECT ON public.currencies TO anon;
GRANT ALL PRIVILEGES ON public.currencies TO authenticated;

-- Insert default currencies
INSERT INTO public.currencies (code, name, symbol, is_base, exchange_rate) VALUES
  ('USD', 'US Dollar', '$', true, 1.0),
  ('EUR', 'Euro', '€', false, 0.85),
  ('GBP', 'British Pound', '£', false, 0.75),
  ('JPY', 'Japanese Yen', '¥', false, 110.0),
  ('CAD', 'Canadian Dollar', 'C$', false, 1.25),
  ('AUD', 'Australian Dollar', 'A$', false, 1.35),
  ('CHF', 'Swiss Franc', 'CHF', false, 0.92),
  ('CNY', 'Chinese Yuan', '¥', false, 6.45),
  ('SEK', 'Swedish Krona', 'kr', false, 8.5),
  ('NZD', 'New Zealand Dollar', 'NZ$', false, 1.4)
ON CONFLICT (code) DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_currencies_updated_at
  BEFORE UPDATE ON public.currencies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();