# ========================================
# COMMAND CHEATSHEET - RSBP Frontend
# ========================================
# Copy-paste commands untuk testing cepat

# === DEVELOPMENT ===

# Install & Start Dev Server
cd "d:\ATHA ITS\RSBP\RSBP FINAL\frontend"
npm install
npm run dev
# Buka: http://localhost:3000

# === PRODUCTION BUILD ===

# Build Production
npm run build
# Check size
(Get-ChildItem dist -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
# Preview
npm run preview

# === DOCKER ===

# Docker Build & Run (Frontend Only)
docker build -t sleep-health-frontend .
docker run -d -p 3000:80 --name frontend sleep-health-frontend
docker logs frontend

# Docker Full Stack
cd "d:\ATHA ITS\RSBP\RSBP FINAL"
docker-compose up
docker-compose up -d              # Background
docker-compose logs -f frontend   # Follow logs
docker-compose down               # Stop all

# === TESTING ===

# Quick Health Check
cd "d:\ATHA ITS\RSBP\RSBP FINAL\frontend"
.\health-check.ps1

# Interactive Menu
.\start.ps1

# Test Backend Connection
Invoke-WebRequest -Uri "http://localhost:5000/health" -Method GET

# Test API Login
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body $body

# === LINTING & CODE QUALITY ===

# Run Linter
npm run lint

# Auto-fix issues
npm run lint:fix

# === DEBUGGING ===

# Check Port Usage
Get-NetTCPConnection -LocalPort 3000
Get-NetTCPConnection -LocalPort 5000

# Kill Process on Port
$processId = (Get-NetTCPConnection -LocalPort 3000).OwningProcess
Stop-Process -Id $processId -Force

# Clear Cache & Reinstall
Remove-Item -Recurse -Force node_modules, dist
npm install

# === DOCKER COMMANDS ===

# List Containers
docker ps -a

# Stop Container
docker stop frontend

# Remove Container
docker rm frontend

# View Logs
docker logs frontend
docker logs -f frontend  # Follow

# Execute Command in Container
docker exec -it frontend sh

# Remove All Stopped Containers
docker container prune

# Remove Unused Images
docker image prune -a

# === DOCKER COMPOSE ===

# Start Services
docker-compose up postgres neo4j backend frontend

# Start Specific Service
docker-compose up backend

# Rebuild & Start
docker-compose up --build

# Stop All
docker-compose down

# Remove Volumes
docker-compose down -v

# === MONITORING ===

# Check Frontend Size
Get-ChildItem dist -Recurse | Select-Object Name, @{N='Size(KB)';E={$_.Length/1KB}}

# Check Dependencies Size
(Get-ChildItem node_modules -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB

# Check Running Processes
Get-Process | Where-Object {$_.ProcessName -like "*node*"}

# === PRODUCTION DEPLOYMENT ===

# Build for Production
$env:NODE_ENV="production"
npm run build

# Test Production Build Locally
npm run preview

# Export Docker Image
docker save sleep-health-frontend:latest | gzip > frontend.tar.gz

# Load Docker Image (on server)
docker load < frontend.tar.gz

# === URLs ===

# Local Development
# Frontend:        http://localhost:3000
# Backend API:     http://localhost:5000/api
# Backend Health:  http://localhost:5000/health
# Neo4j Browser:   http://localhost:7474
# PostgreSQL:      localhost:5432

# === ENVIRONMENT VARIABLES ===

# Check Current Environment
Get-Content .env

# Create .env
@"
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Sleep Health KBS
"@ | Out-File -FilePath ".env" -Encoding UTF8

# === TROUBLESHOOTING ===

# Backend not responding?
cd "d:\ATHA ITS\RSBP\RSBP FINAL\backend"
npm run dev

# Database not ready?
docker-compose up postgres neo4j

# Port conflict?
Get-NetTCPConnection -LocalPort 3000 | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force
}

# CORS error?
# Check backend cors config in backend/app.js

# Build error?
Remove-Item -Recurse -Force node_modules, dist, .vite
npm install
npm run build

# === QUICK HEALTH CHECK (One-liner) ===

# Check All Services
@("http://localhost:3000", "http://localhost:5000/health", "http://localhost:7474", "http://localhost:5432") | ForEach-Object {
    try {
        $response = Invoke-WebRequest $_ -TimeoutSec 2
        Write-Host "[OK] $_" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] $_" -ForegroundColor Red
    }
}

# === USEFUL ALIASES (Add to PowerShell Profile) ===

# function fe-dev { cd "d:\ATHA ITS\RSBP\RSBP FINAL\frontend"; npm run dev }
# function fe-build { cd "d:\ATHA ITS\RSBP\RSBP FINAL\frontend"; npm run build }
# function fe-test { cd "d:\ATHA ITS\RSBP\RSBP FINAL\frontend"; .\health-check.ps1 }
# function fe-start { cd "d:\ATHA ITS\RSBP\RSBP FINAL\frontend"; .\start.ps1 }
# function full-start { cd "d:\ATHA ITS\RSBP\RSBP FINAL"; docker-compose up }

# ========================================
# Copy command yang diperlukan dan jalankan!
# ========================================
