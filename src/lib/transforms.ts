// Data transformation utilities for converting database records to API response format

import { Node, Edge, NodeResponse, EdgeResponse } from "./types";

/**
 * Transform a database node record to API response format
 * Converts snake_case to camelCase and parses tissue arrays
 */
export function transformNodeToResponse(dbNode: Node): NodeResponse {
  // Parse expression_tissue from backslash-delimited string to array
  let expressionTissue: string[] = [];
  if (dbNode.expression_tissue && dbNode.expression_tissue !== "NA") {
    expressionTissue = dbNode.expression_tissue
      .split("\\")
      .filter((t) => t.trim());
  }

  return {
    id: dbNode.protein,
    label: dbNode.entry_name || dbNode.protein,
    description: dbNode.description || "",
    geneNames: dbNode.gene_names || "",
    family: dbNode.family || "",
    expressionTissue,
  };
}

/**
 * Transform a database edge record to API response format
 * Converts snake_case to camelCase and handles null values
 */
export function transformEdgeToResponse(dbEdge: Edge): EdgeResponse {
  return {
    id: dbEdge.edge,
    source: dbEdge.protein1,
    target: dbEdge.protein2,
    fusionPredProb: dbEdge.fusion_pred_prob ?? 0,
    enrichedTissue:
      dbEdge.enriched_tissue === "NA" ? null : dbEdge.enriched_tissue,
    tissueEnrichedConfidence:
      dbEdge.tissue_enriched_confidence === "NA"
        ? null
        : dbEdge.tissue_enriched_confidence,
    positiveType: dbEdge.positive_type || "",
  };
}
