-- Create exercises table for StrengthLog / custom exercises import
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    category TEXT,
    source_url TEXT,
    instructions TEXT[],
    primary_muscles TEXT[],
    secondary_muscles TEXT[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for app users)
CREATE POLICY "Allow public read access on exercises" 
ON public.exercises 
FOR SELECT 
USING (true);

-- Allow service role full access (default in Supabase, but explicit policy if needed)
CREATE POLICY "Allow service role full access on exercises"
ON public.exercises
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
