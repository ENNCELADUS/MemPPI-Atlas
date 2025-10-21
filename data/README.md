# Data Files

## `edge_info_with_exp.csv`
- `Edge`: concatenation of interacting protein accessions (`Protein1`_`Protein2`).
- `Protein1`, `Protein2`: UniProt accessions for the interacting proteins.
- `Fusion_Pred_Prob`: model probability that the edge reflects a fusion-derived interaction.
- `Enriched_tissue`: tissue where interaction is enriched; `NA` if not available.
- `Tissue_enriched_confidence`: confidence score for the tissue enrichment; `NA` if not available.
- `Positive_type`: source label for the interaction (for example `prediction`).

## `node_info_with_exp.csv`
- `protein`: UniProt accession of the protein node.
- `Entry.Name`: UniProt entry name.
- `Description`: short functional description.
- `Gene.Names`: associated gene symbols or aliases.
- `Family`: protein family annotation (`TM` for transmembrane, etc.).
- `Expression.tissue`: tissues with reported expression (backslash-delimited list).

