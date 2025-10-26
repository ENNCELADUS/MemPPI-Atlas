-- MemPPI-Atlas Data Import Script
-- Uses COPY commands for fast bulk import
-- Run this AFTER uploading CSV files to Supabase Storage

-- =============================================================================
-- IMPORT NODES
-- =============================================================================
-- Note: Supabase requires files to be uploaded to storage first
-- We'll use a temporary table to handle NA -> NULL conversion

-- Create temporary table for initial CSV load
CREATE TEMP TABLE nodes_temp (
  protein TEXT,
  entry_name TEXT,
  description TEXT,
  gene_names TEXT,
  family TEXT,
  expression_tissue TEXT
);

-- Import CSV into temp table
-- You'll need to replace '/path/to/node_info_with_exp.csv' with actual path
-- In Supabase SQL Editor, use: SELECT * FROM read_csv_auto('/path/to/file.csv')
-- Or use the dashboard import feature instead

-- For manual import via Supabase dashboard:
-- 1. Go to Table Editor -> nodes table
-- 2. Click "Insert" -> "Import data from CSV"
-- 3. Upload node_info_with_exp.csv
-- 4. Map columns: protein, Entry.Name -> entry_name, etc.
-- 5. Check "Convert NA to NULL"

-- If using Supabase Storage + SQL:
-- COPY nodes_temp FROM '/path/to/node_info_with_exp.csv' WITH (FORMAT CSV, HEADER true);

-- Transform and insert (handles NA -> NULL conversion)
-- INSERT INTO nodes
-- SELECT 
--   protein,
--   NULLIF(entry_name, 'NA') as entry_name,
--   NULLIF(description, 'NA') as description,
--   NULLIF(gene_names, 'NA') as gene_names,
--   NULLIF(family, 'NA') as family,
--   NULLIF(expression_tissue, 'NA') as expression_tissue
-- FROM nodes_temp;

-- DROP TABLE nodes_temp;

-- =============================================================================
-- IMPORT EDGES
-- =============================================================================
-- Create temporary table for edges
CREATE TEMP TABLE edges_temp (
  edge TEXT,
  protein1 TEXT,
  protein2 TEXT,
  fusion_pred_prob TEXT,  -- Import as TEXT to handle NA
  enriched_tissue TEXT,
  tissue_enriched_confidence TEXT,  -- Import as TEXT to handle NA
  positive_type TEXT
);

-- COPY edges_temp FROM '/path/to/edge_info_with_exp.csv' WITH (FORMAT CSV, HEADER true);

-- Transform and insert (convert NA strings to NULL, cast numeric fields)
-- INSERT INTO edges
-- SELECT 
--   edge,
--   protein1,
--   protein2,
--   CASE WHEN fusion_pred_prob = 'NA' THEN NULL ELSE fusion_pred_prob::REAL END as fusion_pred_prob,
--   NULLIF(enriched_tissue, 'NA') as enriched_tissue,
--   CASE WHEN tissue_enriched_confidence = 'NA' THEN NULL ELSE tissue_enriched_confidence::REAL END as tissue_enriched_confidence,
--   positive_type
-- FROM edges_temp;

-- DROP TABLE edges_temp;

-- =============================================================================
-- VERIFY IMPORT
-- =============================================================================
-- Check row counts
SELECT 'nodes' as table_name, COUNT(*) as row_count FROM nodes
UNION ALL
SELECT 'edges' as table_name, COUNT(*) as row_count FROM edges;

-- Expected: 
-- nodes: 4,445 rows
-- edges: 1,085,072 rows

-- Sample queries to verify data quality
SELECT 'Sample nodes' as query;
SELECT * FROM nodes LIMIT 5;

SELECT 'Sample edges' as query;
SELECT * FROM edges LIMIT 5;

-- Check for NULL values in key fields
SELECT 'Nodes with missing protein' as check, COUNT(*) FROM nodes WHERE protein IS NULL;
SELECT 'Edges with missing edge ID' as check, COUNT(*) FROM edges WHERE edge IS NULL;

-- Verify foreign key integrity
SELECT 'Edges with invalid protein1' as check, COUNT(*) 
FROM edges e 
WHERE NOT EXISTS (SELECT 1 FROM nodes n WHERE n.protein = e.protein1);

SELECT 'Edges with invalid protein2' as check, COUNT(*) 
FROM edges e 
WHERE NOT EXISTS (SELECT 1 FROM nodes n WHERE n.protein = e.protein2);

