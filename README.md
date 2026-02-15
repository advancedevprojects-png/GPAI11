# NEXUS STEM AI Visualizer — Monorepo Scaffold (No-Cost Build)

This repository is now aligned to the requested **Section 5 monorepo architecture** and includes a working `apps/web` Next.js scaffold plus no-cost local orchestration stubs.

## What was changed

- Added Turborepo workspace files:
  - `pnpm-workspace.yaml`
  - `turbo.json`
  - `docker-compose.yml`
- Added `apps/web` as a Next.js 15 app scaffold with:
  - `app/` routes and dashboard/workspace pages
  - `app/api/*` route handlers for AI/export/ocr/voice/collaboration stubs
  - `components/` structure (input, visualizer, explanation, learning, etc.)
  - `lib/ai` classifier/orchestrator/prompt files
- Added `apps/mobile`, `packages/*`, and `services/*` directory scaffolds to match the requested repository blueprint.

## Current scope

This commit focuses on architecture alignment and a maintainable baseline, while keeping the implementation no-cost and local-first.

## Run (web app)

```bash
cd apps/web
npm install
npm run dev
```

Then open `http://localhost:3000`.

## No-cost principle

- No paid APIs required.
- Local deterministic classifier/orchestrator stubs included.
- API handlers are placeholders to be implemented with local/free providers first.
