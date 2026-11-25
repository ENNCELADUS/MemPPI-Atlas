import fs from "fs";
import path from "path";
import { BASE_PATH, withBasePath } from "@/lib/basePath";

describe("basePath", () => {
  it("matches basePath in next.config.mjs", () => {
    const config = fs.readFileSync(
      path.resolve(__dirname, "../../next.config.mjs"),
      "utf8"
    );
    expect(config).toContain(`basePath: "${BASE_PATH}"`);
  });

  it("prefixes absolute app paths", () => {
    expect(withBasePath("/api/network/stats")).toBe(
      "/TMPNet/api/network/stats"
    );
  });
});
