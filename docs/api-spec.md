# API Specification (Website)

## Endpoints

### GET /api/search
- Query proteins by `q` across accession, gene name, entry name.
- Params: `q` (string, required), `limit` (int), `offset` (int)
- Returns: list of matched proteins (subset fields) and total count.

### GET /api/proteins/:accession
- Fetch protein details.
- Returns: `protein`, `Entry.Name`, `Description`, `Gene.Names`, `Family`, `Expression.tissue` (array of tissues parsed).

### GET /api/interactions
- List interactions filtered by `accession` (either partner), `tissue`, and `minProb`.
- Params: `accession` (string), `tissue` (string), `minProb` (float), `limit` (int), `offset` (int), `sort` (e.g., `prob_desc`).
- Returns: paginated edges with `Protein1`, `Protein2`, `Fusion_Pred_Prob`, `Enriched_tissue`, `Positive_type`.

### GET /api/download
- CSV download of current interaction filter.
- Params mirror `/api/interactions`.
## Parameters & Validation
- Pagination: `limit` (1–100), `offset` (>=0)
- `minProb`: 0.0–1.0
- `tissue`: literal match against parsed tissue list
- `accession`: must exist in node table

## Response Shapes
- Standard envelope: `{ data, total, page, pageSize }` for collections
- Errors: `{ error: { code, message } }`

## Examples
```
GET /api/search?q=ESYT2&limit=10
GET /api/proteins/A0FGR8
GET /api/interactions?accession=A0FGR8&minProb=0.95&limit=25&sort=prob_desc
GET /api/download?accession=A0FGR8&tissue=Brain
```