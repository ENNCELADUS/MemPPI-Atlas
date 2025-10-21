# Architecture (Website)

## Module Map
- Frontend (TBD framework): pages (Home, Search, Protein, Interaction)
- API Layer: REST handlers for `/api/proteins`, `/api/interactions`, `/api/search`, `/api/download`
- Data Access: CSV readers/indexers for `node_info_with_exp.csv` and `edge_info_with_exp.csv`

## Data Flow
1. User searches or navigates to a protein.
2. Frontend requests protein and interactions via API with pagination and filters.
3. API queries CSV-backed store; returns JSON results.
4. Frontend renders tables/cards; URL query params reflect state.

## Dependencies
- CSV parsing library (TBD)
- Lightweight HTTP server (TBD)
- Optional caching layer for frequent queries

## Must-Not-Change Decisions
- UniProt accession is the canonical identifier across the site.
- Large edge dataset requires server-side pagination and filtering.
- CSV export must reflect current filters.
