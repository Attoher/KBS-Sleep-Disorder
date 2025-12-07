# 🌐 RSBP Frontend - Sleep Health KBS

Frontend aplikasi Sleep Health Knowledge-Based System menggunakan React + Vite.

## 🚀 Quick Start

### Cara Tercepat (Interactive Menu)
```powershell
cd frontend
.\start.ps1
```

Pilih dari menu interaktif:
1. Install Dependencies
2. Start Development Server
3. Build Production
4. Preview Production
5. Health Check
6. Test Backend Connection
7. Docker Build & Run
8. Full System Check

### Manual Commands

#### Development
```powershell
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev

# Build production
npm run build

# Preview production build
npm run preview
```

#### Docker
```powershell
# Build & run with Docker
docker build -t sleep-health-frontend .
docker run -d -p 3000:80 --name frontend sleep-health-frontend

# Or with docker-compose (full stack)
docker-compose up
```

## 📋 Prerequisites

**PENTING**: Backend harus running di `http://localhost:5000` untuk development!

```powershell
# Option 1: Run backend manually
cd backend
npm run dev

# Option 2: Run with Docker
docker-compose up backend postgres neo4j
```

## 🔧 Configuration

### Environment Variables (`.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Sleep Health KBS
```

**Note**: Vite requires `VITE_` prefix for env vars!

### Default Behavior
- **Landing page**: `/login` - Users see login form immediately
- **Protected routes**: Require authentication, redirect to `/login` if not authenticated
- **Loading state**: Shows animated spinner while checking authentication

### Ports
- **Development**: 3000 (Vite dev server)
- **Production**: 80 (nginx in Docker)
- **Preview**: 4173 (vite preview)
- **Backend**: 5000 (must be running)

## 🧪 Testing

### Automated Health Check
```powershell
.\health-check.ps1
```

Checks:
- ✅ Dependencies installed
- ✅ Environment variables
- ✅ Backend connectivity
- ✅ Critical files exist
- ✅ Production build works
- ✅ Linting passes
- ✅ Docker config

### Manual Testing
```powershell
# Test backend connection
Invoke-WebRequest http://localhost:5000/health

# Check build output
npm run build
Get-ChildItem dist -Recurse

# Test specific components
npm run dev
# Then open: http://localhost:3000
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # Entry point
│   ├── components/
│   │   ├── Common/             # Reusable components
│   │   ├── Dashboard/          # Dashboard specific
│   │   ├── History/            # History table
│   │   ├── Layout/             # Layout components
│   │   └── Screening/          # Screening form
│   ├── contexts/
│   │   └── AuthContext.jsx     # Auth context provider
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── ScreeningForm.jsx
│   │   ├── History.jsx
│   │   ├── Analytics.jsx
│   │   └── Results.jsx
│   ├── store/
│   │   └── useAuthStore.js     # Zustand auth store
│   └── utils/
│       ├── api.js              # Axios instance
│       └── constants.js        # App constants
├── .env                        # Environment variables
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS config
├── Dockerfile                  # Docker build config
├── nginx.conf                  # Production nginx config
├── start.ps1                   # Interactive menu
├── health-check.ps1            # Health check script
└── TESTING.md                  # Complete testing guide
```

## 🎨 Tech Stack

- **Framework**: React 18.2
- **Build Tool**: Vite 5
- **Router**: React Router DOM 6
- **State Management**: 
  - React Context (user state)
  - Zustand (token persistence)
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Chart.js + Recharts
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 🔐 Authentication

Frontend menggunakan **dual auth state management**:

1. **Zustand Store** (`useAuthStore`) - Token persistence
   ```javascript
   const { token, setToken, logout } = useAuthStore();
   ```

2. **React Context** (`AuthContext`) - User object & methods
   ```javascript
   const { user, login, register, logout } = useAuth();
   ```

### Protected Routes
```jsx
<PrivateRoute>
  <Dashboard />
</PrivateRoute>
```

Auto-redirect ke `/login` jika tidak authenticated (via axios interceptor).

## 📦 Build & Deployment

### Production Build
```powershell
# Build static files
npm run build

# Output: dist/ folder
# Size: ~0.95 MB (gzipped)
```

### Docker Production
```powershell
# Build image
docker build -t sleep-health-frontend:latest .

# Run container
docker run -d -p 80:80 sleep-health-frontend:latest
```

Docker menggunakan **multi-stage build**:
1. Build stage: Node.js 18 Alpine
2. Production stage: Nginx Alpine

### Nginx Configuration
- ✅ SPA routing support (`try_files`)
- ✅ Static asset caching (1 year)
- ✅ Gzip compression
- ✅ Security headers
- ✅ Health check endpoint (`/health`)

## 🐛 Troubleshooting

### Backend connection error
```powershell
# Check if backend is running
Invoke-WebRequest http://localhost:5000/health

# Start backend
cd backend
npm run dev

# Or with Docker
docker-compose up backend
```

### Port already in use
```powershell
# Check port 3000
Get-NetTCPConnection -LocalPort 3000

# Kill process
Stop-Process -Id <PID> -Force
```

### Build errors
```powershell
# Clear and reinstall
Remove-Item -Recurse -Force node_modules, dist
npm install
npm run build
```

### CORS errors
Pastikan backend CORS config:
```javascript
// backend/app.js
cors({
  origin: 'http://localhost:3000',
  credentials: true
})
```

## 📚 Documentation

- **[TESTING.md](./TESTING.md)** - Complete testing & deployment guide
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues & solutions (BLANK PAGE FIX!)
- **[API Integration](../backend/README.md)** - Backend API documentation

## 🤝 Development Workflow

1. **Start Backend**
   ```powershell
   cd backend
   npm run dev
   ```

2. **Start Frontend**
   ```powershell
   cd frontend
   npm run dev
   ```

3. **Open Browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - Backend Health: http://localhost:5000/health

4. **Test Features**
   - Register new user
   - Login
   - Submit screening
   - View results
   - Check history
   - View analytics

## 🔗 API Endpoints Used

```
POST /api/auth/register      - Register user
POST /api/auth/login         - Login user
GET  /api/auth/me            - Get current user
POST /api/screening/process  - Process screening
GET  /api/history            - Get screening history
GET  /api/analytics/overview - Get analytics data
```

## ✅ Quick Checklist

Before deployment:
- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables set (`.env`)
- [ ] Backend running (`http://localhost:5000`)
- [ ] Build successful (`npm run build`)
- [ ] No linting errors (`npm run lint`)
- [ ] All routes accessible
- [ ] Authentication working
- [ ] Forms submitting correctly
- [ ] Docker image builds

---

**💻 Happy Coding!**

For issues, check `TESTING.md` or run `.\start.ps1` for interactive help.
