# ComboQR

Web para crear **combos** de elementos y distribuirlos mediante **QRs con saldo**. Pensada para usarse desde el celular.

## Qué hace

- **Instituciones y usuarios** con tres roles:
  - `SUPERADMIN`: dueño de la plataforma — crea instituciones y sus primeros admins.
  - `ADMIN`: crea combos, genera QRs, crea usuarios de su institución y también puede escanear.
  - `SCANNER`: solo escanea y entrega.
- **Combos**: título, elementos incluidos, valor y stock total.
- **QRs (vouchers)**: se generan descontando del stock del combo. Cada QR tiene un saldo (ej: 50 combos) y un link único.
- **Escaneo**: el QR abre `/scan/<token>` (solo usuarios logueados). Muestra el combo y el saldo; el escáner elige cuántas unidades entregar (por defecto todas) y confirma con **Entregar** o **Cancelar**. La entrega es atómica: un doble escaneo o carrera simultánea no puede entregar de más.
- **Métricas**: total creado, en circulación (saldo vivo en QRs), entregados y sin asignar.

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind · PostgreSQL + Prisma · Auth propia con JWT en cookie httpOnly · Docker Compose.

## Desarrollo

```bash
docker compose up -d db          # Postgres local
cp .env.example .env             # completar SESSION_SECRET (openssl rand -base64 32)
npm install
npm run db:migrate               # crea las tablas
npm run db:seed                  # usuarios de prueba
npm run dev                      # http://localhost:3000
```

Usuarios del seed:

| Email | Password | Rol |
|---|---|---|
| `super@comboqr.com` | `super123` | SUPERADMIN |
| `admin@demo.com` | `admin123` | ADMIN |
| `scanner@demo.com` | `scanner123` | SCANNER |

## Flujo típico

0. Super admin → **Instituciones → Nueva institución** (nombre + email/clave del primer admin). Ese admin ya puede entrar y crear sus usuarios.
1. Admin → **Combos → Nuevo combo** (título, elementos, valor, cantidad total, ej: 2000).
2. En el detalle del combo → **Generar QRs**: cuántos QR y cuántas unidades por QR (ej: 10 × 50). Descuenta del stock; lo que sobre queda disponible para más QRs después.
3. Repartir: **copiar link**, **descargar QR** (PNG) o **vista de impresión** (grilla para imprimir).
4. El escáner logueado abre el link del QR (o lo escanea con la cámara en **Escanear**) → ve el saldo → **Entregar** (por defecto el total, editable para retiros parciales).
5. El QR queda `EXHAUSTED` cuando se agota. Si se **anula**, el saldo restante vuelve al stock del combo.

## Producción

### Opción A — VPS con Docker (recomendada para infra propia)

```bash
cp .env.example .env   # completar SESSION_SECRET, DB_PASSWORD, APP_URL=https://tudominio
docker compose -f docker-compose.prod.yml up -d --build
```

Incluye: app (Next standalone) + Postgres + **backup diario** con `pg_dump` (7 días de retención en el volumen `backups`). Para HTTPS + dominio, poner delante Caddy/Nginx o el proxy que ya tenga el cliente.

### Opción B — Vercel + Neon

1. Crear el proyecto en Vercel apuntando a este repo.
2. Integrar **Neon** desde el Marketplace de Vercel (free tier alcanza para este volumen) — setea `DATABASE_URL` automáticamente.
3. Agregar env vars: `SESSION_SECRET`, `APP_URL`.
4. Correr `npx prisma migrate deploy` contra la DB de Neon una vez (local o CI).

## Variables de entorno

| Var | Descripción |
|---|---|
| `DATABASE_URL` | Conexión Postgres |
| `SESSION_SECRET` | Firma de sesiones — `openssl rand -base64 32` |
| `APP_URL` | URL pública; es lo que va dentro de cada QR (`{APP_URL}/scan/<token>`) |
| `DB_PASSWORD` | Password de Postgres en prod compose |

## Estructura

```
prisma/schema.prisma   # Institution, User, Combo, Voucher, Redemption
src/proxy.ts           # protección de rutas (ex-middleware de Next 16)
src/lib/               # prisma, session (JWT), dal (auth), vouchers
src/app/login/         # login
src/app/(app)/         # rutas autenticadas
  dashboard/           # métricas
  combos/              # lista, nuevo, detalle, impresión de QRs
  instituciones/       # gestión de instituciones (super admin)
  users/               # gestión de usuarios (admin)
  scan/                # escáner + pantalla de entrega /scan/[token]
src/app/qr/[token]/    # PNG del QR (route handler)
```
