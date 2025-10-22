# API Specification

All API routes are implemented as Next.js API Routes under `/pages/api/`. They follow RESTful principles and return JSON responses.

## Base URL
- Development: `http://localhost:3000/api`
- Production: `https://[your-domain]/api`

---

## Endpoints

### 1. GET `/api/network`

**Purpose:** Fetch the complete PPI network data for Page 1 (Global Network View).

**Query Parameters:**
- `limit` (optional, number): Maximum number of nodes to return. Default: all nodes.
- `edgeLimit` (optional, number): Maximum number of edges to return. Default: all edges.

**Response:**
```json
{
  "nodes": [
    {
      "id": "P12345",
      "label": "PROT1_HUMAN",
      "description": "Protein description",
      "geneNames": "GENE1",
      "family": "TM",
      "expressionTissue": ["Brain", "Kidney", "Liver"]
    }
  ],
  "edges": [
    {
      "id": "P12345_Q67890",
      "source": "P12345",
      "target": "Q67890",
      "fusionPredProb": 0.95,
      "enrichedTissue": "Brain",
      "tissueEnrichedConfidence": 0.89,
      "positiveType": "prediction"
    }
  ]
}
```

**Status Codes:**
- `200 OK`: Success
- `500 Internal Server Error`: Database or parsing error

---

### 2. GET `/api/network/stats`

**Purpose:** Fetch aggregate statistics for the sidebar on Page 1.

**Query Parameters:** None

**Response:**
```json
{
  "totalNodes": 1845,
  "totalEdges": 5432,
  "familyCounts": {
    "TM": 845,
    "TF": 320,
    "Other": 680
  },
  "enrichedEdgeCount": 1203,
  "predictedEdgeCount": 4229
}
```

**Status Codes:**
- `200 OK`: Success
- `500 Internal Server Error`: Database error

---

### 3. GET `/api/subgraph`

**Purpose:** Fetch a subgraph containing the queried protein(s) and their immediate neighbors (one-step connections) for Page 2.

**Query Parameters:**
- `proteins` (required, string): Comma-separated list of UniProt accessions (e.g., `P12345` or `P12345,Q67890`)

**Response:**
```json
{
  "query": ["P12345"],
  "nodes": [
    {
      "id": "P12345",
      "label": "PROT1_HUMAN",
      "description": "Protein description",
      "geneNames": "GENE1",
      "family": "TM",
      "expressionTissue": ["Brain", "Kidney"],
      "isQuery": true
    },
    {
      "id": "Q67890",
      "label": "PROT2_HUMAN",
      "description": "Neighbor protein",
      "geneNames": "GENE2",
      "family": "TF",
      "expressionTissue": ["Brain"],
      "isQuery": false
    }
  ],
  "edges": [
    {
      "id": "P12345_Q67890",
      "source": "P12345",
      "target": "Q67890",
      "fusionPredProb": 0.95,
      "enrichedTissue": "Brain",
      "tissueEnrichedConfidence": 0.89,
      "positiveType": "prediction"
    }
  ]
}
```

**Status Codes:**
- `200 OK`: Success
- `400 Bad Request`: Missing or invalid `proteins` parameter
- `404 Not Found`: None of the queried proteins exist in the dataset
- `500 Internal Server Error`: Database error

---

### 4. GET `/api/nodes`

**Purpose:** Query node information with optional filtering and pagination.

**Query Parameters:**
- `search` (optional, string): Search by protein accession, entry name, or gene name
- `family` (optional, string): Filter by protein family (e.g., `TM`, `TF`)
- `tissue` (optional, string): Filter by expression tissue
- `limit` (optional, number): Number of results to return. Default: 10
- `offset` (optional, number): Offset for pagination. Default: 0

**Response:**
```json
{
  "data": [
    {
      "protein": "P12345",
      "entryName": "PROT1_HUMAN",
      "description": "Protein description",
      "geneNames": "GENE1",
      "family": "TM",
      "expressionTissue": "Brain\\Kidney\\Liver"
    }
  ],
  "total": 150,
  "limit": 10,
  "offset": 0
}
```

**Status Codes:**
- `200 OK`: Success
- `500 Internal Server Error`: Database error

---

### 5. GET `/api/edges`

**Purpose:** Query edge information with optional filtering and pagination.

**Query Parameters:**
- `protein` (optional, string): Filter edges connected to a specific protein
- `minProbability` (optional, number): Minimum fusion prediction probability (0-1)
- `tissue` (optional, string): Filter by enriched tissue
- `positiveType` (optional, string): Filter by positive type (e.g., `prediction`, `experimental`)
- `limit` (optional, number): Number of results to return. Default: 10
- `offset` (optional, number): Offset for pagination. Default: 0

**Response:**
```json
{
  "data": [
    {
      "edge": "P12345_Q67890",
      "protein1": "P12345",
      "protein2": "Q67890",
      "fusionPredProb": 0.95,
      "enrichedTissue": "Brain",
      "tissueEnrichedConfidence": 0.89,
      "positiveType": "prediction"
    }
  ],
  "total": 5432,
  "limit": 10,
  "offset": 0
}
```

**Status Codes:**
- `200 OK`: Success
- `500 Internal Server Error`: Database error

---

## Error Response Format

All error responses follow this structure:

```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

---

## Implementation Notes

1. **Data Source:** All endpoints query Supabase PostgreSQL tables populated from CSV files.
2. **Caching:** Consider implementing Redis or in-memory caching for `/api/network` and `/api/network/stats` as they serve static data.
3. **Rate Limiting:** Not required for MVP; add if needed in production.
4. **Authentication:** Not required for MVP (public dataset).
5. **CORS:** Configure for production domain when deploying to Vercel.
6. **Performance:** Use database indexes on `protein`, `family`, and `enrichedTissue` columns for fast filtering.

