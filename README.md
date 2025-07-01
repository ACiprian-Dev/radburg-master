Below is a **ready-to-paste `README.md`** that documents your current stack,local-dev workflow, and the new lint / format setup. Feel free to tweak titles, badges, or wording.

````markdown
# AnvelopePlus — Tyre & Rim e-commerce platform

> Next.js (frontend) · NestJS (API) · PostgreSQL (DB) · Meilisearch (search)  
> Strapi (CMS) · PNPM (workspaces) · Docker (dev stack)

---

## 📂 Project structure

```txt
.
├─ backend/              NestJS REST + GraphQL API
│  └─ tsconfig.json
├─ frontend/             Next.js 14 App Router storefront
│  └─ tsconfig.json
├─ strapi/               Strapi 5 CMS (marketing blocks, blog)
├─ docker-compose.yml    Local stack (PG, Meili, Strapi, API)
├─ eslint.config.mjs     Flat ESLint 9 config (workspace-wide)
├─ pnpm-workspace.yaml   PNPM monorepo glue
└─ README.md             you’re here
```
````

---

## 🚀 Quick start

```bash
# clone & install
git clone git@github.com:your-org/anvelopeplus.git
cd anvelopeplus
pnpm install              # installs all workspaces

# boot local stack (Postgres, Meilisearch, Strapi CMS)
docker compose up -d

# API – http://localhost:3001
pnpm --filter backend dev

# Frontend – http://localhost:3000
pnpm --filter frontend dev
```

| Service      | URL                           | Default creds       |
| ------------ | ----------------------------- | ------------------- |
| Postgres     | `localhost:5432`              | `tyres / tyres`     |
| Strapi admin | `http://localhost:1337/admin` | create on first run |
| Meilisearch  | `http://localhost:7700`       | `devmasterkey`      |

> **Tip:** environment variables are in `.env.example`.
> Copy to `.env` and tweak as needed.

---

## 🧑‍💻 Daily workflow

| Task                 | Command                                       |
| -------------------- | --------------------------------------------- |
| **Dev API**          | `pnpm --filter backend dev`                   |
| **Dev Frontend**     | `pnpm --filter frontend dev`                  |
| **Dev CMS**          | `docker compose logs -f strapi` (auto-reload) |
| **Import catalogue** | `pnpm --filter backend etl:run`               |
| **Sync to Meili**    | `pnpm --filter backend search:sync`           |
| **Run unit tests**   | `pnpm test`                                   |
| **End-to-end tests** | `pnpm e2e`                                    |
| **Lint**             | `pnpm lint`                                   |
| **Format**           | `pnpm lint:fix`                               |

---

## 🛂 Pre-commit hooks

- **Husky + lint-staged** enforce style _before_ every commit.
- Hooks run:
  1. `eslint --fix` on staged JS/TS/TSX files (excluding `dist/**`, `build/**`, `strapi/**`)
  2. `prettier --write` on staged code / JSON / MD / YAML.

- Skip in a pinch: `git commit --no-verify`.

---

## ⚙️ Lint & format toolchain

| Tool              | Version           | Config                                         |
| ----------------- | ----------------- | ---------------------------------------------- |
| ESLint            | 9.x (flat config) | `eslint.config.mjs`                            |
| Prettier          | 3.x               | `.prettierignore` skips `dist/**`, `strapi/**` |
| TypeScript-ESLint | latest            | project-wide parser (no “project” mode)        |

---

## 🐳 Docker compose (dev only)

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: tyres
      POSTGRES_PASSWORD: tyres
      POSTGRES_DB: tyres
    ports: [5432:5432]

  meili:
    image: getmeili/meilisearch:v1.6
    environment:
      MEILI_MASTER_KEY: devmasterkey
    ports: [7700:7700]

  strapi:
    build:
      context: .
      dockerfile: strapi/Dockerfile # custom multi-arch build
    environment:
      DATABASE_CLIENT: postgres
      DATABASE_HOST: db
      DATABASE_PORT: 5432
      DATABASE_NAME: tyres
      DATABASE_USERNAME: tyres
      DATABASE_PASSWORD: tyres
    ports: [1337:1337]
    depends_on: [db]
```

> **Apple Silicon:** images are multi-arch (`linux/arm64`) out of the box.

---

## 🔄 ETL & search sync

1. **Import feed** → `backend/src/scripts/import-feed.ts`
   _Runs nightly via cron in prod._
2. **Denormalise → Meilisearch** → `backend/src/scripts/sync-meili.ts`

Both scripts are idempotent and safe to re-run.

---

## 🥞 Build & deploy

| Layer           | Prod target                    | Command                                         |
| --------------- | ------------------------------ | ----------------------------------------------- |
| **Backend API** | Docker image → VPS (Hetzner)   | `pnpm --filter backend build:prod`              |
| **Frontend**    | Vercel (ISR, Edge cache)       | `pnpm --filter frontend build && vercel --prod` |
| **CMS**         | Docker image (same VPS as API) | `docker compose up -d strapi`                   |

CI pipeline lives in `.github/workflows/`.

---

## 📜 License

[MIT](LICENSE) – free to use, modify, and distribute.

---

> _Happy shipping!_
> Questions or PRs welcome in the **#anvelopeplus** Slack channel.

````

---

### How to use

1. Save the snippet as `README.md` at repo root.
2. Adjust project name, commands, or port numbers if you’ve diverged.
3. Commit & push:

```bash
git add README.md
git commit -m "docs: initial project README"
git push
````

You now have an at-a-glance guide for new contributors and a checklist for yourself.
