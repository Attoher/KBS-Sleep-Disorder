# Frontend Health Check & Testing Script
# Pastikan backend sudah running di localhost:5000

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Frontend Health Check Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
Write-Host "[1/7] Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "  [OK] Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Dependencies not found. Running npm install..." -ForegroundColor Red
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] Dependencies installed successfully" -ForegroundColor Green
    } else {
        Write-Host "  [ERROR] Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Check .env file
Write-Host ""
Write-Host "[2/7] Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "  [OK] .env file exists" -ForegroundColor Green
    Get-Content ".env" | ForEach-Object {
        Write-Host "    $_" -ForegroundColor Gray
    }
} else {
    Write-Host "  [ERROR] .env file not found!" -ForegroundColor Red
    Write-Host "    Creating default .env..." -ForegroundColor Yellow
    "VITE_API_URL=http://localhost:5000/api" | Out-File -FilePath ".env" -Encoding UTF8 -NoNewline
    "VITE_APP_NAME=Sleep Health KBS" | Out-File -FilePath ".env" -Encoding UTF8 -Append
    Write-Host "  [OK] .env file created" -ForegroundColor Green
}

# Check backend connectivity
Write-Host ""
Write-Host "[3/7] Checking backend connectivity..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "  [OK] Backend is running and healthy" -ForegroundColor Green
        $content = $response.Content | ConvertFrom-Json
        Write-Host "    Status: $($content.status)" -ForegroundColor Gray
    }
} catch {
    Write-Host "  [ERROR] Backend is not responding!" -ForegroundColor Red
    Write-Host "    Make sure backend is running: cd backend ; npm run dev" -ForegroundColor Yellow
    Write-Host "    Or start with Docker: docker-compose up" -ForegroundColor Yellow
}

# Check key source files
Write-Host ""
Write-Host "[4/7] Checking critical files..." -ForegroundColor Yellow
$criticalFiles = @(
    "src/App.jsx",
    "src/main.jsx",
    "src/utils/api.js",
    "src/contexts/AuthContext.jsx",
    "src/store/useAuthStore.js",
    "vite.config.js",
    "index.html"
)

$allFilesExist = $true
foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "  [OK] $file" -ForegroundColor Green
    } else {
        Write-Host "  [ERROR] $file MISSING!" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "  [WARNING] Some critical files are missing!" -ForegroundColor Red
    exit 1
}

# Check for build errors
Write-Host ""
Write-Host "[5/7] Testing build process..." -ForegroundColor Yellow
$buildOutput = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] Build successful!" -ForegroundColor Green
    if (Test-Path "dist") {
        $distSize = (Get-ChildItem dist -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host "    Build size: $([math]::Round($distSize, 2)) MB" -ForegroundColor Gray
    }
} else {
    Write-Host "  [ERROR] Build failed!" -ForegroundColor Red
    Write-Host $buildOutput -ForegroundColor Red
    exit 1
}

# Check for linting errors
Write-Host ""
Write-Host "[6/7] Running linter..." -ForegroundColor Yellow
$lintOutput = npm run lint 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] No linting errors" -ForegroundColor Green
} else {
    Write-Host "  [WARNING] Linting warnings/errors found:" -ForegroundColor Yellow
    Write-Host $lintOutput -ForegroundColor Gray
}

# Docker build check
Write-Host ""
Write-Host "[7/7] Checking Docker configuration..." -ForegroundColor Yellow
if (Test-Path "Dockerfile") {
    Write-Host "  [OK] Dockerfile exists" -ForegroundColor Green
}
if (Test-Path "nginx.conf") {
    Write-Host "  [OK] nginx.conf exists" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] nginx.conf missing (required for production)" -ForegroundColor Red
}

# Summary
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Health Check Complete!" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Development Commands:" -ForegroundColor Yellow
Write-Host "  npm run dev          - Start development server (port 3000)" -ForegroundColor White
Write-Host "  npm run build        - Build for production" -ForegroundColor White
Write-Host "  npm run preview      - Preview production build" -ForegroundColor White
Write-Host "  npm run lint         - Check code quality" -ForegroundColor White
Write-Host ""
Write-Host "Docker Commands:" -ForegroundColor Yellow
Write-Host "  docker build -t sleep-health-frontend ." -ForegroundColor White
Write-Host "  docker run -p 3000:80 sleep-health-frontend" -ForegroundColor White
Write-Host ""
Write-Host "Full Stack:" -ForegroundColor Yellow
Write-Host "  docker-compose up    - Start all services" -ForegroundColor White
Write-Host ""
