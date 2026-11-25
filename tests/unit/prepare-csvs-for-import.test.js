const {
  mergeDuplicateEdges,
  parseArgs,
} = require("../../scripts/prepare-csvs-for-import.js");

const edge = (enrichedTissue, positiveType = "prediction") => ({
  edge: "P24310-O14949",
  fusion_pred_prob: "0.96",
  enriched_tissue: enrichedTissue,
  positive_type: positiveType,
});

describe("prepare-csvs-for-import", () => {
  it("includes structure models by default", () => {
    expect(parseArgs([]).includeStructures).toBe(true);
    expect(parseArgs(["--skip-structures"]).includeStructures).toBe(false);
  });

  it("merges rows of the same edge and joins their tissues in order", () => {
    const rows = mergeDuplicateEdges([
      edge("TON"),
      { ...edge("BRN"), edge: "Q1-Q2" },
      edge("HRT"),
    ]);

    expect(rows).toEqual([edge("TON/HRT"), { ...edge("BRN"), edge: "Q1-Q2" }]);
  });

  it("rejects duplicate rows that differ outside enriched_tissue", () => {
    expect(() =>
      mergeDuplicateEdges([edge("TON"), edge("HRT", "Additional")])
    ).toThrow("Duplicate rows for edge P24310-O14949 differ in positive_type");
  });
});
