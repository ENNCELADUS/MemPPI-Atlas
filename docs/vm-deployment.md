# Docker-only VM Deployment

The VM runs one container: the Next.js app image `memppi-atlas:file-data`,
which contains the 20260627 graph CSVs and the 0407-derived structure assets.
The VM does not need Node.js, npm, npx, psql, a local database, or the Supabase CLI.

## Data Contract

The image reads data in file mode (`MEMPPI_DATA_MODE=file`):

- `data/supabase-import/20260627_web_data/nodes.csv`
- `data/supabase-import/20260627_web_data/edges.csv`
- `data/supabase-import/20260627_web_data/structure_models.csv`
- `data/raw/20260627_web_data/best_structure/` (`STRUCTURE_ASSET_ROOT`)

The CSV files are tracked with Git LFS. The structure files come from the
`data-20260627` GitHub release.

## Option A: Pull the Image from GitHub Packages

CI publishes the image on every push to `main` (see ADR 0003):

- `ghcr.io/enncelados/memppi-atlas:latest`
- `ghcr.io/enncelados/memppi-atlas:sha-<commit>`
- `ghcr.io/enncelados/memppi-atlas:<version>` for each release

The package is private. Log in with a GitHub token that has `read:packages`:

```bash
echo "$GITHUB_TOKEN" | docker login ghcr.io -u <github-user> --password-stdin
docker pull ghcr.io/enncelados/memppi-atlas:<version>
docker tag ghcr.io/enncelados/memppi-atlas:<version> memppi-atlas:file-data
docker compose --env-file .env.vm up -d
```

Copy `docker-compose.yml` and `.env.vm.example` (as `.env.vm`) from the
repository to the VM first.

## Option B: Offline Bundle

For a VM without registry access, build a bundle on a machine with Docker,
Node.js and the structure files:

```bash
npm run docker:vm:bundle
```

This writes:

```text
vm-docker-bundle/
├── .env.vm
├── README.md
├── docker-compose.yml
├── load-and-run.sh
└── memppi-atlas-vm-images.tar
```

Copy `vm-docker-bundle/` to the VM and run, from inside it:

```bash
./load-and-run.sh
```

This is the same as:

```bash
docker load -i memppi-atlas-vm-images.tar
docker compose --env-file .env.vm up -d
```

## Run and Update

The app listens on `APP_PORT` (default `3000`) under `/TMPNet`, for example
`http://<vm>:3000/TMPNet`.

To update, pull the new image tag (option A) or copy a new bundle (option B),
then run `docker compose --env-file .env.vm up -d` again. Do not run npm, npx,
psql, Supabase CLI commands or database imports on the VM.
