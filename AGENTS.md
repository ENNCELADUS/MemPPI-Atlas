# Claude Code Agent Guide

Mirror of key project rules and specs for the Claude Code CLI agent.

## Key Rules (from `.cursor/rules/`)

### Guardrails (00-project-guardrails.mdc)
- Plan → Confirm → Code cycle
- Only modify explicitly named files
- Do the simplest thing; justify dependencies
- Reuse existing functions; no duplication
- Self-check after changes

### Style & Structure (10-style-and-structure.mdc)
- DRY principle: no duplicate code
- Extend existing files unless new file is necessary
- Justify each dependency
- camelCase for functions/vars, PascalCase for classes

## Project Specs (from `docs/`)

- **instructions.md**: Main project specification
- **architecture.md**: Module map, data flow, dependencies
- **api-spec.md**: API endpoints/CLI commands
- **data-and-metrics.md**: ML datasets, metrics, evaluation
- **test-plan.md**: Unit, sanity, integration tests
- **roadmap.md**: MVP, v1, future milestones
- **common-mistakes.md**: Gotchas and debug tips

## Build & Run
See `docs/instructions.md` for setup and smoke-test commands.

## Permissions
- Network: (specify if needed)
- Git Write: (specify if needed)
- All: Use only when necessary
