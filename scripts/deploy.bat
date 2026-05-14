@echo off
echo Deploying to Netlify...

REM Check if Netlify CLI is installed
netlify --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Netlify CLI not found. Installing...
    npm install -g netlify-cli
)

REM Deploy to Netlify
netlify deploy --prod --dir=.

echo Deployment complete!
pause 