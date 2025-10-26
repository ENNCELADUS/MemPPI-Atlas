-- MemPPI-Atlas Database Schema
-- Creates nodes and edges tables with proper indexes

-- Drop tables if they exist (for clean reinstall)
DROP TABLE IF EXISTS edges CASCADE;
DROP TABLE IF EXISTS nodes CASCADE;

-- =============================================================================
-- NODES TABLE
-- =============================================================================
CREATE TABLE nodes (
  protein TEXT PRIMARY KEY,                -- UniProt accession (e.g., P12345)
  entry_name TEXT,                         -- UniProt entry name (e.g., PROT1_HUMAN)
  description TEXT,                        -- Functional description
  gene_names TEXT,                         -- Space-delimited gene symbols
  family TEXT,                             -- Protein family (TM, TF, etc.)
  expression_tissue TEXT                   -- Backslash-delimited tissue list
);

-- Performance indexes for nodes
CREATE INDEX idx_nodes_family ON nodes(family);
CREATE INDEX idx_nodes_entry_name ON nodes(entry_name);
CREATE INDEX idx_nodes_gene_search ON nodes USING gin(to_tsvector('english', gene_names));

COMMENT ON TABLE nodes IS 'Protein nodes with annotations and expression data';
COMMENT ON COLUMN nodes.protein IS 'Primary key: UniProt accession';
COMMENT ON COLUMN nodes.expression_tissue IS 'Backslash-delimited list of expression tissues';

-- =============================================================================
-- EDGES TABLE
-- =============================================================================
CREATE TABLE edges (
  edge TEXT PRIMARY KEY,                   -- Edge ID (Protein1_Protein2)
  protein1 TEXT NOT NULL,                  -- Source protein (UniProt accession)
  protein2 TEXT NOT NULL,                  -- Target protein (UniProt accession)
  fusion_pred_prob REAL,                   -- Fusion prediction probability (0-1)
  enriched_tissue TEXT,                    -- Tissue where interaction is enriched
  tissue_enriched_confidence TEXT,         -- Confidence level (high confidence, low confidence)
  positive_type TEXT,                      -- Source type (prediction, experimental)
  
  -- Foreign key constraints
  FOREIGN KEY (protein1) REFERENCES nodes(protein) ON DELETE CASCADE,
  FOREIGN KEY (protein2) REFERENCES nodes(protein) ON DELETE CASCADE
);

-- Performance indexes for edges (critical for graph queries)
CREATE INDEX idx_edges_protein1 ON edges(protein1);
CREATE INDEX idx_edges_protein2 ON edges(protein2);
CREATE INDEX idx_edges_enriched_tissue ON edges(enriched_tissue) WHERE enriched_tissue IS NOT NULL;
CREATE INDEX idx_edges_positive_type ON edges(positive_type);
CREATE INDEX idx_edges_fusion_prob ON edges(fusion_pred_prob);

COMMENT ON TABLE edges IS 'Protein-protein interactions with enrichment data';
COMMENT ON COLUMN edges.edge IS 'Primary key: Protein1_Protein2 format';
COMMENT ON COLUMN edges.fusion_pred_prob IS 'Model probability that edge reflects fusion-derived interaction';
COMMENT ON COLUMN edges.enriched_tissue IS 'NULL or tissue name where interaction is enriched';
COMMENT ON COLUMN edges.tissue_enriched_confidence IS 'Confidence level: "high confidence" or "low confidence"';

