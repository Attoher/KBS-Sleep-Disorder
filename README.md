# RSBP Sleep Health KBS

Full-stack knowledge-based system for sleep health screening with React (frontend) and Express/Sequelize/Neo4j (backend). Supports dual database writes (PostgreSQL + Neo4j) and a demo/offline mode for frontend testing without databases.

## Repository Layout
- `frontend/` — React + Vite SPA
- `backend/` — Express API, rule engine, Sequelize models, Neo4j logging
- `docker-compose.yml` — Postgres, Neo4j, backend, frontend services

## Quick Start (Demo / No Databases)
Designed for local UI testing without Postgres/Neo4j.
```powershell
# Backend (demo mode)
cd backend
set DEMO_MODE=true
npm install
npm run dev  # starts on http://localhost:5000

# Frontend
cd ../frontend
npm install
npm run dev  # starts on http://localhost:3000
```
- Analytics and history return stub/empty data in demo mode.
- Screening endpoint still runs the rule engine; DB/Neo4j writes are skipped.

## Full Stack (With Databases)
```powershell
# From repo root
docker-compose up -d postgres neo4j

# Backend
cd backend
npm install
npm run migrate
npm run seed
npm run dev

# Frontend
cd ../frontend
npm install
npm run dev
```
Services:
- Frontend: http://localhost:3000
- API: http://localhost:5000/api
- Health: http://localhost:5000/health
- Neo4j Browser: http://localhost:7474 (neo4j / kbsPassword123)
- PostgreSQL: localhost:5432 (kbs_user / kbsPassword123)

## Environment Files
See `frontend/README.md` and `backend/README.md` for exact `.env` samples. Key vars:
- `frontend/.env`: `VITE_API_URL` (default `http://localhost:5000/api`)
- `backend/.env`: DB credentials, Neo4j credentials, `DEMO_MODE`, `ALLOW_OFFLINE`, `FRONTEND_URL`

## Useful Scripts
- Frontend: `npm run dev | build | preview | lint`
- Backend: `npm run dev | start | migrate | seed`
- Docker: `docker-compose up` to run the full stack

## Documentation
- Frontend guide: `frontend/README.md`
- Backend guide: `backend/README.md`
- Troubleshooting and testing: see files under `frontend/`
