# Test Plan (Website)

## Unit Tests
- CSV parsing utilities (tissue splitting, numeric parsing)
- API parameter validation (pagination, minProb bounds)
- Data access layer: lookups by accession

## Integration Tests
- `/api/search` returns results and total with pagination
- `/api/proteins/:accession` returns full protein details
- `/api/interactions` respects filters and sorting
- `/api/download` streams CSV matching filters

## E2E Tests (Cypress/Playwright)
- Search flow → protein detail → interactions paginate
- Filter by tissue and min probability
- Download reflects current filters

## Smoke-Test Steps
- Start dev server(s)
- Open Home → run a search → open a protein → paginate interactions
