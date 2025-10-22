# MemPPI-Atlas

Interactive web platform for visualizing and exploring protein-protein interaction (PPI) networks. Browse the global network, search for specific proteins, and analyze localized subgraphs with detailed node and edge information.

## Features

- **Global Network View:** Interactive visualization of the entire PPI network with zoom and pan controls
- **Protein Search:** Find proteins by UniProt ID and view their immediate interaction neighborhoods
- **Subgraph Analysis:** Focused visualization of query proteins and 1-hop neighbors
- **Data Tables:** Detailed protein and interaction information with tissue enrichment data
- **Network Statistics:** At-a-glance metrics and family distribution insights

## Tech Stack

- **Framework:** Next.js 14 (Pages Router) with TypeScript
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS
- **Graph Visualization:** Cytoscape.js
- **Hosting:** Vercel

## Quick Start

### Setup
```bash
# Install deps (example if using Node)
# npm install
```

### Run
```bash
# Start dev servers (frontend/api TBD)
# npm run dev
```

### Smoke Test
```bash
# Open site, run a search, open a protein, paginate interactions, download CSV
```

## Documentation

- **[Product Vision](product_vision/Product-Vision.md)** – Goals, features, and tech stack rationale
- **[Architecture](docs/architecture.md)** – System design, modules, and data flow
- **[API Spec](docs/api-spec.md)** – REST endpoints and request/response schemas
- **[Data](docs/data.md)** – CSV schemas, Supabase tables, and query patterns
- **[UI Spec](docs/ui-spec.md)** – Design system, components, and page layouts
- **[Test Plan](docs/test-plan.md)** – Testing strategy and coverage goals
- **[Roadmap](docs/roadmap.md)** – Implementation milestones
- **[Instructions](docs/instructions.md)** – Canonical functions and patterns
