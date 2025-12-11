# RSBP Sleep Health Knowledge-Based System

<img width="1919" height="957" alt="image" src="https://github.com/user-attachments/assets/a4c85f2a-08c1-4ba4-8e70-7e43c823a7b3" />

A full-stack knowledge-based system for sleep health screening and diagnosis. Built with React (frontend) and Express/PostgreSQL/Neo4j (backend), featuring a forward-chaining rule inference engine with 40+ medical rules for sleep disorder detection.

## System Architecture

**Tech Stack:**
- **Frontend:** React 18, Vite 5, Tailwind CSS, React Router v6, Chart.js, Framer Motion
- **Backend:** Node.js, Express, Sequelize (PostgreSQL), Neo4j Graph Database
- **Inference Engine:** Forward-chaining rule engine for medical diagnosis
- **Authentication:** JWT-based with guest mode support

**Key Features:**
- Sleep disorder screening (Insomnia & Sleep Apnea)
- Real-time rule inference with 40+ medical rules
- Dual database architecture (PostgreSQL + Neo4j)
- Interactive data visualization and analytics
- Responsive mobile-first design with dark/light themes
- Export screening reports (CSV/TXT)

## Repository Structure

```
RSBP-FINAL/
├── frontend/           # React SPA with Vite
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Application pages
│   │   ├── contexts/   # React Context (Auth, Theme)
│   │   ├── store/      # Zustand stores
│   │   └── utils/      # API client and constants
│   └── README.md       # Frontend documentation
├── backend/            # Express API server
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic & rule engine
│   │   ├── models/         # Sequelize models
│   │   ├── routes/         # API routes
│   │   └── config/         # Database configurations
│   └── README.md           # Backend documentation
├── docker-compose.yml      # Docker services configuration
└── README.md              # This file
```

## Quick Start

### Option 1: Demo Mode (No Database Required)

Perfect for UI testing and frontend development:

```powershell
# Backend (demo mode)
cd backend
$ENV:DEMO_MODE='true'
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Access:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

**Note:** Demo mode uses stub data for history/analytics. Rule engine still runs for screening.

### Option 2: Full Stack (With Databases)

Complete system with PostgreSQL and Neo4j:

```powershell
# 1. Start databases
docker-compose up -d postgres neo4j

# 2. Initialize backend
cd backend
npm install
npm run migrate    # Create database schema
npm run seed       # Seed Neo4j with rule metadata
npm run dev

# 3. Start frontend (new terminal)
cd frontend
npm install
npm run dev
```

## Service Endpoints

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | - |
| Backend API | http://localhost:5000/api | - |
| Health Check | http://localhost:5000/health | - |
| Neo4j Browser | http://localhost:7474 | neo4j / kbsPassword123 |
| PostgreSQL | localhost:5432 | kbs_user / kbsPassword123 |

## Environment Configuration

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Sleep Health KBS
```

### Backend (.env)
```env
PORT=5000
JWT_SECRET=sleep_kbs_secret_2024

# PostgreSQL
DB_HOST=postgres
DB_PORT=5432
DB_NAME=sleep_health_db
DB_USER=kbs_user
DB_PASSWORD=kbsPassword123

# Neo4j
NEO4J_URI=bolt://neo4j:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=kbsPassword123

# CORS
FRONTEND_URL=http://localhost:5173

# Optional flags
DEMO_MODE=false
ALLOW_OFFLINE=false
```

## Available Scripts

### Frontend
```powershell
npm run dev         # Start development server
npm run build       # Production build
npm run preview     # Preview production build
npm run lint        # Run ESLint
```

### Backend
```powershell
npm run dev         # Start with nodemon
npm start           # Start without reload
npm run migrate     # Initialize database schema
npm run seed        # Seed Neo4j rule metadata
```

### Docker
```powershell
docker-compose up              # Start all services
docker-compose up -d           # Start in background
docker-compose down            # Stop all services
docker-compose logs -f         # View logs
```

## Application Features

**Pages:**
- Landing Page - System introduction
- Login/Register - User authentication
- Dashboard - Statistics and recent screenings
- Screening Form - Sleep health questionnaire
- Results - Diagnosis with recommendations
- History - Past screening records with export
- Analytics - Data visualization and insights
- Settings - Account and preferences
- Help & Support - FAQs and resources

**UI Components:**
- Responsive navigation (desktop sidebar + mobile bottom nav)
- Dark/Light theme toggle
- Real-time system health monitoring
- Interactive charts and graphs
- Toast notifications
- Loading states and error handling

## Development Workflow

1. **Start databases:** `docker-compose up -d postgres neo4j`
2. **Backend development:** `cd backend && npm run dev`
3. **Frontend development:** `cd frontend && npm run dev`
4. **Test changes:** Access http://localhost:5173
5. **Check health:** http://localhost:5000/health

## Documentation

- **Frontend Guide:** `frontend/README.md`
- **Backend Guide:** `backend/README.md`
- **API Documentation:** Access `/api-docs` in running application
- **Component Library:** Access `/components` for UI component showcase

## Troubleshooting

**Backend won't start:**
- Check if databases are running: `docker-compose ps`
- Use `ALLOW_OFFLINE=true` to start without databases
- Verify `.env` credentials match docker-compose.yml

**Frontend connection errors:**
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in frontend/.env
- Verify CORS settings in backend

**Database issues:**
- Run migrations: `cd backend && npm run migrate`
- Reset Neo4j: Delete data volume and reseed
- Check connection strings in backend/.env

## License

This project is developed for academic purposes at RSBP (Rumah Sakit Bhayangkara Polda).

## Contributors

Developed as part of sleep health diagnostic system implementation.
