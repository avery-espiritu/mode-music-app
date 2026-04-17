# mode-music-app

Final project for EDUC1485 — a [Next.js](https://nextjs.org/) app (App Router) with React 19, TypeScript, and Tailwind CSS v4.

## Prerequisites

- **Node.js** 20.9 or newer (required for Next.js 16)
- **pnpm** — the repo is set up for pnpm via the `packageManager` field in `package.json`

If you do not have pnpm yet, enable Corepack (ships with Node) and use the version pinned in the project:

```bash
corepack enable
corepack prepare pnpm@10.33.0 --activate
```

## Install

From this directory (`mode-music-app`):

```bash
pnpm install
```

This installs everything listed in `package.json` and uses the lockfile (`pnpm-lock.yaml`) for reproducible installs.

### Using npm or yarn instead

You can install with another package manager, but the project is maintained with **pnpm**. If you switch, delete any other lockfile before committing, and follow that tool’s usual install command (for example `npm install`).

## Run locally

**Development** (hot reload, default [http://localhost:3000](http://localhost:3000)):

```bash
pnpm dev
```

**Production build** (compile and type-check):

```bash
pnpm build
```

**Production server** (run after `pnpm build`):

```bash
pnpm start
```

**Lint** (ESLint flat config in `eslint.config.mjs`):

```bash
pnpm lint
```

## Scripts

| Command       | Description              |
| ------------- | ------------------------ |
| `pnpm dev`    | Start dev server         |
| `pnpm build`  | Production build         |
| `pnpm start`  | Run production server    |
| `pnpm lint`   | Run ESLint on the project |

## Project notes

- Styling: Tailwind CSS v4 (`@tailwindcss/postcss`, `tailwindcss`).
- UI: Radix-based components under `components/ui/` (shadcn-style setup).
- No API keys are required for the default app; if you add secrets later, use `.env.local` (see `.gitignore`).
