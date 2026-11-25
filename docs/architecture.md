# Architecture

## Overview

MemPPI-Atlas is a monolithic Next.js 14 Pages Router app served under the base
path `/TMPNet`. It has three runtime concerns:

1. Graph APIs over a data adapter (local CSV files in file mode, or
   Supabase-compatible tables).
2. Client-side Cytoscape rendering of the full network and of focused
   subgraphs.
3. Structure inspection with an NGL viewer, backed by structure files in the
   app image.

## Runtime Flow

### Cover Page

- `src/pages/index.tsx` shows fixed summary counts, the search box and two
  query examples. It does not call an API.
- Search navigates to `/subgraph?proteins=...`.

### Full Network

- `src/pages/network.tsx` requests
  `/api/network?view=overview&format=cyto&detail=slim` and
  `/api/network/stats`.
- `/api/network` returns the prebuilt overview artifact from
  `public/generated/network/overview.cyto.json` when the request uses the
  defaults. The artifact contains precomputed positions.
- When a full artifact exists, the page loads it after the overview.
- `src/components/NetworkGraph.tsx` handles Cytoscape setup, progressive
  rendering and layout persistence.

### Subgraph Search

- `src/pages/subgraph.tsx` reads `proteins` from the router query.
- `/api/subgraph` resolves each term as a UniProt accession or a protein
  (gene) symbol and returns `notFoundIdentifiers` for terms it cannot resolve.
- One protein: the query node and its one-hop neighbors.
- Several proteins: the queried proteins and the edges among them.
- The page renders the graph and sortable, filterable, exportable node and
  edge tables. Edge rows link to a structure model when one exists.

### Structure Detail

- `src/pages/structures/[modelId].tsx` calls `/api/structures/[modelId]`.
- The response contains the `structure_models` record, the edge, both
  proteins, asset links and a confidence summary parsed from
  `confidences.json`.
- `src/components/StructureViewer.tsx` loads NGL 2.3.0 from unpkg with a
  Subresource Integrity hash and colors the model by residue confidence.

## Client URLs

Next.js adds the base path to `<Link>` and router URLs, but not to `fetch()`
or asset URLs. Client code builds those with `withBasePath()` from
`src/lib/basePath.ts`. A unit test checks that `BASE_PATH` matches
`next.config.mjs`.

## Data Pipeline

1. `scripts/prepare-csvs-for-import.js` (`npm run prepare:data`) reads the raw
   exports in `data/` and the structure folders, and writes:
   - `data/supabase-import/20260627_web_data/nodes.csv`
   - `data/supabase-import/20260627_web_data/edges.csv` (raw rows that repeat
     an edge once per tissue are merged; tissues are joined with `/`)
   - `data/supabase-import/20260627_web_data/structure_models.csv`
     (0407-derived models relocated under the 20260627 layout)
2. `scripts/build-network-artifacts.js` (`npm run build:network-artifacts`)
   writes `public/generated/network/overview.cyto.json` and `stats.json`.
3. The structure files live in `data/raw/20260627_web_data/best_structure`
   (from the `data-20260627` release).

### Data Adapter

- `src/lib/supabase.ts` exports one client. With `MEMPPI_DATA_MODE=file` it is
  `createLocalDataSupabaseClient()` from `src/lib/localDataSupabase.ts`, which
  implements the query-builder subset the routes use over the CSV files.
- `src/lib/transforms.ts` converts rows to the response shapes in
  `src/lib/types.ts`.
- `src/lib/edgeQueries.ts` holds the shared edge-type filter
  (`additional` / `prediction`).

## Layout Cache

- Graph keys are sha256 digests from `buildGraphKey` in
  `src/lib/layoutCache.ts`.
- `/api/network` (non-artifact requests) and `/api/subgraph` read cached
  positions. When positions are missing, the response has
  `positionsNeeded: true`; the client computes a layout and posts it to
  `/api/layout-cache`.
- In file mode the cache is in the memory of the app process and keeps at
  most 200,000 rows; the oldest rows are dropped first.
- `CURRENT_LAYOUT_VERSION` invalidates all cached layouts.

## Delivery

- `.github/workflows/ci.yml` runs lint, typecheck, format check, tests and
  `next build` on every pull request and push to `main`.
- The same workflow builds the app image with the runtime CSVs and the
  structure release, smoke-tests it, and on `main` pushes it to
  `ghcr.io/enncelados/memppi-atlas`. A new `package.json` version also
  creates the `v<version>` tag and release. See ADR 0003.

## Environment

File mode (Docker image):

- `MEMPPI_DATA_MODE=file`
- `MEMPPI_DATA_ROOT`
- `STRUCTURE_ASSET_ROOT`

Supabase mode:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Optional `SUPABASE_STRUCTURE_BUCKET`, `NEXT_PUBLIC_SUPABASE_STRUCTURE_BUCKET`
  (default `structure-models`)
