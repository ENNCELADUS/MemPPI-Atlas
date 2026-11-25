type QueryValue = string | string[] | undefined;

export const parseNumber = (
  value: QueryValue,
  defaultValue: number
): number => {
  if (typeof value === "undefined") return defaultValue;
  const parsed = Number(Array.isArray(value) ? value[0] : value);
  return Number.isFinite(parsed) ? parsed : defaultValue;
};

// A positive integer limit: invalid or non-positive values fall back to the default.
export const parseLimit = (
  value: QueryValue,
  defaultValue: number,
  max = Number.POSITIVE_INFINITY
): number => {
  const parsed = parseNumber(value, defaultValue);
  if (parsed <= 0) return defaultValue;
  return Math.min(Math.floor(parsed), max);
};
