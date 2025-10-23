# PowerShell script to start the development server
# This fixes the PowerShell && operator issue

Write-Host "🚀 Starting Proof of Dev Wave 3 Development Server..." -ForegroundColor Green

# Change to the proof-of-dev directory
Set-Location "moca_moca\proof-of-dev"

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the MOCA directory." -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  Warning: .env.local not found. Please create it from env.example" -ForegroundColor Yellow
    Write-Host "Run: npm run setup" -ForegroundColor Cyan
}

# Start the development server
Write-Host "🌐 Starting development server on http://localhost:3000..." -ForegroundColor Green
npm run dev
