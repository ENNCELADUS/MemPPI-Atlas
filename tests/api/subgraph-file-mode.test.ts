import { createMocks } from "node-mocks-http";

describe("file-mode association queries", () => {
  const originalDataMode = process.env.MEMPPI_DATA_MODE;

  beforeAll(() => {
    process.env.MEMPPI_DATA_MODE = "file";
    jest.resetModules();
  });

  afterAll(() => {
    if (typeof originalDataMode === "undefined") {
      delete process.env.MEMPPI_DATA_MODE;
    } else {
      process.env.MEMPPI_DATA_MODE = originalDataMode;
    }
  });

  it("returns an Additional edge between queried proteins", async () => {
    const { default: handler } = await import("@/pages/api/subgraph");
    const { req, res } = createMocks({
      method: "GET",
      query: { proteins: "GIPR,ADCYAP1R1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const payload = JSON.parse(res._getData());
    expect(payload.edges).toEqual([
      expect.objectContaining({
        id: "P48546-P41586",
        positiveType: "Additional",
      }),
    ]);
  });

  it("filters the network by the canonical Additional type", async () => {
    const { default: handler } = await import("@/pages/api/network");
    const { req, res } = createMocks({
      method: "GET",
      query: { positiveType: "additional", maxEdges: "1" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const payload = JSON.parse(res._getData());
    expect(payload.edges).toEqual([
      expect.objectContaining({ positiveType: "Additional" }),
    ]);
  });
});
