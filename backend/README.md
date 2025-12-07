# RSBP Backend (Express + Sequelize + Neo4j)

Backend for the Sleep Health KBS. Provides authentication, screening processing via a rule engine, analytics, and dual persistence to PostgreSQL and Neo4j. A demo/offline mode is available for frontend testing without databases.

## Requirements
- Node.js 18+
- npm
- PostgreSQL (default: host `postgres`, db `sleep_health_db`, user `kbs_user`, password `kbsPassword123`)
- Neo4j (default: `bolt://neo4j:7687`, user `neo4j`, password `kbsPassword123`)

## Environment
Create `backend/.env` (values can stay as defaults if using docker-compose):
```
PORT=5000
JWT_SECRET=sleep_kbs_secret_2024
DB_HOST=postgres
DB_PORT=5432
DB_NAME=sleep_health_db
DB_USER=kbs_user
DB_PASSWORD=kbsPassword123
NEO4J_URI=bolt://neo4j:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=kbsPassword123
FRONTEND_URL=http://localhost:3000
# Optional flags
DEMO_MODE=false       # true to skip Postgres/Neo4j and return stub data
ALLOW_OFFLINE=false   # true to let the server start even if init fails
```

## Install and Run
```powershell
cd backend
npm install
npm run dev   # nodemon app.js
```

### Demo/Offline mode (no Postgres/Neo4j required)
```powershell
set DEMO_MODE=true
npm run dev
```
- Skips DB and Neo4j initialization
- `/api/analytics` returns empty stub data
- Screening still runs the rule engine; DB writes are skipped for guests

### Full stack (with databases)
1) Ensure Postgres and Neo4j are running (or use `docker-compose up` from repo root).
2) Run migrations and seed rules (only needed when DB is empty):
```powershell
npm run migrate
npm run seed
```
3) Start the server:
```powershell
npm run dev
```

## Scripts
- `npm run dev` — start with nodemon
- `npm start` — start without reload
- `npm run migrate` — initialize PostgreSQL schema
- `npm run seed` — seed Neo4j rule metadata

## API Base
- Base URL: `http://localhost:5000/api`
- Key routes:
  - `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
  - `POST /api/screening/process` (optional auth for guest), `GET /api/screening/history` (auth), `GET /api/screening/:id`
  - `GET /api/analytics/overview`, `/rules`, `/trends`, `/insights` (auth) and `/public/overview` (optional auth)
  - `GET /api/history` and related archive/notes endpoints (auth)

## Health Check
- `GET /health` returns server status; in demo mode it reports DB/Neo4j as skipped.

## Notes
- CORS is limited to `FRONTEND_URL` (defaults to `http://localhost:3000`).
- Sequelize `sync({ alter: true })` runs on startup in normal mode; not run in demo mode.
- Rule engine lives in `src/services/ruleEngine.js`; Neo4j logging in `src/services/neo4jService.js`.
