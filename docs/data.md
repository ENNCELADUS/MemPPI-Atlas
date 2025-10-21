# Data

## Source Files
- `data/edge_info_with_exp.csv`
- `data/node_info_with_exp.csv`

## Schemas

### edge_info_with_exp.csv
- `Edge`: Concatenation of interacting protein accessions (`Protein1`_`Protein2`).
- `Protein1`, `Protein2`: UniProt accessions for the interacting proteins.
- `Fusion_Pred_Prob`: Probability score for predicted interaction.
- `Enriched_tissue`: Tissue where interaction is enriched; `NA` if not available.
- `Tissue_enriched_confidence`: Confidence score for tissue enrichment; `NA` if not available.
- `Positive_type`: Source label for the interaction (e.g., `prediction`).

### node_info_with_exp.csv
- `protein`: UniProt accession of the protein node.
- `Entry.Name`: UniProt entry name.
- `Description`: Short functional description.
- `Gene.Names`: Associated gene symbols or aliases.
- `Family`: Protein family annotation (e.g., `TM`).
- `Expression.tissue`: Backslash-delimited list of tissues (e.g., `Brain\Kidney\Liver`).

## Relationships
- Each edge connects two proteins found in `node_info_with_exp.csv` by accession (`protein`).
- `Edge` id uses `Protein1_Protein2` for stable linking.

## Website Usage
- Protein search by accession, gene name, or entry name.
- Protein detail page: show `Description`, `Family`, and tissues from `Expression.tissue`.
- Interaction list/table: columns include `Protein1`, `Protein2`, `Fusion_Pred_Prob`, `Enriched_tissue`, `Positive_type`.
- Filters: by tissue (parsed from `Expression.tissue`) and by minimum `Fusion_Pred_Prob`.
- Downloads: CSV export of current table filters (server-side if large).

## Conventions
- CSV headers are quoted; missing values are `NA`.
- Tissue list delimiter: backslash (`\`).
- Identifiers: UniProt accession is the canonical key.

## Open Questions (placeholders)
- Final list of searchable fields (subset vs full-text on description).
- Maximum page size and server-side pagination strategy.
- Sort keys (probability desc, tissue, accession).
