-- Create an admin_users table to track who has admin privileges
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to check if the current user is an admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE difficulties ENABLE ROW LEVEL SECURITY;
ALTER TABLE movement_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE muscles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_secondary_muscles ENABLE ROW LEVEL SECURITY;

-- Public READ access
CREATE POLICY "Public read access for categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read access for equipment" ON equipment FOR SELECT USING (true);
CREATE POLICY "Public read access for difficulties" ON difficulties FOR SELECT USING (true);
CREATE POLICY "Public read access for movement_patterns" ON movement_patterns FOR SELECT USING (true);
CREATE POLICY "Public read access for muscles" ON muscles FOR SELECT USING (true);
CREATE POLICY "Public read access for exercises" ON exercises FOR SELECT USING (true);
CREATE POLICY "Public read access for exercise_secondary_muscles" ON exercise_secondary_muscles FOR SELECT USING (true);

-- Admin WRITE access
CREATE POLICY "Admin write access for categories" ON categories USING (is_admin());
CREATE POLICY "Admin write access for equipment" ON equipment USING (is_admin());
CREATE POLICY "Admin write access for difficulties" ON difficulties USING (is_admin());
CREATE POLICY "Admin write access for movement_patterns" ON movement_patterns USING (is_admin());
CREATE POLICY "Admin write access for muscles" ON muscles USING (is_admin());
CREATE POLICY "Admin write access for exercises" ON exercises USING (is_admin());
CREATE POLICY "Admin write access for exercise_secondary_muscles" ON exercise_secondary_muscles USING (is_admin());

-- Storage Policies (assuming a bucket named 'exercises' exists)
-- NOTE: You will need to create a storage bucket named 'exercises' manually in the Supabase Dashboard
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'exercises');
-- CREATE POLICY "Admin Uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'exercises' AND is_admin());
-- CREATE POLICY "Admin Updates" ON storage.objects FOR UPDATE USING (bucket_id = 'exercises' AND is_admin());
-- CREATE POLICY "Admin Deletes" ON storage.objects FOR DELETE USING (bucket_id = 'exercises' AND is_admin());
