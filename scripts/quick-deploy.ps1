param(
    [Parameter(Mandatory=$true)]
    [string]$Message
)

Write-Host "🚀 Quick Deploy to Netlify" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

Write-Host "Adding all changes..." -ForegroundColor Yellow
git add .

Write-Host "Committing with message: $Message" -ForegroundColor Yellow
git commit -m $Message

Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push

Write-Host ""
Write-Host "✅ Deployment complete! Your changes should be live in 1-2 minutes." -ForegroundColor Green
Write-Host "Check your Netlify URL to see the updates." -ForegroundColor Green

Read-Host "Press Enter to continue" 