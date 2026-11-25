# ADR 0001: Docker-only VM Data Stack

## Status

Accepted

## Context

The deployment target is a VM where we want the smallest runtime dependency
surface. Previous setup notes mixed local development, manual database import,
and hosted Supabase-style operations.

## Decision

The supported VM deployment path is Docker-only. A local machine with Node.js,
npm, and Docker builds `vm-docker-bundle/`. The VM receives that bundle and
runs:

```bash
docker load -i memppi-atlas-vm-images.tar
docker compose --env-file .env.vm up -d
```

The VM stack contains:

- the Next.js app image
- the 20260627 graph CSVs copied into the app image
- the relocated 0407-derived structure metadata and assets copied into the app
  image
- the local file data adapter selected by `MEMPPI_DATA_MODE=file`

The VM does not need Node.js, npm, npx, psql, a local database service, or the
Supabase CLI. Storage bucket upload flows are not a supported deployment path.

## Consequences

- VM setup and updates are repeatable from the Docker bundle.
- Data and structure assets remain local inputs and ignored by Git.
- Hosted Supabase, local database imports, and manual CLI import instructions are
  not canonical for VM deployment.

## Update 2026-11-25

- The data CSVs are now tracked with Git LFS; the structure files are a
  GitHub release asset (`data-20260627`).
- The legacy Postgres/PostgREST files (`docker/`, `sql/`) were removed.
- CI now builds and publishes the app image; see ADR 0003. The offline bundle
  remains for VMs without registry access.
