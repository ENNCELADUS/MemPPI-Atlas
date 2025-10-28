# Network Graph Performance Roadmap

Goal: reduce time-to-first visual under 2 s (nodes-only), make edges visible within 3–6 s, and keep pan/zoom smooth.
Do not change the layout of the nodes/edges.

## Phase 0 — Baseline & Guardrails (no new dependencies)
- Instrument timings in `NetworkGraph.tsx` for fetch, transform, add elements, layout, and first render.
- Extend API responses with metadata: `totalNodes`, `totalEdges`, `filteredEdges`, and timings.

## Phase 1 — Server-Side Edge Reduction (simple, high impact)
- Update `/pages/api/network.ts` to accept query params and enforce hard caps:
  - `maxEdges` (absolute cap) and `positiveType` filters.
  - Defaults: `maxEdges=50_000`, `positiveType=['experimental']` (tune after baseline).
- Return Cytoscape-ready elements to eliminate client-side mapping cost.
- Set `Cache-Control` headers on API responses for CDN caching.

## Phase 2 — Nodes-First, Progressive Edges
- Initial render loads nodes only using a cheap layout (`preset` or `concentric`) to paint quickly.
- Stream edges in chunks (5–10k per frame) with `cy.batch` and `requestIdleCallback` / `requestAnimationFrame`.
- Provide a lightweight progress indicator and keep interactions usable while edges load.

## Phase 3 — UX Controls That Bound Cost
- Add inline controls for edge sources (experimental/predicted) and max edge cap; apply without a full reload.
- Provide a toggle for “Only edges among selected/visible nodes” to focus deep-dive views.

## Phase 4 — Caching and Repeat-Load Speed
- Memoize the last dataset by filter key and keep it in memory during navigation.
- Enable HTTP caching for stable filters; consider a daily version tag to bust the cache when data changes.

## Success Criteria and Rollout
- Targets: nodes-first paint under 2 s; 25–50k edges visible under 6 s on a typical desktop; 60 FPS pan/zoom at medium zoom.
- Track timings in the console and a dev overlay for verification.
