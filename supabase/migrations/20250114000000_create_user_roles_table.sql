-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles
CREATE POLICY "Allow read access to user_roles" ON public.user_roles
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage user_roles" ON public.user_roles
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert default roles
INSERT INTO public.user_roles (role) VALUES 
    ('admin'),
    ('user'),
    ('viewer')
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT ALL ON public.user_roles TO authenticated;
GRANT SELECT ON public.user_roles TO anon;