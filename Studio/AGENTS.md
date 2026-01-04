# Repository Guidelines

## Project Structure & Module Organization
`src/App.tsx` bootstraps the Vite app and delegates almost every view to root-level `App.tsx`. Visual surfaces (panels, docks, editors) live in `components/`, while Gemini integrations, storage helpers, and strategy objects live in `services/`. Shared interfaces stay inside `types.ts`, and tooling configs (`vite.config.ts`, `tsconfig.json`) sit beside `package.json`. Store reusable media in `public/` so the dev server can serve it directly.

## Build, Test, and Development Commands
- `npm install` – Restores dependencies, including `@google/genai` and `lucide-react`.
- `npm run dev` – Starts the hot-reload server; inspect logs for Gemini errors here.
- `npm run build` – Bundles to `dist/`; run before proposing deploy changes.
- `npm run preview` – Serves the `dist/` output locally to validate the production bundle.

## Coding Style & Naming Conventions
React files use TypeScript, 2-space indentation, and functional components. Name components and hooks with PascalCase filenames (`SmartSequenceDock.tsx`) and keep helpers camelCase. Keep Gemini prompt builders and transport logic inside `services/geminiService.ts` instead of embedding them in JSX. Prefer explicit return types, reuse shapes from `types.ts`, and export a single default behavior per file. Run your formatter (or `npx biome format`) before committing to keep JSX aligned.

## Testing Guidelines
No automated suite is checked in, so manual smoke tests through `npm run dev` are mandatory. When you introduce automated coverage, add Vitest + React Testing Library, place specs under `src/__tests__/ComponentName.behavior.test.tsx`, and mock Gemini calls at the service boundary. Cover node graph mutations, storage serialization, and async workflow orchestration before merging. Once Vitest is configured, document the command (`npx vitest run`) inside your PR description.

## Commit & Pull Request Guidelines
The history shows Conventional Commits (`feat: Setup project...`), so keep that prefixing scheme (`feat:`, `fix:`, `chore:`) in lower case. Commits should be narrowly scoped, referencing an issue or task when applicable, and include accompanying asset changes. Pull requests must describe the user impact, list commands executed, and attach screenshots or recordings for UI updates (anything inside `components/`). Highlight new env vars or Gemini quota implications so reviewers can validate behavior quickly.

## Security & Configuration Tips
Secrets such as `GEMINI_API_KEY` belong in `.env.local`; never commit them. Access environment values via `import.meta.env` and guard every network call with error handling so failures do not wedge the workspace. Sanitize untrusted URLs before sending them to `urlToBase64`, and throttle expensive generation helpers inside `services/videoStrategies.ts` to avoid accidental API spikes.
