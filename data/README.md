# Data Files

## Layout

| Path | Content | Storage |
|---|---|---|
| `00.Web_edge_20260627.csv`, `00.Web_node_20260627.csv` | Raw 20260627 exports | Git LFS |
| `0713.Web_edge.csv`, `0713.Web_node.csv` | Raw 2026-07-13 exports; `prepare:data` prefers these | Git LFS |
| `supabase-import/20260627_web_data/nodes.csv` | Runtime nodes | Git LFS |
| `supabase-import/20260627_web_data/edges.csv` | Runtime edges | Git LFS |
| `supabase-import/20260627_web_data/structure_models.csv` | Structure model manifest (144 models) | Git LFS |
| `raw/20260627_web_data/best_structure/` | AlphaFold3 `*.cif`, `summary_confidences.json`, `confidences.json` | Ignored by Git; release `data-20260627` |

Get the structure files:

```bash
gh release download data-20260627 -R ENNCELADUS/MemPPI-Atlas -D /tmp/structures
(cd /tmp/structures && shasum -a 256 -c SHA256SUMS-data.txt)
tar -xzf /tmp/structures/best_structure-20260627.tar.gz -C data/raw/20260627_web_data/
```

## Rebuild the Runtime Files

```bash
npm run prepare:data             # raw exports + structure folders -> supabase-import/
npm run build:network-artifacts  # supabase-import/ -> public/generated/network/
```

`prepare:data` needs the structure folders; use `--skip-structures` only to
rebuild nodes and edges without a manifest. It merges raw rows that repeat an
edge once per tissue into one row, with the tissues joined by `/`.

## Raw Edge Columns (`0713.Web_edge.csv`)

- `Edge`: `<Protein1>-<Protein2>` UniProt accessions.
- `Protein1 UniProt accession`, `Protein2 UniProt accession`,
  `Protein1 symbol`, `Protein2 symbol`: the two proteins.
- `Association_evidence`: `TMPNet predicted` or `Additional`; `Resources`
  names the source database for Additional edges.
- `Probability`: fusion-model probability (`NA` for Additional edges).
- `Enriched_tissues`, `Tissue enrichment confidence`: tissue enrichment.

The node export (`0713.Web_node.csv`) has `Protein`, `Entry.Name`,
`Protein symbol`, `Description`, `TMP_families` and `Tissues of expression`.

`scripts/prepare-csvs-for-import.js` maps these and the older column names to
the runtime columns described in `docs/data-model.md`.
