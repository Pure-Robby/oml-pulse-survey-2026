Write-Host "Deploying to Netlify..." -ForegroundColor Green

# Check if Netlify CLI is installed
try {
    netlify --version | Out-Null
    Write-Host "Netlify CLI found." -ForegroundColor Green
} catch {
    Write-Host "Netlify CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g netlify-cli
}

# Deploy to Netlify
Write-Host "Starting deployment..." -ForegroundColor Cyan
netlify deploy --prod --dir=.

Write-Host "Deployment complete!" -ForegroundColor Green
Read-Host "Press Enter to continue" 