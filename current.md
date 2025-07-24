## 📝 Conversation recap — “AnvelopePlus” backend & platform (Dec 2024 → Jul 2025)

### 1. High-level decisions

| Area                | Final choice                                                                                       | Notes                                                        |
| ------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| **Architecture**    | _Micro-monolith_ NestJS + Prisma API, Next.js storefront, Strapi CMS, Meilisearch for UX filtering | Deployed with Docker Compose (dev) / Hetzner + Vercel (prod) |
| **Database**        | PostgreSQL, fully normalized                                                                       | `product`, `product_tyres`, `offer`, `seller`, `order` etc.  |
| **Search**          | Meilisearch (typo-tolerant) fed by SQL flatten job                                                 | Sync runs every 6 h; instant filters on PLP                  |
| **Pricing & stock** | `offer` table (seller/sku) + 10-min stock delta job                                                | Partner-tier prices postponed to post-MVP                    |
| **Importer**        | Streamed JSON → UPSERTs with pg-promise (batch 500)                                                | Handles duplicate SKUs, fractional rims, BigInts             |
| **API style**       | REST w/ Swagger docs (`/api`)                                                                      | BigInt → string interceptor for JSON                         |
| **Modules**         | `catalog` parent with sub-modules `product`, `lookup`; future `offer`, `search`, `order`, `auth`   | Follows Nest best practice                                   |

### 2. Relational schema milestones

✅ 2025-07-10

- Base schema (`product`, `product_tyres`, `dimension`, `brand`, `season`, `offer`, `sales_order` …)
- Composite FK `(seller_id, offer_id)` for order-item integrity
- Settings in `sys_setting` (e.g. SH tread window)

⭕ Next (planned)

- Add EU-label classes, image URL, `is_visible`, tag bridge
- Optional `partner_price` for reseller tiers

### 3. Code infrastructure done

- **Prisma v6** service with graceful shutdown (no `beforeExit` hook)
- **BigInt JSON** interceptor (global)
- Swagger UI + DTO annotations
- Pre-commit: ESLint v9 flat config, Prettier, Husky fixed
- Docker multi-stage Strapi build (arm64)
- Import script (`import-local.ts`) now idempotent

### 4. Two-week MVP delivery plan (re-confirmed)

| Calendar slot               | Focus                                                           | Hrs |
| --------------------------- | --------------------------------------------------------------- | --- |
| **21-25 Jul** evenings      | stock client + scheduler, Swagger polish                        | 10  |
| **26-27 Jul** weekend       | Meili sync + PDP page                                           | 12  |
| **28-31 Jul** PTO full-days | PLP filters, offer API, cart+order flow, checkout cash/transfer | 26  |
| **01 Aug** evening          | Perf/SEO sweep (sitemap, LCP, CLS)                              | 2   |
| **02-03 Aug** weekend       | Docker deploy to Hetzner, smoke tests, hot-fix buffer           | 12  |

**MVP go-live target:** ✨ _Saturday 2 August 2025_ (Sunday reserved for contingencies).

### MVP acceptance

- Home + PLP <= 100 ms search, filters (brand, season, width, price)
- PDP with live stock/price (`/offers/:sku`)
- Cash / bank-transfer checkout writes `sales_order` + decrements stock
- Cron jobs: stock 10 min, import 6 h, Meili 6 h
- Lighthouse ≥ 90 mobile, SEO pass, sitemap.xml

### 5. Post-MVP roadmap

| Phase                             | ETA         | Scope                                           |
| --------------------------------- | ----------- | ----------------------------------------------- |
| **2A** Payments & shipping        | +3 w        | Stripe, Fan Courier label API                   |
| **2B** New ERP feed adapter       | parallel 2A | Swap MP→SAP without ETL change                  |
| **2C** Rim/full-wheel catalogue   | +4 w        | New `product_rims`, `product_fullwheels` tables |
| **3A** B2B portal & tiered prices | Q4 2025     | Partner auth, credit limits, CSV export         |
| **3B** Multilanguage + PWA        | Q1 2026     | `slug_en`, second Meili index, i18n routing     |

### 6. Outstanding work items (carry into new chat)

1. **EU tyre-label fields** → migration + ETL mapping
2. **Tag & related-product tables** for SEO / upsell
3. **Partner price / discount** model (if required before B2B)
4. Swagger auth (`Bearer`) once JWT module lands
5. Front-end: generate TS client from OpenAPI and wire cart/checkout pages
6. Monitoring: Grafana + pg_exporter; Meili metrics

---

That’s the condensed state of play.
Feel free to start a fresh thread and reference this summary as “baseline 2025-07-21”. Good luck pushing the MVP over the line!
