# Sleep Health KBS - Development Server Launcher
# Run: .\run-dev.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Sleep Health KBS - Development Mode" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "backend\node_modules")) {
    Write-Host "Backend dependencies not found. Running setup..." -ForegroundColor Yellow
    .\setup.ps1
}

if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "Frontend dependencies not found. Running setup..." -ForegroundColor Yellow
    .\setup.ps1
}

Write-Host "Starting development servers..." -ForegroundColor Yellow
Write-Host ""

# Start Backend in background
Write-Host "Starting Backend on port 5000..." -ForegroundColor Cyan
$backendProcess = Start-Process `
    -FilePath "powershell" `
    -ArgumentList "-NoExit", "-Command", "cd backend; `$env:ALLOW_OFFLINE='true'; npm run dev" `
    -PassThru

Start-Sleep -Seconds 2

# Start Frontend in background
Write-Host "Starting Frontend on port 5173..." -ForegroundColor Cyan
$frontendProcess = Start-Process `
    -FilePath "powershell" `
    -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" `
    -PassThru

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ Both servers are running!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "API:      http://localhost:5000/api" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend PID: $($backendProcess.Id)" -ForegroundColor Gray
Write-Host "Frontend PID: $($frontendProcess.Id)" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C in either terminal to stop the servers" -ForegroundColor Yellow
Write-Host ""

# Wait for processes
Wait-Process -Id $backendProcess.Id
