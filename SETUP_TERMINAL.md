# Setup Guide - Terminal/PowerShell

## Quick Start

### Option 1: Automated Setup (Recommended)

```powershell
# Run setup script (installs all dependencies and creates .env files)
.\setup.ps1

# Start development servers
.\run-dev.ps1
```

### Option 2: Manual Setup

#### 1. Install Frontend Dependencies
```powershell
cd frontend
npm install
npm run dev
# Frontend akan berjalan di http://localhost:5173
```

#### 2. Install Backend Dependencies (di terminal baru)
```powershell
cd backend
npm install
$env:ALLOW_OFFLINE='true'  # Skip database requirement
npm run dev
# Backend akan berjalan di http://localhost:5000
```

#### 3. Open Browser
```
http://localhost:5173
```

---

## Available Commands

### Frontend

```powershell
cd frontend

# Development server (hot reload)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### Backend

```powershell
cd backend

# Development server (with nodemon auto-reload)
npm run dev

# Production server
npm start

# Initialize database schema
npm run migrate

# Seed Neo4j with rules
npm run seed
```

---

## Environment Variables

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_NAME=Sleep Health KBS
```

### Backend (.env)

```env
# Server
PORT=5000
JWT_SECRET=your_secret_key_here

# Neo4j Aura
NEO4J_URI=neo4j+s://1ddeb3bf.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=BoX-qrO5bDDHAb5OwY45GsRfVSb_Sz1OfvGqNVnzLi4
NEO4J_DATABASE=neo4j

# Database (optional)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sleep_health_db
DB_USER=kbs_user
DB_PASSWORD=password

# CORS
FRONTEND_URL=http://localhost:5173

# Feature Flags
ALLOW_OFFLINE=true  # Set false if using real database
DEMO_MODE=false
```

---

## Running Both Servers Simultaneously

### Using PowerShell Tabs (VS Code)

1. Open Terminal in VS Code (`Ctrl+` `)
2. Split terminal (click the split icon)
3. Tab 1: `cd backend; npm run dev`
4. Tab 2: `cd frontend; npm run dev`

### Using Separate Command Prompts

```powershell
# Terminal 1 - Backend
cd backend
$env:ALLOW_OFFLINE='true'
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## Testing the Setup

### Check if services are running

```powershell
# Test Frontend
curl http://localhost:5173

# Test Backend
curl http://localhost:5000

# Test API
curl http://localhost:5000/api/health
```

### Expected responses

**Frontend:** HTML page loads
**Backend:** Returns JSON object with status

---

## Troubleshooting

### Port Already in Use

If `localhost:5000` or `localhost:5173` already in use:

```powershell
# Kill process on port 5000
Get-Process | Where-Object {$_.Port -eq 5000} | Stop-Process

# Or change port
$env:PORT=5001
npm run dev
```

### Node modules not found

```powershell
# Clean reinstall
rm -r node_modules
npm install
```

### Database connection issues

```powershell
# Use offline mode (skips database)
$env:ALLOW_OFFLINE='true'
npm run dev
```

### Hot reload not working

- Ensure you're using `npm run dev` (not `npm start`)
- Check file changes are being saved
- Restart the dev server

---

## Project Structure

```
├── frontend/              # React Vite app
│   ├── src/
│   │   ├── pages/        # Route pages
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # React Context
│   │   └── utils/        # Helper functions
│   ├── package.json
│   └── .env
│
├── backend/               # Express.js API
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── controllers/  # Route handlers
│   │   ├── services/     # Business logic
│   │   ├── models/       # Database models
│   │   └── config/       # Configuration
│   ├── package.json
│   └── .env
│
├── setup.ps1             # Setup script
├── run-dev.ps1           # Development launcher
├── build.ps1             # Production builder
└── DEPLOYMENT.md         # Vercel deployment guide
```

---

## Development Workflow

1. **Setup once:**
   ```powershell
   .\setup.ps1
   ```

2. **Daily development:**
   ```powershell
   .\run-dev.ps1
   # Or run manually in separate terminals
   ```

3. **Make changes:**
   - Frontend: Changes hot-reload in browser
   - Backend: Auto-reloads with nodemon

4. **Test API:**
   - Use Postman or `curl` commands
   - Check console for logs

5. **Before committing:**
   ```powershell
   # Frontend
   cd frontend
   npm run lint:fix
   npm run build  # Test build

   # Backend
   cd backend
   npm run lint  # If available
   ```

---

## Next Steps

- [ ] Run `.\setup.ps1`
- [ ] Run `.\run-dev.ps1`
- [ ] Open http://localhost:5173
- [ ] Test login/registration
- [ ] Test screening form
- [ ] Check analytics dashboard
- [ ] Review code changes
- [ ] Commit and push to GitHub
- [ ] Deploy to Vercel (see DEPLOYMENT.md)

---

## More Information

- Frontend README: `frontend/README.md`
- Backend README: `backend/README.md`
- Deployment Guide: `DEPLOYMENT.md`
- Environment Template: `.env.example`
