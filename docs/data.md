# Data

## Source Files

CSV files stored in `/data` directory (used for initial import only):
- `data/edge_info_with_exp.csv`
- `data/node_info_with_exp.csv`

---

## CSV Schemas

### edge_info_with_exp.csv

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `Edge` | String | Concatenation of interacting protein accessions (`Protein1_Protein2`) | `P12345_Q67890` |
| `Protein1` | String | UniProt accession of first protein | `P12345` |
| `Protein2` | String | UniProt accession of second protein | `Q67890` |
| `Fusion_Pred_Prob` | Float | Model probability that the edge reflects a fusion-derived interaction (0-1) | `0.95` |
| `Enriched_tissue` | String | Tissue where interaction is enriched; `NA` if not available | `Brain` or `NA` |
| `Tissue_enriched_confidence` | Float | Confidence score for the tissue enrichment (0-1); `NA` if not available | `0.89` or `NA` |
| `Positive_type` | String | Source label for the interaction | `prediction`, `experimental` |

**Notes:**
- Headers are quoted in CSV
- Missing values are represented as `NA`
- Edge IDs use underscore delimiter: `Protein1_Protein2`

### node_info_with_exp.csv

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `protein` | String | UniProt accession (primary identifier) | `P12345` |
| `Entry.Name` | String | UniProt entry name | `PROT1_HUMAN` |
| `Description` | String | Short functional description | `Transmembrane protein involved in...` |
| `Gene.Names` | String | Associated gene symbols or aliases | `GENE1 ALIAS1 ALIAS2` |
| `Family` | String | Protein family annotation | `TM` (transmembrane), `TF` (transcription factor) |
| `Expression.tissue` | String | Backslash-delimited list of tissues with reported expression | `Brain\Kidney\Liver` |

**Notes:**
- Headers use dot notation (e.g., `Entry.Name`)
- Tissue delimiter: backslash (`\`)
- Missing values are `NA`

---

## Supabase Database Schema

### Table: `nodes`

Imported from `node_info_with_exp.csv`

```sql
CREATE TABLE nodes (
  protein TEXT PRIMARY KEY,                -- UniProt accession
  entry_name TEXT,                         -- Entry.Name from CSV
  description TEXT,                        -- Description
  gene_names TEXT,                         -- Gene.Names (space-delimited)
  family TEXT,                             -- Family annotation
  expression_tissue TEXT                   -- Expression.tissue (backslash-delimited)
);

-- Indexes for performance
CREATE INDEX idx_nodes_family ON nodes(family);
CREATE INDEX idx_nodes_entry_name ON nodes(entry_name);
CREATE INDEX idx_nodes_gene_search ON nodes USING gin(to_tsvector('english', gene_names));
```

**Row Count:** ~1,500-2,000 proteins (actual count depends on dataset)

### Table: `edges`

Imported from `edge_info_with_exp.csv`

```sql
CREATE TABLE edges (
  edge TEXT PRIMARY KEY,                   -- Edge ID (Protein1_Protein2)
  protein1 TEXT NOT NULL,                  -- Source protein
  protein2 TEXT NOT NULL,                  -- Target protein
  fusion_pred_prob REAL,                   -- Fusion_Pred_Prob (0-1)
  enriched_tissue TEXT,                    -- Enriched_tissue or NULL
  tissue_enriched_confidence REAL,         -- Tissue_enriched_confidence or NULL
  positive_type TEXT,                      -- Positive_type
  FOREIGN KEY (protein1) REFERENCES nodes(protein),
  FOREIGN KEY (protein2) REFERENCES nodes(protein)
);

-- Indexes for graph queries
CREATE INDEX idx_edges_protein1 ON edges(protein1);
CREATE INDEX idx_edges_protein2 ON edges(protein2);
CREATE INDEX idx_edges_enriched_tissue ON edges(enriched_tissue) WHERE enriched_tissue IS NOT NULL;
CREATE INDEX idx_edges_positive_type ON edges(positive_type);
CREATE INDEX idx_edges_fusion_prob ON edges(fusion_pred_prob);
```

**Row Count:** ~5,000-10,000 interactions (actual count depends on dataset)

---

## Data Import Process

### One-Time CSV to Supabase Migration

1. **Create Tables:** Run SQL schema creation scripts in Supabase SQL Editor
2. **Import CSVs:**
   - Use Supabase Dashboard → Table Editor → Import CSV, OR
   - Use Supabase CLI: `supabase db push`
3. **Data Transformation:**
   - Convert `NA` strings to SQL `NULL` for numeric fields
   - Keep `NA` as-is for text fields (or convert to `NULL` if preferred)
   - Parse backslash-delimited tissues if needed for filtering (store as-is for now)
4. **Verify Import:**
   - Check row counts match CSV line counts (minus header)
   - Test queries for each index
5. **Enable RLS (Row Level Security):**
   ```sql
   ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
   ALTER TABLE edges ENABLE ROW LEVEL SECURITY;
   
   -- Allow public read access
   CREATE POLICY "Public read access" ON nodes FOR SELECT USING (true);
   CREATE POLICY "Public read access" ON edges FOR SELECT USING (true);
   ```

---

## Data Relationships

### Primary Key Relationships
- `nodes.protein` (PK) ← `edges.protein1` (FK)
- `nodes.protein` (PK) ← `edges.protein2` (FK)

### Graph Structure
- **Undirected Network:** Each edge connects two proteins (order doesn't imply directionality)
- **Neighbor Query:** To find neighbors of protein `P`:
  ```sql
  SELECT * FROM edges 
  WHERE protein1 = 'P' OR protein2 = 'P';
  ```
- **Subgraph Query:** To get all edges among a set of proteins `[P1, P2, ...]`:
  ```sql
  SELECT * FROM edges
  WHERE protein1 IN ('P1', 'P2', ...) 
    AND protein2 IN ('P1', 'P2', ...);
  ```

---

## Query Patterns

### 1. Full Network (Page 1)
```javascript
// Get all nodes
const { data: nodes } = await supabase.from('nodes').select('*');

// Get all edges
const { data: edges } = await supabase.from('edges').select('*');
```

### 2. Network Statistics (Page 1 Sidebar)
```javascript
// Count nodes
const { count: nodeCount } = await supabase
  .from('nodes')
  .select('*', { count: 'exact', head: true });

// Count edges
const { count: edgeCount } = await supabase
  .from('edges')
  .select('*', { count: 'exact', head: true });

// Family distribution
const { data: families } = await supabase
  .from('nodes')
  .select('family')
  .not('family', 'is', null);
// Aggregate in JavaScript or use Supabase RPC function
```

### 3. Subgraph for Query Proteins (Page 2)
```javascript
const queryProteins = ['P12345', 'Q67890'];

// Get edges where ANY queried protein is involved
const { data: edges } = await supabase
  .from('edges')
  .select('*')
  .or(`protein1.in.(${queryProteins.join(',')}),protein2.in.(${queryProteins.join(',')})`);

// Extract unique neighbor proteins
const neighbors = new Set();
edges.forEach(e => {
  neighbors.add(e.protein1);
  neighbors.add(e.protein2);
});

// Get node details for all proteins in subgraph
const { data: nodes } = await supabase
  .from('nodes')
  .select('*')
  .in('protein', Array.from(neighbors));
```

### 4. Search Nodes by Name/Gene
```javascript
const searchTerm = 'BRCA';

const { data } = await supabase
  .from('nodes')
  .select('*')
  .or(`protein.ilike.%${searchTerm}%,entry_name.ilike.%${searchTerm}%,gene_names.ilike.%${searchTerm}%`)
  .limit(10);
```

### 5. Filter Edges by Probability
```javascript
const minProb = 0.8;

const { data } = await supabase
  .from('edges')
  .select('*')
  .gte('fusion_pred_prob', minProb)
  .order('fusion_pred_prob', { ascending: false })
  .limit(100);
```

---

## Data Conventions

### Identifiers
- **Canonical Key:** UniProt accession (`protein` field in nodes table)
- **Edge Naming:** `Protein1_Protein2` where Protein1 < Protein2 lexicographically (enforced during import)

### Missing Values
- **CSV:** `NA` (string literal)
- **Supabase:** `NULL` for numeric fields, `NA` or `NULL` for text (current spec keeps `NA`)

### Delimiters
- **Tissue Lists:** Backslash (`\`) in `expression_tissue` field
  - Example: `Brain\Kidney\Liver`
  - Parse: `expressionTissue.split('\\')`
- **Gene Names:** Space (` `) in `gene_names` field
  - Example: `BRCA1 RNF53 BRCAI`

### Enrichment Status
- **Enriched Edge:** `enriched_tissue IS NOT NULL` and `enriched_tissue != 'NA'`
- **Non-Enriched Edge:** `enriched_tissue IS NULL` or `enriched_tissue = 'NA'`

---

## Website Data Usage

### Page 1: Global Network View
- **Network Plot:**
  - Nodes: All from `nodes` table
  - Edges: All from `edges` table
  - Performance: May need to limit for very large networks (>10K nodes)
- **Sidebar Statistics:**
  - Total nodes count
  - Total edges count
  - Family distribution (group by `family`)
  - Enriched edge count (filter `enriched_tissue IS NOT NULL`)

### Page 2: Subgraph View
- **Visualization:**
  - Queried nodes + 1-hop neighbors
  - Filter edges to only show connections within this subgraph
- **Node Table (Top 10):**
  - Columns: `protein`, `entry_name`, `description`, `gene_names`, `family`, `expression_tissue`
  - Sort: Queried nodes first, then neighbors alphabetically
- **Edge Table (Top 10):**
  - Columns: `edge`, `protein1`, `protein2`, `fusion_pred_prob`, `enriched_tissue`, `positive_type`
  - Sort: By `fusion_pred_prob` descending

### Filtering & Pagination
- **Server-Side:** All filtering happens in Supabase queries (use `.range()` for pagination)
- **Client-Side:** Only for small datasets or UI-level sorting/filtering of already-loaded data

---

## Performance Considerations

### Indexing Strategy
- **Primary Keys:** Automatic B-tree indexes on `protein` and `edge`
- **Foreign Keys:** Indexes on `protein1` and `protein2` for fast neighbor lookups
- **Filter Fields:** Indexes on `family`, `enriched_tissue`, `positive_type` for sidebar stats and filtering

### Caching
- **Static Data:** Full network data rarely changes; cache in-memory or Redis for 1 hour
- **Dynamic Queries:** Subgraph queries are user-specific; no caching needed

### Query Optimization
- Use `select('column1, column2')` instead of `select('*')` when only specific columns are needed
- Use `{ count: 'exact', head: true }` for count-only queries (no data transfer)
- Limit results to reasonable defaults (10-100 rows) with pagination

---

## Open Questions (Resolved for MVP)

- ✅ **Searchable fields:** Search by `protein`, `entry_name`, and `gene_names`
- ✅ **Pagination:** Use Supabase `.range(start, end)` with default limit of 10
- ✅ **Sort keys:** 
  - Nodes: Alphabetical by `protein`
  - Edges: By `fusion_pred_prob` descending
- ✅ **Tissue parsing:** Store as backslash-delimited string; parse client-side when displaying
