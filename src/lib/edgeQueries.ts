export type PositiveType = "additional" | "prediction";

// Stored labels are "Additional" and "prediction"; ilike also matches combined labels.
export const applyPositiveTypeFilter = <T>(query: T, type: PositiveType): T => {
  const pattern = type === "additional" ? "%additional%" : "%prediction%";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (query as any).ilike("positive_type", pattern);
};
