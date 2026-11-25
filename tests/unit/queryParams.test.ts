import { parseLimit, parseNumber } from "@/lib/queryParams";

describe("query parameter parsing", () => {
  it("falls back to the default for missing or non-numeric values", () => {
    expect(parseNumber(undefined, 0.8)).toBe(0.8);
    expect(parseNumber("abc", 0.8)).toBe(0.8);
    expect(parseNumber(["0.5", "0.9"], 0.8)).toBe(0.5);
  });

  it("keeps limits positive, whole and under the cap", () => {
    expect(parseLimit("abc", 100)).toBe(100);
    expect(parseLimit("-5", 100)).toBe(100);
    expect(parseLimit("0", 100)).toBe(100);
    expect(parseLimit("12.7", 100)).toBe(12);
    expect(parseLimit("900", 100, 500)).toBe(500);
  });
});
