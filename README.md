# Asset Management Dashboard

A full-stack, role-based IT asset management system built with **FastAPI**, **PostgreSQL**, **React**, and **TypeScript**. Tracks organizational hardware assets, their assignment to employees, encrypted invoice storage, and includes tooling for bulk Excel ingestion, fuzzy duplicate detection, and admin data management.

Built as a portfolio project to demonstrate end-to-end full-stack architecture, from database design through a production-style React frontend.

---

## Features

- **Authentication & authorization** — JWT-based auth, bcrypt password hashing, two roles (admin / viewer) enforced on both backend routes and frontend UI
- **Asset & user management** — full CRUD via the UI, with a many-to-many asset↔user assignment model (supports shared assets)
- **Excel ingestion, two formats:**
  - A clean, one-row-per-asset template
  - A real-world "wide" per-person hardware list format, parsed with fuzzy header matching and typo-tolerant device classification to handle inconsistent, human-entered spreadsheets
  - Two-step **preview → confirm** import flow — nothing is written to the database until an admin explicitly reviews and confirms what will change
- **Duplicate detection** — fuzzy name-matching (via `rapidfuzz`) surfaces likely duplicate people (e.g. typos, re-entered records) for admin review, with merge or dismiss actions
- **Encrypted invoice storage** — PDF/image invoices attached to assets, encrypted at rest (Fernet/AES), decrypted only in-memory on authorized download
- **Filtering, search, sorting** — server-side filtering on the assets table, client-side search on the (smaller) users table, sortable columns, CSV export on both
- **Dashboards** — KPI summary cards, a donut chart (by commodity type) and bar chart (by location) that are clickable and filter-through to the assets table, a "top assets held" chart on the users page
- **Global search / command palette** (`Ctrl+K`) — jump to any asset or person from anywhere in the app
- **Quick Create** — create a new asset or person from any page, without navigating away
- **Toast notifications, loading skeletons, empty states** throughout

---

## Tech Stack

**Backend**
- FastAPI (Python) — API framework
- PostgreSQL — database
- SQLAlchemy — ORM
- Alembic — schema migrations
- Pydantic — request/response validation
- `python-jose` + `bcrypt` — JWT auth and password hashing
- `cryptography` (Fernet) — invoice encryption at rest
- `pandas` + `openpyxl` — Excel parsing
- `rapidfuzz` — fuzzy string matching (duplicate detection, header/device classification)

**Frontend**
- React + TypeScript, built with Vite
- React Router — routing, including nested layout routes
- TanStack Query — server state, caching, and data fetching
- TanStack Table — sortable, filterable data tables
- Tailwind CSS — styling, with a small custom design-token layer
- Recharts — charts
- Radix UI — accessible dropdown menu primitives
- `react-hot-toast` — notifications
- `papaparse` — CSV export

---

## Architecture Overview

The backend and frontend are fully decoupled — a REST API consumed by a client-rendered single-page app, communicating over JSON (with `multipart/form-data` for file uploads).

**Backend structure**
```
backend/
├── app/
│   ├── main.py           # FastAPI app, router registration, CORS
│   ├── config.py         # environment-based settings (pydantic-settings)
│   ├── database.py       # SQLAlchemy engine/session setup
│   ├── models.py         # ORM models (Asset, User, AssetAssignment, Invoice, ...)
│   ├── schemas.py        # Pydantic request/response schemas
│   ├── auth.py           # JWT creation/verification, role-based dependencies
│   ├── routers/          # one file per resource (assets, users, upload, invoices, duplicates, search, auth)
│   └── services/         # business logic (excel parsing, wide-format parsing, encryption, storage)
└── alembic/               # versioned schema migrations
```

**Frontend structure**
```
frontend/
├── src/
│   ├── api/               # one file per resource; all HTTP calls live here
│   ├── components/        # reusable UI components
│   ├── context/           # AuthContext (login state, role, token)
│   ├── pages/              # route-level components
│   ├── types/               # shared TypeScript interfaces matching backend schemas
│   └── utils/                 # small pure helper functions (formatting, aggregation, slugify, etc.)
```

**Key design decisions**
- **Surrogate keys + business keys**: every table uses an auto-incrementing `id` for internal relationships, separate from human-meaningful identifiers like `asset_code` — so business identifiers can be corrected without breaking foreign key relationships.
- **Soft deactivation, not deletion, for imports**: an asset missing from a re-uploaded file is marked `is_active = false`, never hard-deleted — preserving history. Manual deletion (via the UI) *is* a real, irreversible delete, and is gated behind a confirmation dialog and admin role.
- **Idempotent upserts**: re-uploading the same file is always safe — matching is done by unique keys (asset code, then serial number as a fallback), not blind inserts.
- **Encryption is layered, not monolithic**: passwords are hashed (one-way, via bcrypt) — genuinely different from encryption. Invoice files are encrypted (reversible, via Fernet) at rest and decrypted only transiently in memory on an authorized request. Transport security is handled by TLS/HTTPS at the infrastructure level.

---

## Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (or Docker, to run it in a container)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
```

Create a `.env` file in `backend/`:
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/asset_dashboard
SECRET_KEY=your-random-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=60
INVOICE_ENCRYPTION_KEY=your-fernet-key
```

Generate a Fernet key:
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Run migrations and start the server:
```bash
alembic upgrade head
uvicorn app.main:app --reload
```

API docs available at `http://127.0.0.1:8000/docs`.

**Create your first admin user** (no self-signup — bootstrap manually):
```bash
python create_admin.py "Your Name" you@example.com yourpassword admin
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at `http://localhost:5173`.

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | JWT signing key — use a long, random value in production |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | How long a login session lasts before requiring re-authentication |
| `INVOICE_ENCRYPTION_KEY` | Fernet key for encrypting invoice files at rest |

---

## Known Limitations / Roadmap

- **Placeholder identities from Excel import**: since the source spreadsheets don't include employee emails, imported users get a synthetic placeholder email (used only for internal matching/idempotency). A future migration to real employee IDs/emails is a clean, additive change — no schema change required.
- **No self-service password reset** — accounts are provisioned by an admin.
- **Historical trend data, department/warranty/purchase-date fields** are not yet tracked — noted as a deliberate scope boundary rather than an oversight; adding them is a straightforward schema extension.
- **No automated test suite yet.**

---

## License

Personal portfolio project — not licensed for production/commercial use as-is.
