<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Proyecto: ComboQR

MVP de distribución de combos vía QR con saldo. Next.js 16 + Prisma 6 + Postgres.

- Dev: `docker compose up -d db` + `npm run dev`
- Migraciones: `npm run db:migrate` · Seed: `npm run db:seed` (admin@demo.com/admin123, scanner@demo.com/scanner123)
- Verificación: `npx tsc --noEmit`, `npm run lint`, `npm run build`
- Auth: JWT propio en cookie (`src/lib/session.ts`), protección en `src/proxy.ts` (convención Next 16, ex-middleware)
- La entrega de combos usa UPDATE atómico en `src/app/(app)/scan/actions.ts` — no quitar las condiciones del WHERE
- Prod: `docker-compose.prod.yml` (app + postgres + backups diarios)
