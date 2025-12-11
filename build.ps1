# Sleep Health KBS - Production Build Script
# Run: .\build.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Sleep Health KBS - Production Build" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "frontend\node_modules") -or -not (Test-Path "backend\node_modules")) {
    Write-Host "Dependencies not found. Installing..." -ForegroundColor Yellow
    .\setup.ps1
}

Write-Host "Building Frontend..." -ForegroundColor Yellow
Push-Location "frontend"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Frontend build failed" -ForegroundColor Red
    Pop-Location
    exit 1
}
Write-Host "✓ Frontend build successful" -ForegroundColor Green
Pop-Location

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Build Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Output Location: ./frontend/dist" -ForegroundColor Cyan
Write-Host ""
Write-Host "To deploy:" -ForegroundColor Yellow
Write-Host "1. Push to GitHub: git push origin main" -ForegroundColor White
Write-Host "2. Connect to Vercel: https://vercel.com/new" -ForegroundColor White
Write-Host "3. Select KBS-Sleep-Disorder repository" -ForegroundColor White
Write-Host "4. Set environment variables (see .env.example)" -ForegroundColor White
Write-Host "5. Deploy!" -ForegroundColor White
Write-Host ""
