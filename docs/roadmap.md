# Roadmap (Website)

## MVP Milestones
- CSV-backed API for search, proteins, interactions, download
- Frontend pages: Home, Search, Protein Detail
- Pagination and filtering (tissue, min probability)
- Basic error handling and loading states

## v1 Features
- URL-based deep linking for filters and sort
- Additional filters (family, positive type)
- Server-side caching for hot queries

## Future Enhancements
- Interaction detail and network visualization
- Authentication for admin-only actions (if needed)
- Pre-indexed DB for performance (optional migration)

## Known Constraints
- Large edge CSV (1M+ rows) affects latency; prefer streaming and server-side pagination
