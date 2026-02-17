# ContentOps AI

**Raw Video → Published Content in Minutes**

ContentOps AI is a multi-agent SaaS platform that converts raw video assets into platform-ready content. It generates SEO-optimized metadata, automates social publishing across every major channel, and provides AI-driven KPI dashboards — all from a single, intelligent interface.

---

## Architecture

The application uses a **split architecture**: a Next.js frontend + auth layer that proxies API requests to a Python FastAPI backend handling all business logic.

```
Browser ──▶ Next.js :3000 (Frontend + Auth + Proxy) ──▶ Python FastAPI :8000 (Business Logic + DB)
                                                              │
                                                       data/contentops.db
```

| Layer | Role |
|-------|------|
| **Next.js** | React pages, components, NextAuth session management, API proxy (`/api/v1/*` → Python) |
| **Python FastAPI** | All CRUD routes, AI agents, video processing, database operations |
| **SQLite** | Shared database file at `data/contentops.db` |

---

## Features

- AI video processing: upload endpoint stores files, extracts metadata via FFprobe, and generates thumbnails
- SEO metadata generation: AI route + agent for title/description/tag generation from transcript data
- Social publishing workflows: campaign CRUD APIs and publishing UI pages (queue/calendar/logs)
- KPI dashboards/reporting: dashboard + report APIs and app pages
- Auth + roles + org support: credential auth, registration, role-aware permission model
- Alerts/exports/projects modules: implemented app pages + API routes
- API routes: authenticated `/api/v1/*` surface for core operations
- SQLite local-first stack: file-based DB (`data/contentops.db`) with typed schema and queries

### Current Implementation Notes

- `Publishing Queue` page currently uses mock UI data (`src/app/(app)/app/publishing/queue/page.tsx`)
- AI routes require transcript/scenes records to exist before generation calls succeed
- OAuth buttons are present in UI, but credentials auth is the wired flow by default

---

## App Screenshots

### Marketing Features Page

![Marketing Features Page](docs/images/features-page.png)

### Login Experience

![Login Experience](docs/images/login-page.png)

### Projects Dashboard

![Projects Dashboard](docs/images/projects-dashboard.png)

---

## Tech Stack

| Layer         | Technology                                                                 |
| ------------- | -------------------------------------------------------------------------- |
| Frontend      | [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/) |
| Styling       | [Tailwind CSS 4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) |
| State         | [Zustand](https://zustand.docs.pmnd.rs/), [TanStack Query](https://tanstack.com/query) |
| Charts        | [Recharts](https://recharts.org/)                                          |
| **Backend**   | **[Python FastAPI](https://fastapi.tiangolo.com/)**                        |
| **ORM**       | **[SQLAlchemy](https://www.sqlalchemy.org/)**                              |
| Database      | [SQLite](https://www.sqlite.org/index.html)                                |
| Auth          | [NextAuth.js](https://next-auth.js.org/)                                   |
| AI            | [OpenAI Python SDK](https://github.com/openai/openai-python)              |
| Video Proc    | [ffmpeg / ffprobe](https://ffmpeg.org/) (via subprocess)                   |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20 (Required for Next.js 16/React 19)
- **Python** ≥ 3.10
- **npm**
- **ffmpeg** (required for video processing features)

### Step 1: Install Dependencies

```bash
# Clone and enter the project
git clone https://github.com/your-org/contentops.git
cd contentops

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..
```

### Step 2: Configure Environment Variables

```bash
cp .env.example .env.local
```

Open `.env.local` and set at least these values:

```env
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000
LLM_API_URL=https://openrouter.ai/api/v1/
LLM_API_KEY=your-llm-api-key
PYTHON_BACKEND_URL=http://localhost:8000
```

Notes:
- Keep the trailing `/` in `LLM_API_URL`.
- SQLite is local by default at `./data/contentops.db` (no separate DB server required).
- The Python backend reads the same `.env.local` file automatically.

### Step 3: Database Setup

The project uses SQLite. Tables are created automatically on Python backend startup. For existing setups with Drizzle:

```bash
# Generate migrations (if using Drizzle CLI)
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate
```

### Step 4: Run Development Servers

You need **two terminals**:

```bash
# Terminal 1: Start Python backend
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --port 8000 --reload
```

```bash
# Terminal 2: Start Next.js frontend
npm run dev
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:8000](http://localhost:8000)
- API Docs (Swagger): [http://localhost:8000/docs](http://localhost:8000/docs)

### Step 5: Production Build

```bash
# Build Next.js for production
npm run build
npm run start

# Python backend (use gunicorn or similar for production)
cd backend && source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## Project Structure

```
contentops/
├── src/                            # Next.js frontend
│   ├── app/                        # App Router (pages & layouts)
│   │   ├── (app)/                  # Authenticated app pages
│   │   ├── (auth)/                 # Login/signup pages
│   │   ├── (marketing)/            # Public marketing pages
│   │   └── api/                    # API proxy routes → Python backend
│   ├── components/                 # React components
│   │   ├── ui/                     # Reusable UI components (shadcn/ui)
│   │   └── ...                     # Feature-specific components
│   └── lib/                        # Utilities, hooks, and configuration
│       ├── api/proxy.ts            # Proxy helper (Next.js → Python)
│       ├── auth/                   # NextAuth configuration
│       └── db/                     # Drizzle schema (reference)
├── backend/                        # Python FastAPI backend
│   ├── app/
│   │   ├── main.py                 # FastAPI app entry point
│   │   ├── config.py               # Settings (pydantic-settings)
│   │   ├── database.py             # SQLAlchemy engine + session
│   │   ├── dependencies.py         # Auth context dependency
│   │   ├── models/                 # SQLAlchemy ORM models (25 tables)
│   │   ├── routers/                # API route handlers (12 routers)
│   │   ├── schemas/                # Pydantic request/response schemas
│   │   └── services/               # Business logic
│   │       ├── ai_client.py        # OpenAI client setup
│   │       ├── seo_generator.py    # SEO brief generation agent
│   │       ├── edit_plan_generator.py  # Edit plan generation agent
│   │       ├── anomaly_explainer.py    # Anomaly explanation agent
│   │       ├── report_writer.py    # Report summary writer agent
│   │       └── video/              # Video processing (ffmpeg)
│   ├── requirements.txt            # Python dependencies
│   └── venv/                       # Python virtual environment
├── data/                           # SQLite database + uploads
│   ├── contentops.db               # Main database
│   └── uploads/                    # Uploaded video files
├── public/                         # Static assets
└── ...
```

---

## API Reference

All API routes are available under `/api/v1/*`. The Next.js frontend proxies requests to the Python backend.

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/auth` | Get current user context + permissions |
| POST | `/api/v1/auth/register` | Register new user + org |

### Content Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/v1/projects` | List / create projects |
| GET | `/api/v1/assets` | List video assets |
| POST | `/api/v1/assets/upload` | Upload video file (multipart) |
| POST | `/api/v1/assets/process` | Process asset (scene detection + transcript) |
| GET/POST | `/api/v1/render-jobs` | List / create render jobs |
| GET | `/api/v1/exports` | List exported files |

### AI Agents
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/ai/seo-generate` | Generate SEO metadata from transcript |
| POST | `/api/v1/ai/edit-plan-generate` | Generate edit plan from scenes |
| POST | `/api/v1/ai/anomaly-explain` | Explain KPI anomaly |

### Distribution
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/v1/campaigns` | List / create campaigns |
| GET/POST | `/api/v1/dashboards` | List / create dashboards |
| GET | `/api/v1/reports` | List reports |
| GET/POST | `/api/v1/alerts` | List / create alerts |
| GET | `/api/v1/seo-briefs` | List SEO briefs |
| GET | `/api/v1/billing` | Get billing info |

### Interactive API Docs

When the Python backend is running, visit [http://localhost:8000/docs](http://localhost:8000/docs) for auto-generated Swagger documentation.

---

## Feature Walkthrough (Step by Step)

### 1) Auth + Roles + Org Support

1. Start both servers (see [Getting Started](#step-4-run-development-servers))
2. Register: open `/signup` and create an account (calls `POST /api/v1/auth/register`)
3. Login: open `/login` and sign in (NextAuth credentials via `/api/auth/[...nextauth]`)
4. Verify auth context: call `GET /api/v1/auth` after login

### 2) AI Video Processing

1. Create/select a project in `/app/projects`
2. Upload a video with `POST /api/v1/assets/upload` using form-data: `file`, `projectId`
3. Run processing for that asset with `POST /api/v1/assets/process` and `{ "assetId": "<ASSET_ID>" }`
4. Backend actions (handled by Python FastAPI):
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

### Edited Output Pipeline (API)

1. Upload raw video: `POST /api/v1/assets/upload`
2. Process asset (scene detection + transcript): `POST /api/v1/assets/process`
3. Generate edit plan from detected scenes: `POST /api/v1/ai/edit-plan-generate`
4. Render edited output and create export: `POST /api/v1/render-jobs`
5. Retrieve final downloadable metadata: `GET /api/v1/exports`

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
