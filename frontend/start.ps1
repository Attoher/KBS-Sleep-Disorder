# ========================================
# Frontend Quick Start & Testing Script
# ========================================

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  RSBP Frontend Quick Start" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Display menu
Write-Host "Pilih operasi yang ingin dilakukan:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  [1] Install Dependencies" -ForegroundColor White
Write-Host "  [2] Start Development Server (Port 3000)" -ForegroundColor White
Write-Host "  [3] Build Production" -ForegroundColor White
Write-Host "  [4] Preview Production Build" -ForegroundColor White
Write-Host "  [5] Run Health Check" -ForegroundColor White
Write-Host "  [6] Test Backend Connection" -ForegroundColor White
Write-Host "  [7] Docker Build & Run" -ForegroundColor White
Write-Host "  [8] Full System Check" -ForegroundColor White
Write-Host "  [9] Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Masukkan pilihan (1-9)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "[INSTALL] Installing dependencies..." -ForegroundColor Cyan
        npm install
        Write-Host ""
        Write-Host "[DONE] Dependencies installed!" -ForegroundColor Green
    }
    
    "2" {
        Write-Host ""
        Write-Host "[DEV] Starting development server..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Frontend akan berjalan di: http://localhost:3000" -ForegroundColor Green
        Write-Host "Pastikan backend running di: http://localhost:5000" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Tekan Ctrl+C untuk stop server" -ForegroundColor Gray
        Write-Host ""
        npm run dev
    }
    
    "3" {
        Write-Host ""
        Write-Host "[BUILD] Building production bundle..." -ForegroundColor Cyan
        npm run build
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "[SUCCESS] Build completed!" -ForegroundColor Green
            
            if (Test-Path "dist") {
                $size = (Get-ChildItem dist -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
                Write-Host "Build size: $([math]::Round($size, 2)) MB" -ForegroundColor Cyan
                Write-Host ""
                Write-Host "Output location: dist/" -ForegroundColor Gray
            }
        } else {
            Write-Host ""
            Write-Host "[ERROR] Build failed!" -ForegroundColor Red
        }
    }
    
    "4" {
        Write-Host ""
        Write-Host "[PREVIEW] Starting preview server..." -ForegroundColor Cyan
        
        if (!(Test-Path "dist")) {
            Write-Host ""
            Write-Host "[ERROR] Build not found! Run build first (option 3)" -ForegroundColor Red
        } else {
            Write-Host ""
            Write-Host "Preview server: http://localhost:4173" -ForegroundColor Green
            Write-Host "Tekan Ctrl+C untuk stop" -ForegroundColor Gray
            Write-Host ""
            npm run preview
        }
    }
    
    "5" {
        Write-Host ""
        Write-Host "[HEALTH CHECK] Running comprehensive check..." -ForegroundColor Cyan
        Write-Host ""
        .\health-check.ps1
    }
    
    "6" {
        Write-Host ""
        Write-Host "[TEST] Testing backend connection..." -ForegroundColor Cyan
        Write-Host ""
        
        try {
            Write-Host "Connecting to http://localhost:5000/health..." -ForegroundColor Gray
            $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -Method GET -TimeoutSec 5
            
            if ($response.StatusCode -eq 200) {
                Write-Host "[OK] Backend is responding!" -ForegroundColor Green
                $data = $response.Content | ConvertFrom-Json
                Write-Host ""
                Write-Host "Response:" -ForegroundColor Cyan
                $data | ConvertTo-Json | Write-Host -ForegroundColor Gray
                Write-Host ""
                Write-Host "[SUCCESS] Backend connection OK!" -ForegroundColor Green
            }
        } catch {
            Write-Host "[ERROR] Backend not responding!" -ForegroundColor Red
            Write-Host ""
            Write-Host "Pastikan backend sudah running:" -ForegroundColor Yellow
            Write-Host "  cd backend" -ForegroundColor White
            Write-Host "  npm run dev" -ForegroundColor White
            Write-Host ""
            Write-Host "Atau jalankan dengan Docker:" -ForegroundColor Yellow
            Write-Host "  docker-compose up" -ForegroundColor White
        }
    }
    
    "7" {
        Write-Host ""
        Write-Host "[DOCKER] Building and running Docker container..." -ForegroundColor Cyan
        Write-Host ""
        
        # Build image
        Write-Host "[1/3] Building Docker image..." -ForegroundColor Yellow
        docker build -t sleep-health-frontend .
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] Image built successfully!" -ForegroundColor Green
            Write-Host ""
            
            # Stop existing container
            Write-Host "[2/3] Checking for existing container..." -ForegroundColor Yellow
            $existing = docker ps -a --filter "name=frontend" --format "{{.Names}}"
            if ($existing -eq "frontend") {
                Write-Host "Removing existing container..." -ForegroundColor Gray
                docker stop frontend | Out-Null
                docker rm frontend | Out-Null
            }
            
            # Run container
            Write-Host "[3/3] Starting container..." -ForegroundColor Yellow
            docker run -d -p 3000:80 --name frontend sleep-health-frontend
            
            Write-Host ""
            Write-Host "[SUCCESS] Container started!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Frontend URL: http://localhost:3000" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "Commands:" -ForegroundColor Yellow
            Write-Host "  docker logs frontend         - View logs" -ForegroundColor White
            Write-Host "  docker stop frontend         - Stop container" -ForegroundColor White
            Write-Host "  docker rm frontend           - Remove container" -ForegroundColor White
        } else {
            Write-Host "[ERROR] Docker build failed!" -ForegroundColor Red
        }
    }
    
    "8" {
        Write-Host ""
        Write-Host "[FULL CHECK] Running complete system check..." -ForegroundColor Cyan
        Write-Host ""
        
        # 1. Dependencies
        Write-Host "[1/5] Checking dependencies..." -ForegroundColor Yellow
        if (Test-Path "node_modules") {
            Write-Host "  [OK] Dependencies installed" -ForegroundColor Green
        } else {
            Write-Host "  [WARN] Dependencies missing" -ForegroundColor Yellow
            $install = Read-Host "Install now? (y/n)"
            if ($install -eq "y") {
                npm install
            }
        }
        
        # 2. Environment
        Write-Host ""
        Write-Host "[2/5] Checking environment..." -ForegroundColor Yellow
        if (Test-Path ".env") {
            Write-Host "  [OK] .env file exists" -ForegroundColor Green
            Get-Content ".env" | ForEach-Object {
                Write-Host "    $_" -ForegroundColor Gray
            }
        } else {
            Write-Host "  [ERROR] .env file missing!" -ForegroundColor Red
        }
        
        # 3. Backend
        Write-Host ""
        Write-Host "[3/5] Testing backend..." -ForegroundColor Yellow
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -Method GET -TimeoutSec 3
            Write-Host "  [OK] Backend responding" -ForegroundColor Green
        } catch {
            Write-Host "  [ERROR] Backend not responding" -ForegroundColor Red
        }
        
        # 4. Build
        Write-Host ""
        Write-Host "[4/5] Testing build..." -ForegroundColor Yellow
        $buildTest = npm run build 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] Build successful" -ForegroundColor Green
        } else {
            Write-Host "  [ERROR] Build failed" -ForegroundColor Red
        }
        
        # 5. Docker
        Write-Host ""
        Write-Host "[5/5] Checking Docker setup..." -ForegroundColor Yellow
        if ((Test-Path "Dockerfile") -and (Test-Path "nginx.conf")) {
            Write-Host "  [OK] Docker config complete" -ForegroundColor Green
        } else {
            Write-Host "  [WARN] Docker config incomplete" -ForegroundColor Yellow
        }
        
        Write-Host ""
        Write-Host "=====================================" -ForegroundColor Cyan
        Write-Host "  System Check Complete!" -ForegroundColor Cyan
        Write-Host "=====================================" -ForegroundColor Cyan
    }
    
    "9" {
        Write-Host ""
        Write-Host "Bye!" -ForegroundColor Cyan
        exit
    }
    
    default {
        Write-Host ""
        Write-Host "[ERROR] Invalid choice!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
