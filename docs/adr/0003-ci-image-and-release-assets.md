# ADR 0003: CI-Built Image and Release Assets

## Status

Accepted

## Context

The app image needs about 2.3 GB of structure files, and the model pipeline
has 2.3 GB of weights. Git cannot hold files over 100 MB, and the image was
built by hand on a developer machine, so nothing checked that it built or
started.

## Decision

- Publish large files as GitHub release assets with their own tags:
  `data-20260627` (structure archive) and `models-v1` (model weights), each
  with a SHA-256 checksum file.
- `.github/workflows/ci.yml` builds the app image on every pull request and
  push to `main`, with the LFS runtime CSVs and the `data-20260627` archive,
  and smoke-tests the main endpoints.
- On `main`, CI pushes the image to `ghcr.io/<owner>/memppi-atlas` as
  `latest` and `sha-<commit>`. When `package.json` has a new version, CI also
  pushes `<version>` and creates the `v<version>` tag and release.

## Consequences

- A release is a version bump merged to `main`; there is no manual tagging.
- VMs with registry access pull the image; the offline bundle stays for VMs
  without it.
- Changing the structure files means a new data release tag and an update of
  the tag name in `ci.yml`.

## Update 2026-11-25

The repository became public with a new, single-commit history. The
`models-v1` weights release stays in the private archive repository and is
not public; only `data-20260627` is a public release asset.
