# ContentOps AI

**Raw Video → Published Content in Minutes**

ContentOps AI is a multi-agent SaaS platform that converts raw video assets into platform-ready content. It generates SEO-optimized metadata, automates social publishing across every major channel, and provides AI-driven KPI dashboards — all from a single, intelligent interface.

This repository contains the implementation of the ContentOps AI platform, built with a modern tech stack focused on performance and developer experience.

---

## Features

- AI video processing: upload endpoint stores files, extracts metadata via FFprobe, and generates thumbnails
- SEO metadata generation: AI route + agent for title/description/tag generation from transcript data
- Social publishing workflows: campaign CRUD APIs and publishing UI pages (queue/calendar/logs)
- KPI dashboards/reporting: dashboard + report APIs and app pages
- Auth + roles + org support: credential auth, registration, role-aware permission model
- Alerts/exports/projects modules: implemented app pages + API routes
- API routes: authenticated `/api/v1/*` surface for core operations
- SQLite + Drizzle local-first stack: file-based DB (`data/contentops.db`) with typed schema and queries

### Current Implementation Notes

- `Publishing Queue` page currently uses mock UI data (`src/app/(app)/app/publishing/queue/page.tsx`)
- AI routes require transcript/scenes records to exist before generation calls succeed
- OAuth buttons are present in UI, but credentials auth is the wired flow by default

---

## Feature Walkthrough (Step by Step)

### 1) Auth + Roles + Org Support

1. Start app: `npm run dev`
2. Register: open `/signup` and create an account (calls `POST /api/v1/auth/register`)
3. Login: open `/login` and sign in (NextAuth credentials via `/api/auth/[...nextauth]`)
4. Verify auth context: call `GET /api/v1/auth` after login

### 2) AI Video Processing

1. Create/select a project in `/app/projects`
2. Upload a video with `POST /api/v1/assets/upload` using form-data: `file`, `projectId`
3. Run processing for that asset with `POST /api/v1/assets/process` and `{ "assetId": "<ASSET_ID>" }`
4. Backend actions:
   - file saved under `data/uploads/<orgId>/<assetId>/original/`
   - metadata extracted with FFprobe (`durationMs`, `resolution`, `codec`, `sizeBytes`)
   - scene boundaries detected and saved in `scenes`
   - transcript record generated and saved in `transcripts`
   - thumbnail generated and asset marked `ready`
5. View assets via `GET /api/v1/assets?project_id=<projectId>`

### 3) SEO Metadata Generation

1. Ensure `.env.local` has `LLM_API_URL` and `LLM_API_KEY`
2. Ensure transcript exists for the uploaded asset (required by API)
3. Call `POST /api/v1/ai/seo-generate` with:
   - `projectId`
   - `assetId`
   - `platform` (`youtube` | `instagram` | `both`)
   - optional `targetAudience`
4. Read generated briefs from `GET /api/v1/seo-briefs?project_id=<projectId>`

### 4) Social Publishing Workflows

1. Create a campaign using `POST /api/v1/campaigns`
2. Review campaigns in `/app/publishing/calendar` or `/app/publishing/logs` and via `GET /api/v1/campaigns`
3. Use `/app/publishing/queue` for queue visualization (currently mock UI state)

### 5) KPI Dashboards / Reporting

1. Create dashboard: `POST /api/v1/dashboards` or use `/app/dashboards`
2. List dashboards: `GET /api/v1/dashboards`
3. View reports in `/app/reports` using `GET /api/v1/reports`
4. Use AI anomaly explain route when anomaly data exists: `POST /api/v1/ai/anomaly-explain`

### 6) Alerts / Exports / Projects Modules

1. Projects:
   - UI: `/app/projects`
   - API: `GET /api/v1/projects`, `POST /api/v1/projects`
2. Alerts:
   - UI: `/app/alerts`
   - API: `GET /api/v1/alerts`, `POST /api/v1/alerts`
3. Exports:
   - UI: `/app/exports`
   - API: `GET /api/v1/exports`

### 7) API Routes

1. Authenticate in browser (session cookie required for most `/api/v1/*` endpoints)
2. Use the following core groups:
   - Auth: `/api/v1/auth`, `/api/v1/auth/register`
   - Content ops: `/api/v1/projects`, `/api/v1/assets`, `/api/v1/assets/process`, `/api/v1/render-jobs`, `/api/v1/exports`
   - Distribution: `/api/v1/campaigns`, `/api/v1/alerts`, `/api/v1/reports`, `/api/v1/dashboards`
   - AI: `/api/v1/ai/seo-generate`, `/api/v1/ai/edit-plan-generate`, `/api/v1/ai/anomaly-explain`

### Edited Output Pipeline (API)

1. Upload raw video:
   - `POST /api/v1/assets/upload`
2. Process asset (scene detection + transcript persistence):
   - `POST /api/v1/assets/process`
3. Generate edit plan from detected scenes:
   - `POST /api/v1/ai/edit-plan-generate`
4. Render edited output and create export row:
   - `POST /api/v1/render-jobs`
5. Retrieve final downloadable metadata:
   - `GET /api/v1/exports`

### 8) SQLite + Drizzle Local-First Stack

1. DB file: `data/contentops.db`
2. Schema location: `src/lib/db/schema.ts`
3. DB client: `src/lib/db/index.ts`
4. Migration flow:
   - `npx drizzle-kit generate`
   - `npx drizzle-kit migrate`
5. Optional local DB UI: `npx drizzle-kit studio`

---

## Tech Stack

| Layer         | Technology                                                                 |
| ------------- | -------------------------------------------------------------------------- |
| Framework     | [Next.js 16](https://nextjs.org/) (App Router)                             |
| Language      | [TypeScript](https://www.typescriptlang.org/)                              |
| UI Library    | [React 19](https://react.dev/)                                             |
| Styling       | [Tailwind CSS 4](https://tailwindcss.com/)                                 |
| Components    | [shadcn/ui](https://ui.shadcn.com/)                                        |
| ORM           | [Drizzle ORM](https://orm.drizzle.team/)                                   |
| Database      | [SQLite](https://www.sqlite.org/index.html) (via `better-sqlite3`)         |
| State         | [Zustand](https://zustand.docs.pmnd.rs/)                                   |
| Data Fetching | [TanStack Query](https://tanstack.com/query)                               |
| Charts        | [Recharts](https://recharts.org/)                                          |
| Validation    | [Zod](https://zod.dev/)                                                    |
| AI            | [OpenAI](https://openai.com/)                                              |
| Video Proc    | [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg)       |

---

## Getting Started

### Step 1: Prerequisites

- **Node.js** ≥ 20 (Required for Next.js 16/React 19)
- **npm** or **pnpm**
- **ffmpeg** (required for video processing features)

### Step 2: Install Dependencies

```bash
# Clone and enter the project
git clone https://github.com/your-org/contentops.git
cd contentops

# Install dependencies
npm install
```

### Step 3: Configure Environment Variables

```bash
cp .env.example .env.local
```

Open `.env.local` and set at least these values:

```env
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000
LLM_API_URL=https://openrouter.ai/api/v1/
LLM_API_KEY=your-llm-api-key
```

Notes:
- Keep the trailing `/` in `LLM_API_URL`.
- SQLite is local by default at `./data/contentops.db` (no separate DB server required).

### Step 4: Database Setup

The project uses Drizzle ORM with SQLite.

```bash
# Generate migrations
npx drizzle-kit generate

# Apply migrations to the local SQLite database
npx drizzle-kit migrate

# (Optional) Visualize the database
npx drizzle-kit studio
```

### Step 5: Run Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Step 6: Production Build

```bash
# Build for production
npm run build

# Start the production server
npm run start
```

---

## Project Structure

```
contentops/
├── src/
│   ├── app/                    # Next.js App Router (pages & layouts)
│   ├── components/             # React components
│   │   ├── ui/                 # Reusable UI components (shadcn/ui)
│   │   └── ...                 # Feature-specific components
│   ├── lib/                    # Utilities, hooks, and configuration
│   │   ├── db/                 # Database schema and connection
│   │   └── ...
│   ├── styles/                 # Global CSS and Tailwind directives
├── drizzle/                    # Database migrations
├── data/                       # SQLite database file (contentops.db)
├── public/                     # Static assets
├── blueprint/                  # Architectural documentation (see below)
├── ...
```

---

## Documentation

Comprehensive architectural documentation is available in the [`blueprint`](../blueprint) directory:

*   [Overview](../blueprint/00_OVERVIEW.md)
*   [Information Architecture](../blueprint/01_INFORMATION_ARCHITECTURE.md)
*   [User Journey Mapping](../blueprint/02_USER_JOURNEY_MAPPING.md)
*   [Data Architecture](../blueprint/03_DATA_ARCHITECTURE.md)
*   [API Surface & Integrations](../blueprint/04_API_SURFACE_INTEGRATIONS.md)
*   [Component System](../blueprint/05_COMPONENT_SYSTEM.md)
*   [Page Blueprints](../blueprint/06_PAGE_BLUEPRINTS.md)
*   [Tech Stack](../blueprint/07_TECH_STACK.md)
*   [Performance & SEO](../blueprint/08_PERFORMANCE_SEO.md)

---

## License

This project is licensed under the [MIT License](LICENSE).
