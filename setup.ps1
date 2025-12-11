# Sleep Health KBS - Setup Script for Windows PowerShell
# Run: .\setup.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Sleep Health KBS - Setup Script" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node -v
$npmVersion = npm -v

if ($nodeVersion -and $npmVersion) {
    Write-Host "✓ Node.js $nodeVersion found" -ForegroundColor Green
    Write-Host "✓ npm $npmVersion found" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js is not installed. Please install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Install Frontend Dependencies
Write-Host "Installing Frontend Dependencies..." -ForegroundColor Yellow
Push-Location "frontend"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Frontend installation failed" -ForegroundColor Red
    Pop-Location
    exit 1
}
Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
Pop-Location

Write-Host ""

# Install Backend Dependencies
Write-Host "Installing Backend Dependencies..." -ForegroundColor Yellow
Push-Location "backend"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Backend installation failed" -ForegroundColor Red
    Pop-Location
    exit 1
}
Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
Pop-Location

Write-Host ""

# Check for .env files
Write-Host "Checking environment files..." -ForegroundColor Yellow

if (-not (Test-Path "frontend\.env")) {
    Write-Host "Creating frontend\.env..." -ForegroundColor Yellow
    @"
VITE_API_URL=http://localhost:5000/api
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_NAME=Sleep Health KBS
"@ | Out-File -FilePath "frontend\.env" -Encoding UTF8
    Write-Host "✓ frontend\.env created" -ForegroundColor Green
} else {
    Write-Host "✓ frontend\.env already exists" -ForegroundColor Green
}

if (-not (Test-Path "backend\.env")) {
    Write-Host "Creating backend\.env..." -ForegroundColor Yellow
    @"
# Server Configuration
PORT=5000
JWT_SECRET=sleep_kbs_secret_dev_key_2024_min_32

# PostgreSQL (optional - use ALLOW_OFFLINE=true to skip)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sleep_health_db
DB_USER=kbs_user
DB_PASSWORD=kbsPassword123

# Neo4j Configuration (Aura)
NEO4J_URI=neo4j+s://1ddeb3bf.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=BoX-qrO5bDDHAb5OwY45GsRfVSb_Sz1OfvGqNVnzLi4
NEO4J_DATABASE=neo4j

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Feature Flags
DEMO_MODE=false
ALLOW_OFFLINE=true
"@ | Out-File -FilePath "backend\.env" -Encoding UTF8
    Write-Host "✓ backend\.env created with Neo4j Aura credentials" -ForegroundColor Green
} else {
    Write-Host "✓ backend\.env already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Start Backend Server (in a new terminal):" -ForegroundColor Cyan
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "2. Start Frontend Dev Server (in another terminal):" -ForegroundColor Cyan
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "3. Open in Browser:" -ForegroundColor Cyan
Write-Host "   http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Project Structure:" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "  API:      http://localhost:5000/api" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
