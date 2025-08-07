-- Create missing tables: company_profile and app_settings

-- Create company_profile table
CREATE TABLE IF NOT EXISTS company_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  address text NOT NULL,
  email text NOT NULL,
  phone text,
  logo_url text,
  company_registration_number text,
  tax_number text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create app_settings table
CREATE TABLE IF NOT EXISTS app_settings (
  id integer PRIMARY KEY DEFAULT 1,
  quote_prefix text NOT NULL DEFAULT 'QUO',
  next_quote_number integer NOT NULL DEFAULT 1,
  invoice_prefix text NOT NULL DEFAULT 'INV',
  next_invoice_number integer NOT NULL DEFAULT 1,
  terms_and_conditions text DEFAULT '',
  pdf_template text DEFAULT 'standard',
  profession text NOT NULL DEFAULT 'General',
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE company_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for company_profile
CREATE POLICY "Users can manage their own company profile"
  ON company_profile
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for app_settings
CREATE POLICY "Users can manage their own app settings"
  ON app_settings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT ALL PRIVILEGES ON company_profile TO authenticated;
GRANT ALL PRIVILEGES ON app_settings TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS company_profile_user_id_idx ON company_profile(user_id);
CREATE INDEX IF NOT EXISTS app_settings_user_id_idx ON app_settings(user_id);

-- Create trigger function to automatically update updated_at timestamp (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at timestamp
CREATE TRIGGER update_company_profile_updated_at
    BEFORE UPDATE ON company_profile
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at
    BEFORE UPDATE ON app_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();