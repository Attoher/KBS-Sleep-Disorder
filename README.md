# Sleep Health Knowledge-Based System

<img width="1919" height="957" alt="image" src="https://github.com/user-attachments/assets/a4c85f2a-08c1-4ba4-8e70-7e43c823a7b3" />

A comprehensive full-stack knowledge-based system for sleep health screening and diagnosis. Built with React (frontend) and Express/SQLite/Neo4j (backend), featuring a forward-chaining rule inference engine with 40+ medical rules for sleep disorder detection.

## System Architecture

**Tech Stack:**
- **Frontend:** React 18.2, Vite 7.2.7, Tailwind CSS 3.4, React Router v6.20
- **Backend:** Node.js, Express 4.18, Sequelize 6.35 (SQLite/PostgreSQL), Neo4j Driver 5.18
- **UI Libraries:** Chart.js 4.4, Recharts 2.10, Framer Motion 10.16, Lucide React 0.309
- **State Management:** Zustand 4.4, React Context API
- **Inference Engine:** Custom forward-chaining rule engine for medical diagnosis
- **Authentication:** JWT-based with bcrypt, guest mode support (5 screening limit)

**Key Features:**
- Sleep disorder screening (Insomnia & Sleep Apnea detection)
- Real-time rule inference with 40+ medical rules
- Dual database architecture (SQLite for auth + Neo4j for screening data)
- Interactive data visualization and analytics
- Responsive mobile-first design with dark/light themes
- Multi-language support (Indonesian, English, Chinese)
- Export screening reports (CSV/TXT)
- Guest user mode with automatic cleanup

## Repository Structure

```
KBS-Sleep-Disorder-main/
├── frontend/                    # React SPA with Vite
│   ├── src/
│   │   ├── components/          # Reusable UI components (21+)
│   │   │   ├── Animations/      # ScrollReveal, StickyStack
│   │   │   ├── Common/          # Button, Card, Loader, ThemeToggle, LanguageSelector
│   │   │   ├── Dashboard/       # StatsCard, RecentScreenings
│   │   │   ├── History/         # HistoryTable
│   │   │   ├── Layout/          # Header, Sidebar, Layout
│   │   │   ├── Screening/       # ScreeningForm
│   │   │   └── Settings/        # DeleteAccountModal
│   │   ├── pages/               # Application pages (14)
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Login.jsx / Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ScreeningForm.jsx / Results.jsx
│   │   │   ├── History.jsx / Analytics.jsx
│   │   │   ├── Settings.jsx / Help.jsx
│   │   │   ├── APIDocumentation.jsx
│   │   │   ├── ComponentLibrary.jsx
│   │   │   └── UIShowcase.jsx / ShowcaseResults.jsx
│   │   ├── contexts/            # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   ├── ThemeContext.jsx
│   │   │   └── LanguageContext.jsx
│   │   ├── store/               # Zustand state management
│   │   ├── utils/               # API client, constants, export utilities
│   │   ├── App.jsx              # Main app component with routing
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Global styles and design system
│   ├── public/                  # Static assets
│   ├── package.json
│   └── README.md                # Frontend documentation
├── backend/                     # Express API server
│   ├── src/
│   │   ├── controllers/         # Request handlers (4)
│   │   │   ├── authController.js
│   │   │   ├── screeningController.js
│   │   │   ├── historyController.js
│   │   │   └── analyticsController.js
│   │   ├── services/            # Business logic & rule engine (3)
│   │   │   ├── ruleEngine.js    # Forward-chaining inference
│   │   │   ├── screeningService.js
│   │   │   └── analyticsService.js
│   │   ├── models/              # Sequelize models (4)
│   │   │   ├── User.js
│   │   │   ├── Screening.js
│   │   │   ├── GuestScreening.js
│   │   │   └── index.js
│   │   ├── routes/              # API routes (4)
│   │   │   ├── auth.js
│   │   │   ├── screening.js
│   │   │   ├── history.js
│   │   │   └── analytics.js
│   │   ├── config/              # Database configurations (3)
│   │   │   ├── sqlite.js
│   │   │   ├── neo4j.js
│   │   │   └── database.js
│   │   ├── middleware/          # Authentication middleware
│   │   └── migrations/          # Database initialization scripts
│   ├── data/                    # SQLite database file
│   ├── app.js                   # Express app setup
│   ├── package.json
│   └── README.md                # Backend documentation
├── .github/                     # GitHub workflows
├── docker-compose.yml           # Docker services (PostgreSQL, Neo4j)
├── setup.ps1                    # Automated setup script
├── run-dev.ps1                  # Development runner script
├── build.ps1                    # Production build script
└── README.md                    # This file
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

Complete system with SQLite and Neo4j:

```powershell
# 1. Start Neo4j (optional, for rule metadata)
docker-compose up -d neo4j

# 2. Initialize backend
cd backend
npm install
npm run migrate    # Create SQLite schema
npm run seed       # Seed Neo4j with rule metadata (if running)
npm run dev

# 3. Start frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Option 3: Automated Setup

Use the provided PowerShell scripts:

```powershell
# One-time setup
.\setup.ps1

# Run development servers
.\run-dev.ps1
```

## Service Endpoints

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | - |
| Backend API | http://localhost:5000/api | - |
| Health Check | http://localhost:5000/health | - |
| API Documentation | http://localhost:5173/api-docs | - |
| Component Library | http://localhost:5173/components | - |
| Neo4j Browser | http://localhost:7474 | neo4j / kbsPassword123 |

### API Routes

**Authentication:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/guest-login` - Guest mode login
- `GET /api/auth/me` - Get current user

**Screening:**
- `POST /api/screening/submit` - Submit screening questionnaire
- `GET /api/screening/:id` - Get screening result

**History:**
- `GET /api/history` - Get user screening history
- `DELETE /api/history/:id` - Delete screening record
- `GET /api/history/export/:id` - Export screening as CSV/TXT

**Analytics:**
- `GET /api/analytics/overview` - Get analytics overview
- `GET /api/analytics/trends` - Get screening trends

## Environment Configuration

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Sleep Health KBS
```

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=sleep_kbs_secret_2024

# SQLite (default for auth)
DB_DIALECT=sqlite
DB_STORAGE=./data/sleep_health.db

# PostgreSQL (alternative)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sleep_health_db
DB_USER=kbs_user
DB_PASSWORD=kbsPassword123

# Neo4j (for rule metadata)
NEO4J_URI=bolt://localhost:7687
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
npm run dev         # Start Vite development server (port 5173)
npm run build       # Production build to dist/
npm run preview     # Preview production build
npm run lint        # Run ESLint
npm run lint:fix    # Auto-fix ESLint issues
```

### Backend
```powershell
npm run dev         # Start with nodemon (auto-reload)
npm start           # Start production server
npm run migrate     # Initialize SQLite database schema
npm run seed        # Seed Neo4j with rule metadata
```

### Docker
```powershell
docker-compose up              # Start all services
docker-compose up -d           # Start in background
docker-compose down            # Stop all services
docker-compose logs -f         # View logs
docker-compose ps              # Check service status
```

### Automation Scripts
```powershell
.\setup.ps1         # One-time project setup
.\run-dev.ps1       # Start both frontend and backend
.\build.ps1         # Build production bundles
```

## Application Features

### Pages

**Public Pages:**
- **Landing Page** - System introduction with feature showcase
- **Login** - User authentication with JWT
- **Register** - New user registration

**Authenticated Pages:**
- **Dashboard** - Statistics overview and recent screenings
- **Screening Form** - Comprehensive sleep health questionnaire
- **Results** - Detailed diagnosis with rule engine analysis and recommendations
- **History** - Past screening records with export functionality
- **Analytics** - Data visualization with trends and insights
- **Settings** - Account management, language preferences, theme settings
- **Help & Support** - FAQs and system resources

**Developer Pages:**
- **API Documentation** - Interactive API endpoint documentation
- **Component Library** - UI component showcase and examples
- **UI Showcase** - Design system demonstration

### UI Components

**Navigation:**
- Responsive navigation (desktop sidebar + mobile bottom nav)
- Breadcrumb navigation
- Active route highlighting

**Theming:**
- Dark/Light theme toggle with system preference detection
- Smooth theme transitions
- Persistent theme preference

**Feedback:**
- Toast notifications (success, error, info, warning)
- Loading states and skeletons
- Error handling with retry mechanisms
- Empty states with call-to-action

**Data Visualization:**
- Interactive charts (Chart.js, Recharts)
- Real-time system health monitoring
- Screening history graphs
- Analytics dashboards

**Forms:**
- Multi-step screening questionnaire
- Form validation with error messages
- Auto-save functionality
- Progress indicators

**Accessibility:**
- ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support

**Internationalization:**
- Language selector (Indonesian, English, Chinese)
- Persistent language preference
- Dynamic content translation

**Guest Features:**
- Guest mode with 5 screening limit
- Guest limit modal with registration prompt
- Automatic cleanup on logout

## Development Workflow

1. **Start databases (optional):** `docker-compose up -d neo4j`
2. **Backend development:** `cd backend && npm run dev`
3. **Frontend development:** `cd frontend && npm run dev`
4. **Test changes:** Access http://localhost:5173
5. **Check health:** http://localhost:5000/health
6. **View API docs:** http://localhost:5173/api-docs
7. **Browse components:** http://localhost:5173/components

### Development Best Practices

- Use ESLint for code quality (`npm run lint`)
- Test in both light and dark themes
- Verify responsive design on mobile/tablet/desktop
- Check guest mode functionality
- Validate form inputs and error handling
- Test database connectivity (SQLite + Neo4j)
- Review health check endpoint for service status

## Documentation

- **Frontend Guide:** [frontend/README.md](file:///c:/Users/ADVAN/Documents/RSBP/KBS-Sleep-Disorder-main/frontend/README.md)
- **Backend Guide:** [backend/README.md](file:///c:/Users/ADVAN/Documents/RSBP/KBS-Sleep-Disorder-main/backend/README.md)
- **API Documentation:** Access `/api-docs` in running application
- **Component Library:** Access `/components` for UI component showcase
- **Deployment Guides:**
  - [DEPLOYMENT.md](file:///c:/Users/ADVAN/Documents/RSBP/KBS-Sleep-Disorder-main/DEPLOYMENT.md)
  - [BACKEND_DEPLOYMENT.md](file:///c:/Users/ADVAN/Documents/RSBP/KBS-Sleep-Disorder-main/BACKEND_DEPLOYMENT.md)
  - [VERCEL_SETUP.md](file:///c:/Users/ADVAN/Documents/RSBP/KBS-Sleep-Disorder-main/VERCEL_SETUP.md)

## Troubleshooting

### Backend Issues

**Backend won't start:**
- Check if Neo4j is running (if not using DEMO_MODE): `docker-compose ps`
- Use `ALLOW_OFFLINE=true` to start without Neo4j
- Verify `.env` file exists in backend directory
- Check SQLite database permissions in `backend/data/`
- Review logs for specific error messages

**Database connection errors:**
- SQLite: Ensure `backend/data/` directory exists
- Neo4j: Verify credentials match docker-compose.yml
- Run migrations: `cd backend && npm run migrate`
- Check connection strings in backend/.env

**Rule engine not working:**
- Verify Neo4j is running and seeded: `npm run seed`
- Check health endpoint: http://localhost:5000/health
- Review rule engine logs in console

### Frontend Issues

**Frontend connection errors:**
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in frontend/.env
- Verify CORS settings in backend (FRONTEND_URL)
- Clear browser cache and reload

**Build errors:**
- Delete `node_modules` and reinstall: `npm install`
- Clear Vite cache: Delete `frontend/.vite` directory
- Check for ESLint errors: `npm run lint`

**UI not updating:**
- Hard refresh browser (Ctrl+Shift+R)
- Check React DevTools for component state
- Verify API responses in Network tab

### Guest Mode Issues

**Guest screenings not working:**
- Check if guest user is properly authenticated
- Verify guest screening limit (max 5)
- Check localStorage for guest session data
- Review backend logs for guest-specific errors

**Guest data not clearing:**
- Manually logout and login again
- Clear browser localStorage
- Check backend guest cleanup logic

### Docker Issues

**Neo4j won't start:**
- Check if port 7474/7687 is already in use
- Verify Docker is running
- Delete volumes and restart: `docker-compose down -v && docker-compose up -d`
- Check Neo4j logs: `docker-compose logs neo4j`

**Database persistence issues:**
- Ensure Docker volumes are properly mounted
- Check docker-compose.yml volume configurations
- Verify file permissions on host system

### General Issues

**Port conflicts:**
- Frontend (5173): Change in vite.config.js
- Backend (5000): Change PORT in backend/.env
- Neo4j (7474, 7687): Change in docker-compose.yml

**Performance issues:**
- Check browser console for errors
- Monitor Network tab for slow API calls
- Review backend logs for database query performance
- Consider enabling production mode optimizations

## License

This project is developed for academic purposes at **ITS (Institut Teknologi Sepuluh Nopember) Surabaya**.

## Contributors

Developed as part of sleep health diagnostic system implementation for knowledge-based final project.
