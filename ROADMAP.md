Below is a **copy-paste-ready Markdown roadmap** you can drop straight into Jira (or any tracker). *Section 1* is the **10-week MVP** broken into weekly sprints, epics and bite-sized tasks. *Section 2* is a **long-term roadmap** (post-MVP) so everyone sees what comes next and why you’re deferring it.

---

## **1 · MVP Roadmap (10 weeks ≈ 240 h)**

> Goal: Tyres only • < 100 ms search • SEO-clean URLs • Cash / bank-transfer checkout • Vercel + Hetzner stack

### **🗂️ Epics**

| Key           | Epic                    | Done means                                                                     |
| ------------- | ----------------------- | ------------------------------------------------------------------------------ |
| **INFRA**     | Dev & CI/CD foundation  | Docker-compose runs PG, Meili, Strapi locally; GitHub Actions builds & deploys |
| **INGEST**    | Data import & ETL       | Nightly job writes clean rows + slugs; rerunnable without manual fixes         |
| **CATALOGUE** | Normalised DB + API     | `/products/:slug`, `/dimensions`, `/brands` return JSON in < 50 ms             |
| **SEARCH**    | Meilisearch integration | `/search?q=&filters=` responds < 30 ms with facets                             |
| **STORE**     | Next.js PLP/PDP         | Size filter, brand filter, price display, lighthouse ≥ 90                      |
| **AUTH**      | Users & sessions        | Register → email confirm → login cookie                                        |
| **CHECKOUT**  | Order creation          | Cash / bank-transfer order writes rows, decrements stock                       |
| **CMS**       | Strapi marketing blocks | Editors can publish hero banner & promos that render on home page              |
| **SEO-PERF**  | Lighthouse & redirects  | Sitemap, robots.txt, 301 slug-history, CLS < 0.1                               |
| **OBS**       | Monitoring & logs       | Grafana, Loki, Alert if pg CPU > 80 % 10 m                                     |

### **📅 Sprint-by-sprint plan**

| Week   | Focus & Milestones       | Key Tasks (move into Jira)                                                                                                                  |
| ------ | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **1**  | **INFRA MVP**            | `INFRA-1` Init repo, eslint/prettier`INFRA-2` Docker-compose (pg, meili, strapi)`INFRA-3` GitHub Action: test → build                       |
| **2**  | **INGEST stage-1**       | `INGEST-1` Create `product_raw` (jsonb)`INGEST-2` CLI fetch MP API → copy 1 k rows`INGEST-3` Slug generator util + uniqueness test          |
| **3**  | **SCHEMA + ETL**         | `CAT-1` brand/model/dimension tables`CAT-2` FK-filled `product` table`INGEST-4` Upsert ETL (`ON CONFLICT`)                                  |
| **4**  | **SEARCH MVP**           | `SEARCH-1` Sync script → Meili (10 k docs)`SEARCH-2` Index settings (filterable, sortable)`SEARCH-3` `/api/search` Nest route + jest tests  |
| **5**  | **PLP / PDP draft**      | `STORE-1` Next.js project, App Router`STORE-2` `getStaticPaths` with slugs`STORE-3` `TyreCard` component (Image + price)                    |
| **6**  | **AUTH module**          | `AUTH-1` User table + bcrypt hash`AUTH-2` Nest local-strategy (passport.js)`AUTH-3` Login/register pages in Next                            |
| **7**  | **CHECKOUT v0**          | `CHK-1` sales_order & sales_order_item schema`CHK-2` Nest `/checkout` route (cash/transfer)`CHK-3` Stock-decrement trigger                  |
| **8**  | **CMS + Home**           | `CMS-1` Strapi dockerised, “Hero” & “Promo” CT`CMS-2` Next home page fetches blocks (ISR 60 s)`CMS-3` Web-hook cache purge                  |
| **9**  | **SEO & Perf hardening** | `SEO-1` sitemap.xml generator job`SEO-2` slug_history + 301 middleware`SEO-3` Image CDN upload script, LCP < 2.5 s                          |
| **10** | **OBS + Launch**         | `OBS-1` Grafana + pg_exporter dashboard`OBS-2` Meili metrics panel`LAUNCH-1` Red-button import rerun`LAUNCH-2` Go-live checklist & hand-off |

**Buffer**: keep 1–2 tasks free each sprint for fixes.

---

## **2 · Post-MVP Roadmap (Phase 2 & 3)**

| Phase                          | Timeline    | Scope                                                           | Rationale                         |
| ------------------------------ | ----------- | --------------------------------------------------------------- | --------------------------------- |
| **2A – Payments & Shipping**   | +3 weeks    | Stripe card flow, Fan Courier API, price incoterms, invoice PDF | Turns site into revenue generator |
| **2B – New ERP Feed**          | overlaps 2A | Build new `FeedAdapterSAP` (or whatever ERP) & regression tests | Risk isolation; swap when ready   |
| **2C – Rim & Wheel catalogue** | +4 weeks    | Add `product_type = rim`, shared dimensions, tyre-rim bundles   | Upsell & larger AOV               |
| **3A – B2B Portal**            | Q1 2025     | Partner roles, tiered prices, credit limits, order export CSV   | Key stakeholder requirement       |
| **3B – Multilanguage**         | Q1–Q2 2025  | Add `title_en`, `slug_en`, second Meili index, i18n routing     | SEO in wider EU markets           |
| **3C – Mobile PWA**            | after 3B    | Next PWA config, push notifications (back-in-stock)             | 60 % traffic is mobile            |

---

## **🛠️ General Advice Before You Jira-ify**

1. **One JIRA epic ⇢ 5–15 issues** – keep issues ≤ 6 h to fit after-work sessions.
2. **Definition of Ready** column: issue has *description, acceptance test, and local-run notes*.
3. **Use labels** like `backend`, `frontend`, `etl`, `infra` so filters stay sane.
4. **Attach PR template** enforcing “closes JIRA-123”.
5. **Friday night rule:** never start a DB migration after 22:00 💤.

Copy the tables above into `roadmap.md`, then **bulk-import CSV** to Jira if you like, or create epics first and drag these tasks underneath. You’ll hit the 10-week MVP as long as you lock scope and keep weekends sacred for larger items (schema, checkout).

Good luck—ship fast and don’t hesitate to reach out for schema reviews or Meili tuning!
