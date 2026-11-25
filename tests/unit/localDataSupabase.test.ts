import fs from "fs";
import os from "os";
import path from "path";

describe("local file data adapter layout cache", () => {
  const originalRoot = process.env.MEMPPI_DATA_ROOT;
  let dataRoot: string;

  beforeAll(() => {
    dataRoot = fs.mkdtempSync(path.join(os.tmpdir(), "memppi-data-"));
    for (const file of ["nodes.csv", "edges.csv", "structure_models.csv"]) {
      fs.writeFileSync(path.join(dataRoot, file), "id\n");
    }
    process.env.MEMPPI_DATA_ROOT = dataRoot;
    jest.resetModules();
  });

  afterAll(() => {
    fs.rmSync(dataRoot, { recursive: true, force: true });
    if (typeof originalRoot === "undefined") {
      delete process.env.MEMPPI_DATA_ROOT;
    } else {
      process.env.MEMPPI_DATA_ROOT = originalRoot;
    }
  });

  const positions = (graphKey: string, count: number, x = 0) =>
    Array.from({ length: count }, (_, index) => ({
      graph_key: graphKey,
      node_id: `N${index}`,
      x,
      y: 0,
      layout_version: "v",
    }));

  it("updates existing positions and drops the oldest rows past the limit", async () => {
    const { createLocalDataSupabaseClient, MAX_LAYOUT_CACHE_ROWS } =
      await import("@/lib/localDataSupabase");
    const client = createLocalDataSupabaseClient();
    const cache = () => client.from("graph_layout_cache");

    await cache().upsert(positions("old", 10));
    await cache().upsert(positions("old", 10, 5));
    const updated = await cache().select("x").eq("graph_key", "old");
    expect(updated.data).toHaveLength(10);
    expect(updated.data).toEqual(expect.arrayContaining([{ x: 5 }]));

    await cache().upsert(positions("new", MAX_LAYOUT_CACHE_ROWS));

    const all = await cache().select("graph_key", { count: "exact" });
    expect(all.count).toBe(MAX_LAYOUT_CACHE_ROWS);
    const old = await cache().select("node_id").eq("graph_key", "old");
    expect(old.data).toHaveLength(0);
  });
});
