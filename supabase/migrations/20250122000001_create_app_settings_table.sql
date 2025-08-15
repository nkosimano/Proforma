-- Create app_settings table for application-specific settings
CREATE TABLE IF NOT EXISTS public.app_settings (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quote_prefix VARCHAR(10) DEFAULT 'QU-' NOT NULL,
  next_quote_number INTEGER DEFAULT 1 NOT NULL,
  invoice_prefix VARCHAR(10) DEFAULT 'INV-' NOT NULL,
  next_invoice_number INTEGER DEFAULT 1 NOT NULL,
  terms_and_conditions TEXT DEFAULT '',
  pdf_template VARCHAR(50) DEFAULT 'classic-blue',
  profession VARCHAR(20) DEFAULT 'General',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own app settings" ON public.app_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own app settings" ON public.app_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own app settings" ON public.app_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own app settings" ON public.app_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL PRIVILEGES ON public.app_settings TO authenticated;

-- Grant sequence permissions only if sequence exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'app_settings_id_seq') THEN
        GRANT USAGE, SELECT ON SEQUENCE app_settings_id_seq TO authenticated;
    END IF;
END $$;

-- Create updated_at trigger
DROP TRIGGER IF EXISTS update_app_settings_updated_at ON public.app_settings;
CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_app_settings_user_id ON public.app_settings(user_id);