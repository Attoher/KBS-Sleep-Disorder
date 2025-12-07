# 🚀 Frontend Testing & Deployment Guide

## 📋 Quick Health Check

### Automatic Check (Recommended)
```powershell
cd frontend
.\health-check.ps1
```

Script ini akan otomatis:
- ✅ Cek dependencies
- ✅ Validasi environment variables
- ✅ Test koneksi ke backend
- ✅ Verifikasi file-file penting
- ✅ Build production bundle
- ✅ Run linter
- ✅ Cek Docker config

---

## 🧪 Manual Testing Commands

### 1. Install Dependencies
```powershell
cd frontend
npm install
```

### 2. Check Environment Variables
```powershell
# Cek apakah .env sudah benar
Get-Content .env
```

Isi file `.env` harus:
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Sleep Health KBS
```

### 3. Development Server
```powershell
# Start dev server (port 3000)
npm run dev

# Buka browser: http://localhost:3000
```

**Catatan**: Backend harus running di port 5000!

### 4. Build Production
```powershell
# Build untuk production
npm run build

# Check build size
(Get-ChildItem dist -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB

# Preview production build
npm run preview
```

### 5. Code Quality Check
```powershell
# Run ESLint
npm run lint

# Auto-fix linting issues
npx eslint . --ext js,jsx --fix
```

---

## 🐳 Docker Commands

### Single Container (Frontend Only)
```powershell
# Build Docker image
docker build -t sleep-health-frontend .

# Run container
docker run -d -p 3000:80 --name frontend sleep-health-frontend

# Check logs
docker logs frontend

# Stop & remove
docker stop frontend
docker rm frontend
```

### Full Stack dengan Docker Compose
```powershell
# Start semua services (Postgres, Neo4j, Backend, Frontend)
docker-compose up

# Start in background
docker-compose up -d

# Check logs
docker-compose logs -f frontend
docker-compose logs -f backend

# Stop all services
docker-compose down

# Rebuild & restart
docker-compose up --build
```

---

## 🌐 Testing Koneksi & API

### 1. Backend Health Check
```powershell
# Test backend API
Invoke-WebRequest -Uri "http://localhost:5000/health" -Method GET

# Expected response:
# StatusCode: 200
# Content: {"status":"healthy","timestamp":"..."}
```

### 2. Test Authentication Flow
```powershell
# Register user
$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

# Login
$loginBody = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginBody

$token = ($response.Content | ConvertFrom-Json).data.token
Write-Host "Token: $token"
```

### 3. Test Screening Endpoint
```powershell
# Test screening (dengan token)
$screeningData = @{
    Age = 30
    "Sleep Duration" = 6
    "Quality of Sleep" = 7
    "Stress Level" = 5
    "BMI Category" = "Normal"
    "Blood Pressure" = "120/80"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/screening/process" `
    -Method POST `
    -ContentType "application/json" `
    -Headers @{"Authorization"="Bearer $token"} `
    -Body $screeningData
```

---

## 🔍 Frontend Component Testing

### Test Pages Manually
1. **Login Page** - http://localhost:3000/login
2. **Register Page** - http://localhost:3000/register
3. **Dashboard** - http://localhost:3000/dashboard (need login)
4. **Screening Form** - http://localhost:3000/screening (need login)
5. **History** - http://localhost:3000/history (need login)
6. **Analytics** - http://localhost:3000/analytics (need login)

### Browser Console Checks
```javascript
// Check auth state (di browser console)
localStorage.getItem('token')

// Check API URL
import.meta.env.VITE_API_URL

// Test API connection
fetch('http://localhost:5000/health')
  .then(r => r.json())
  .then(d => console.log(d))
```

---

## 📦 Production Deployment

### Build Optimization
```powershell
# Production build dengan optimization
npm run build

# Check bundle analyzer (if installed)
npm run build -- --analyze
```

### Nginx Production Config
File `nginx.conf` sudah dikonfigurasi dengan:
- ✅ SPA routing (serve index.html untuk semua routes)
- ✅ Static asset caching (1 year)
- ✅ Gzip compression
- ✅ Security headers
- ✅ Health check endpoint (/health)

### Deploy ke Server

#### Option 1: Docker Deploy
```powershell
# Build production image
docker build -t sleep-health-frontend:latest .

# Save image untuk transfer
docker save sleep-health-frontend:latest | gzip > frontend.tar.gz

# Di server production:
docker load < frontend.tar.gz
docker run -d -p 80:80 --name frontend sleep-health-frontend:latest
```

#### Option 2: Static File Deploy
```powershell
# Build static files
npm run build

# Upload folder 'dist' ke server
# Gunakan nginx/apache untuk serve static files
```

### Environment Variables untuk Production
Update `.env` untuk production:
```env
VITE_API_URL=https://your-api-domain.com/api
VITE_APP_NAME=Sleep Health KBS
```

**IMPORTANT**: Rebuild setelah ganti env vars!
```powershell
npm run build
```

---

## 🔧 Troubleshooting

### Problem: Backend tidak terkoneksi
```powershell
# Check backend status
docker ps | Select-String backend

# Restart backend
docker-compose restart backend

# Check backend logs
docker-compose logs backend
```

### Problem: Build failed
```powershell
# Clear cache & rebuild
Remove-Item -Recurse -Force node_modules, dist
npm install
npm run build
```

### Problem: Port sudah digunakan
```powershell
# Check port 3000
Get-NetTCPConnection -LocalPort 3000

# Kill process
Stop-Process -Id <PID> -Force

# Atau ganti port di vite.config.js
```

### Problem: CORS errors
Pastikan backend CORS config include frontend URL:
```javascript
// backend/app.js
cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
})
```

---

## 📊 Performance Monitoring

### Build Size Check
```powershell
# Check total build size
(Get-ChildItem dist -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB

# Check individual chunks
Get-ChildItem dist/assets/*.js | Select-Object Name, @{N='Size(KB)';E={$_.Length/1KB}}
```

### Lighthouse Audit
```powershell
# Install lighthouse
npm install -g lighthouse

# Run audit
lighthouse http://localhost:3000 --view
```

---

## 🎯 Complete Test Checklist

### Pre-Deployment
- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] Build successful (no errors)
- [ ] Linting passed
- [ ] Backend connectivity verified
- [ ] Docker image builds successfully

### Manual Testing
- [ ] Login page works
- [ ] Register new user works
- [ ] Dashboard loads data
- [ ] Screening form submission works
- [ ] History page shows records
- [ ] Analytics charts render
- [ ] Logout works
- [ ] Auth redirect works (try accessing /dashboard without login)

### Production Ready
- [ ] Production build optimized
- [ ] Static assets cached
- [ ] Nginx config tested
- [ ] HTTPS configured (if applicable)
- [ ] Environment variables set for production
- [ ] Error logging configured

---

## 📝 Common Commands Cheatsheet

```powershell
# Development
npm run dev                  # Start dev server
npm run build               # Build production
npm run preview             # Preview production build
npm run lint                # Check code quality

# Docker
docker-compose up           # Start all services
docker-compose up -d        # Start in background
docker-compose down         # Stop all services
docker-compose logs -f      # Follow logs

# Health Check
.\health-check.ps1          # Run full health check

# Testing
Invoke-WebRequest http://localhost:3000
Invoke-WebRequest http://localhost:5000/health
```

---

**🎉 Frontend siap untuk development dan production deployment!**
