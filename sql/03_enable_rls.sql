-- MemPPI-Atlas Row Level Security (RLS) Configuration
-- Enables public read access to nodes and edges tables

-- =============================================================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE edges ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- CREATE PUBLIC READ POLICIES
-- =============================================================================
-- Allow anyone to read node data
CREATE POLICY "Public read access for nodes"
  ON nodes
  FOR SELECT
  USING (true);

-- Allow anyone to read edge data
CREATE POLICY "Public read access for edges"
  ON edges
  FOR SELECT
  USING (true);

-- =============================================================================
-- RESTRICT WRITE ACCESS (Optional: For future admin features)
-- =============================================================================
-- By default, RLS denies all write operations unless explicitly allowed
-- No write policies = no public writes (good for read-only public dataset)

-- Future: Add admin-only write policies if needed
-- CREATE POLICY "Admin write access for nodes"
--   ON nodes
--   FOR ALL
--   USING (auth.uid() IN (SELECT id FROM admin_users));

-- =============================================================================
-- VERIFY RLS CONFIGURATION
-- =============================================================================
-- Check that RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity 
FROM pg_tables 
WHERE tablename IN ('nodes', 'edges');

-- List all policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('nodes', 'edges');

