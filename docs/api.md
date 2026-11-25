# API Reference

## Conventions

- All routes are Next.js API routes under `src/pages/api`.
- The app uses the base path `/TMPNet`, so the public URL of `/api/network` is
  `/TMPNet/api/network`.
- Error responses use `{ "error": "..." }`.
- Routes read data through `src/lib/supabase.ts`: local CSV files in file mode
  (`MEMPPI_DATA_MODE=file`), or Supabase-compatible tables otherwise.

## `GET /api/network`

Returns the network or a filtered part of it.

### Query Parameters

- `view`: `full` (default) or `overview`.
- `format`: `json` (default) or `cyto` (Cytoscape elements).
- `detail`: `full` (default) or `slim` (fewer node and edge fields).
- `positiveType`: comma-separated `additional` and/or `prediction`. Default:
  both. `experiment` and `experimental` are accepted as aliases of
  `additional`.
- `preferExperimental`: default `true`. When `false` and no `positiveType` is
  given, all edge types are returned.
- `minProb`: minimum `fusion_pred_prob`, from `0` to `1`. Default `0`.
- `maxEdges`: maximum number of edges. Default: all edges for `view=full`,
  at most 20,000 for `view=overview`.
- `nodes`: comma-separated UniProt accessions that limit nodes and edges.
- `edges`: boolean-like; `false` returns nodes without edges.

### Prebuilt Artifacts

When `format=cyto`, `edges` is true, and `nodes`, `minProb`, `positiveType`
and `maxEdges` keep their defaults, the route returns
`public/generated/network/<view>.cyto.json` with
`Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`. The
artifact layout has `positionsNeeded: false`. For `view=overview`,
`meta.fullArtifactAvailable` tells the client whether a full artifact exists.

### Response Shape

`format=json`

```json
{
  "nodes": [],
  "edges": [],
  "meta": {
    "totalNodes": 0,
    "totalEdges": 0,
    "filteredEdges": 0,
    "timings": {}
  },
  "layout": {
    "graphKey": "<sha256>",
    "layoutVersion": "...",
    "positions": [],
    "positionsNeeded": true
  }
}
```

`format=cyto`: `{ "elements": [], "meta": {}, "layout": {} }`.

Other responses use `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`.

## `GET /api/network/stats`

Returns `totalNodes`, `totalEdges`, `familyCounts`, `enrichedEdgeCount` and
`predictedEdgeCount`. It reads `public/generated/network/stats.json` when the
file exists; otherwise it counts rows, with a batched scan as fallback.

## `GET /api/subgraph`

Returns a focused graph for one or more identifiers.

### Query Parameters

- `proteins` (required): comma-separated UniProt accessions or protein
  (gene) symbols.
- `minProb`: minimum prediction probability. Default `0.8`.
- `preferExperimental`: default `true`; fetch Additional edges first.
- `maxEdges`: default `100000`, hard cap `500000`.
- `maxNodes`: default `10000`, hard cap `50000`.

### Search Modes

- One identifier: the query node and its one-hop neighbors.
- Several identifiers: the queried proteins and the edges among them.

### Response Fields

- `query`: resolved UniProt IDs.
- `searchedIdentifiers`: the submitted terms that resolved.
- `notFoundIdentifiers`: submitted terms that did not resolve. The response
  is `404` only when no term resolves.
- `queryProteins`: metadata for each resolved term.
- `nodes`, `edges`: edges include `structureModelId`, `structureVariant` and
  `hasStructureModel` when a model exists.
- `truncated`: present when `maxNodes` or `maxEdges` is reached.
- `layout`

## `POST /api/layout-cache`

Stores computed Cytoscape positions for a graph.

```json
{
  "graphKey": "<64-character sha256 hex>",
  "layoutVersion": "<CURRENT_LAYOUT_VERSION>",
  "positions": [{ "id": "P12345", "x": 10, "y": 20 }]
}
```

- `graphKey` must be a sha256 hex digest (from `buildGraphKey`).
- `layoutVersion` must equal `CURRENT_LAYOUT_VERSION`.
- `positions` must have 1 to 10,000 items; invalid items are dropped.
- Success: `204 No Content`. Invalid input: `400`.
- In file mode the cache keeps at most 200,000 positions in memory and drops
  the oldest first.

There is no invalidation request. Change `CURRENT_LAYOUT_VERSION` to
invalidate all cached layouts.

## `GET /api/structures/[modelId]`

Returns structure detail for one model:

- `model`: the `structure_models` record.
- `edge`: the associated edge with structure metadata.
- `proteins`: the two proteins in model order.
- `assets`: asset URLs (with the `/TMPNet` base path) for `cif`, `summary`
  and `confidences`.
- `confidenceSummary`: pLDDT aggregates parsed from `confidences.json`.

## `GET /api/structures/[modelId]/asset`

Serves one structure file from `STRUCTURE_ASSET_ROOT`. Without that variable,
it redirects to the public URL in the configured storage bucket.

- `kind`: `cif`, `summary` or `confidences`.
- `download`: `1` returns the file with a download file name.
