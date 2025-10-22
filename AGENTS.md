# Codex Agent Guide

Mirror of key project rules and specs for the Codex agent.

## Key Rules

### Guardrails
- First propose a plan; wait for confirmation before coding.
- Only modify files explicitly named; no side effects elsewhere.
- Do the simplest thing that works; justify any new dependency.
- Reuse existing functions; no duplicate code.
- After coding: print a short self-check list of what changed and why.
- Follow the user's requirements exactly; confirm, then write code.
- If uncertain or no correct answer exists, say so—do not guess.
- Anticipate needs and briefly suggest better alternatives when useful.
- Fully implement requests; avoid TODOs/placeholders/missing pieces.
- Be concise—prioritize code and minimal, high-signal prose.

### Style & Structure
- No duplicate code—reuse existing functions.
- Extend existing files unless a new file is necessary.
- Justify each dependency.
- Prefer the smallest working solution, keep every module under 500 lines. If larger than 500 lines, refactor it into smaller components.
- Consistent naming: camelCase for functions/vars, PascalCase for classes/components.
- Prioritize clarity and readability over micro-optimizations.
- Write correct, secure, up-to-date, bug-free code.
- Treat users as experts; keep explanations brief and precise.

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