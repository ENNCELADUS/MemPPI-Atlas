import type cytoscape from "cytoscape";
import {
  coseLayout,
  fcoseLayout,
  largeGraphThreshold,
  rendererOptions,
} from "@/lib/cytoscape-config";

describe("cytoscape-config", () => {
  it("exposes canvas renderer with bounded pixel ratio", () => {
    expect(rendererOptions?.name).toBe("canvas");
    expect(typeof rendererOptions?.pixelRatio).toBe("number");
    expect((rendererOptions?.pixelRatio ?? 0) > 0).toBe(true);
  });

  it("configures fcose layout for stable proof iterations", () => {
    expect(fcoseLayout.name).toBe("fcose");
    expect(fcoseLayout.quality).toBe("proof");
    expect(fcoseLayout.numIter).toBeGreaterThan(0);
  });

  it("configures cose layout as fallback", () => {
    const cose = coseLayout as cytoscape.CoseLayoutOptions;
    expect(cose.name).toBe("cose");
    expect(cose.animate).toBe(false);
    expect(cose.padding).toBeGreaterThan(0);
  });

  it("defines a large graph threshold for performance tuning", () => {
    expect(largeGraphThreshold).toBeGreaterThan(0);
  });
});
