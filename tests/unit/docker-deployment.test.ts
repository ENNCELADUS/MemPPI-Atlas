import fs from "fs";
import path from "path";

const repoRoot = path.resolve(__dirname, "../..");

const read = (relativePath: string) =>
  fs.readFileSync(path.join(repoRoot, relativePath), "utf8");

describe("Docker VM file-mode deployment", () => {
  it("packages file-mode data and structure assets in the app image", () => {
    const dockerfile = read("Dockerfile");
    const dockerignore = read(".dockerignore");

    expect(dockerfile).toContain("ENV MEMPPI_DATA_MODE=file");
    expect(dockerfile).toContain(
      "COPY --from=builder --chown=nextjs:nodejs /app/data/supabase-import/20260627_web_data ./data/supabase-import/20260627_web_data"
    );
    expect(dockerfile).toContain(
      "COPY --from=builder --chown=nextjs:nodejs /app/data/raw/20260627_web_data/best_structure ./data/raw/20260627_web_data/best_structure"
    );
    expect(dockerignore).toContain(
      "!data/supabase-import/20260627_web_data/**"
    );
    expect(dockerignore).toContain(
      "!data/raw/20260627_web_data/best_structure/**"
    );
  });

  it("runs only the app container in Compose", () => {
    const compose = read("docker-compose.yml");
    const envExample = read(".env.vm.example");

    expect(compose).toContain("memppi-atlas:file-data");
    expect(compose).toContain("MEMPPI_DATA_MODE: file");
    expect(compose).toContain(
      "MEMPPI_DATA_ROOT: /app/data/supabase-import/20260627_web_data"
    );
    expect(compose).toContain(
      "STRUCTURE_ASSET_ROOT: /app/data/raw/20260627_web_data/best_structure"
    );
    expect(compose).not.toContain("build:");
    expect(compose).not.toContain("SUPABASE_URL");
    expect(envExample).toContain("MEMPPI_DATA_MODE=file");
    expect(envExample).toContain(
      "MEMPPI_DATA_ROOT=/app/data/supabase-import/20260627_web_data"
    );
  });

  it("exposes the Compose file and VM bundle through npm scripts", () => {
    const packageJson = JSON.parse(read("package.json"));

    expect(packageJson.scripts["docker:vm:bundle"]).toContain(
      "scripts/build-vm-docker-bundle.sh"
    );
    expect(packageJson.scripts["docker:file-mode"]).toContain(
      "docker-compose.yml"
    );
    expect(packageJson.scripts["docker:file-mode"]).not.toContain("--build");
  });

  it("builds a VM bundle that runs without npm on the VM", () => {
    const script = read("scripts/build-vm-docker-bundle.sh");

    expect(script).toContain("docker save");
    expect(script).toContain("memppi-atlas:file-data");
    expect(script).toContain("--provenance=false");
    expect(script).toContain("--sbom=false");
    expect(script).toContain("cp docker-compose.yml");
    expect(script).toContain("docker load -i memppi-atlas-vm-images.tar");
    expect(script).toContain("load-and-run.sh");
  });
});
