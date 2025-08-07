-- Migration: Add profession support to the database
-- This migration creates the foundation for profession-specific functionality

-- Create profession_type ENUM
DO $$ BEGIN
    CREATE TYPE profession_type AS ENUM (
      'General',
      'Medical', 
      'Legal',
      'Accounting',
      'Engineering'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add profession column to app_settings table
ALTER TABLE app_settings 
ADD COLUMN IF NOT EXISTS profession profession_type DEFAULT 'General';

-- Add profession column to quotes table
ALTER TABLE quotes 
ADD COLUMN IF NOT EXISTS profession profession_type DEFAULT 'General';

-- Create index on quotes.profession for better query performance
CREATE INDEX IF NOT EXISTS idx_quotes_profession ON quotes(profession);

-- Update existing quotes to have 'General' profession if null
UPDATE quotes SET profession = 'General' WHERE profession IS NULL;

-- Update existing app_settings to have 'General' profession if null
UPDATE app_settings SET profession = 'General' WHERE profession IS NULL;

-- Add comments for documentation
COMMENT ON TYPE profession_type IS 'Enumeration of supported profession types for the application';
COMMENT ON COLUMN app_settings.profession IS 'Default profession type for the user/organization';
COMMENT ON COLUMN quotes.profession IS 'Profession type that determines the quote layout and fields';