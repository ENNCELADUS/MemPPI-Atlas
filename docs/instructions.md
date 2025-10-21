# Project Spec (Website)

## Goal
Build a TMP/GPCR PPI website to browse, search, and inspect protein nodes and their interactions, sourced from `data/*.csv`. Non-goals: training ML models, advanced analytics.

## Stack & Constraints
- Frontend: (TBD) SPA/SSR web stack
- Backend: (TBD) Simple REST/CSV-backed API or static pre-processing
- Data: CSV inputs (`edge_info_with_exp.csv`, `node_info_with_exp.csv`)
- Constraints: large edge table (1M+ rows) requires pagination, server-side filtering, and streaming downloads

## Features (MVP → v1)
- MVP
  - Global search by protein accession, gene name, entry name
  - Protein detail page with description, family, tissues, and interactions
  - Interaction table with probability, tissue, and source; pagination & sorting
  - Filters: by tissue and minimum probability
  - CSV download of filtered results
- v1
  - Advanced filters (family, positive type)
  - Bookmarkable URLs (query params reflect filters)
  - Basic API rate limiting and caching

## Structure
- Frontend: pages for Home, Search, Protein, Interaction Detail
- Backend/API: endpoints for proteins, interactions, search, and download
- Data layer: CSV loaders or pre-indexed store for fast queries

## Build & Run
- Dev: TBD (e.g., `npm run dev` for frontend, `npm run dev:api` for backend)
- Smoke test: open homepage, perform search, open protein detail, paginate interactions, attempt CSV export

## References
- Data schema: see `docs/data.md`
