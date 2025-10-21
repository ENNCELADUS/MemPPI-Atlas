# Codex Agent Guide

Mirror of key project rules and specs for the Codex agent.

## Key Rules

### Guardrails
- Plan → Confirm → Code cycle
- Only modify files explicitly named; no side effects elsewhere.
- Do the simplest thing that works; justify any new dependency.
- Reuse existing functions; no duplicate code.
- After coding: print a short self-check list of what changed and why.

### Style & Structure
- DRY principle: no duplicate code
- Extend existing files unless new file is necessary
- Justify each dependency
- camelCase for functions/vars, PascalCase for classes/components.

### Frontend
- **Framework**: Next.js and React with SSR.
- **Styling**: Tailwind CSS for all styling.
- **State**: React Hooks for local state.
- **Data Fetching**: Use Next.js data fetching methods.
- **Graph Visualization**: Use Cytoscape.js in a dedicated component.

### Backend
- **API**: Next.js API Routes.
- **Database**: Supabase (PostgreSQL), accessed via client library.
- **Design**: RESTful principles for endpoints.
- **Data**: Server-side filtering and pagination in Supabase queries.

### Tests
- **Frameworks**: Jest and React Testing Library.
- **Structure**: Co-locate tests with source files (e.g., `Component.test.tsx`).
- **Mocking**: Mock API routes; do not test against the live database.

### Git Commits
- **Format**: Conventional Commits (`type(scope): summary`).
- **Guidelines**: Prefer small, focused commits.

## Project Specs (from `docs/`)

- **instructions.md**: Store **signatures** of canonical functions, classes, or patterns.
- **architecture.md**: Module map, data flow, dependencies, decisions
- **api-spec.md**: REST endpoints and request/response shapes (TBD)
- **data.md**: CSV schemas, relationships, conventions, and usage
- **test-plan.md**: Unit, integration, and E2E strategy and tooling
- **roadmap.md**: 
- **ui-spec.md**: Design system, components, and page layouts