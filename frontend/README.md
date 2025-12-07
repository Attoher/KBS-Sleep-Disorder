# RSBP Frontend (React + Vite)

Frontend for the Sleep Health KBS. Uses React 18, Vite 5, Tailwind, React Router, Chart.js/Recharts, Lucide icons, Framer Motion, and React Hot Toast.

## Requirements
- Node.js 18+
- npm
- Backend available at `http://localhost:5000` (or set `VITE_API_URL` accordingly)

## Environment
Create `frontend/.env`:
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Sleep Health KBS
```

## Install and Run
```powershell
cd frontend
npm install
npm run dev       # http://localhost:3000
```

Build and preview:
```powershell
npm run build
npm run preview   # http://localhost:4173
```

Docker (frontend only):
```powershell
docker build -t sleep-health-frontend .
docker run -d -p 3000:80 --name frontend sleep-health-frontend
```

## Notes
- Auth uses React Context (user state) and Zustand (token persistence).
- Protected routes use `PrivateRoute`; guest mode is allowed on dashboard/screening/results, full auth required for history/analytics.
- `start.ps1` and `health-check.ps1` are available for Windows helpers; use manual commands above if you prefer.

## Project Layout
```
frontend/
├── src/
│   ├── App.jsx, main.jsx
│   ├── components/ (Common, Dashboard, History, Layout, Screening)
│   ├── contexts/ (AuthContext)
│   ├── pages/ (Dashboard, Login, Register, ScreeningForm, Results, History, Analytics)
│   ├── store/ (useAuthStore)
│   └── utils/ (api.js, constants.js)
├── Dockerfile, nginx.conf
├── vite.config.js, tailwind.config.js
├── start.ps1, health-check.ps1, TESTING.md, TROUBLESHOOTING.md, BLANK-PAGE-FIX.md
└── .env (local override)
```
