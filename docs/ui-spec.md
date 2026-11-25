# UI Specification

## Purpose

This document describes the UI that is implemented now. All routes are served
under the base path `/TMPNet`. There are four pages:

- the cover page at `/`
- the full network at `/network`
- the search result page at `/subgraph`
- the structure detail page at `/structures/[modelId]`

## Visual System

### Typography

- Geist variable fonts, loaded in `src/pages/_app.tsx`.
- Utility-first Tailwind styles.

### Color

Family colors (`familyColorMap` in `src/lib/graphUtils.ts`):

- `GPCR`: `#E8A87C`
- `Ion-channels`: `#8B7BC7`
- `Transporter`: `#4C6FB9`
- `Catalytic receptors`: `#B5D4A3`
- `Other TMPs` / fallback: `#D1D5DB`

Edge colors (`edgeColors`):

- TMPNet (prediction): `#4C6FB9`, dark line
- Additional: `#C9DBF8`, light line

## Pages

### `/`

- Header with links to the cover page, the total network and contact; the
  Download button is disabled.
- Hero background `public/beautified_ppi_network1.svg`.
- Fixed counts: 2,953 TMPs, 137,510 associations, 22 tissues.
- Search box for UniProt IDs and protein symbols.
- Query examples: one protein (`EGFR`) and several proteins
  (`EGFR, INSR, FZD7, FLRT3`).
- Footer with contact e-mail and address.

### `/network`

- `Sidebar`: network summary text, network statistics (TMPNet and Additional
  nodes and edges from `src/lib/networkStatisticsContent.ts`) and the family
  distribution. There are no filter controls.
- `NetworkGraph` with the prebuilt overview, then the full artifact when it
  exists.
- Floating `Legend`.
- Loading and error states for the statistics and the graph.

### `/subgraph`

- Query protein summary.
- Warning that lists identifiers not found in the dataset.
- Warning when node or edge limits truncate the result.
- Graph panel with legend and the hints "Scroll down for detailed network
  information" and "Tap a node for details".
- Node and edge tables with search, column filters, sorting, pagination and
  CSV export. Edge table columns include "Predicted Association Probability",
  "Enriched Tissue", "Association Source" and "Structure" ("View model" link
  when a model exists).
- Tissue abbreviation key above the tables.

### `/structures/[modelId]`

- Metadata strip and protein details.
- NGL viewer with reset and fullscreen controls, colored by pLDDT.
- Downloads for the CIF file and the two JSON files.
- Confidence summary panels and the linked interaction evidence.

## Shared Components

- `Header` (`src/components/Header.tsx`): navigation as described above.
- `SearchBar`: accepts comma-separated identifiers, uppercases them and shows
  inline validation errors.
- `Legend`: family colors and the "Association Source" edge legend (TMPNet,
  Additional).
- `DataTable`: caption, search, column filters, sorting, pagination, CSV
  export.

## Graph Styling

Files: `src/lib/cytoscape-config.ts`, `src/lib/graphUtils.ts`.

- Full-network nodes are mostly unlabeled until selected.
- Subgraph query nodes are red and always labeled.
- Edge width follows `fusionPredProb`; Additional edges are lighter.
- Cached or precomputed positions are locked when present.

## Known UI Gaps

- The header Download button is disabled.
