@echo off
if "%~1"=="" (
    echo Usage: quick-deploy.bat "Your commit message"
    echo Example: quick-deploy.bat "Updated survey questions"
    pause
    exit /b 1
)

echo Adding all changes...
git add .

echo Committing with message: %1
git commit -m %1

echo Pushing to GitHub...
git push

echo.
echo ✅ Deployment complete! Your changes should be live in 1-2 minutes.
echo Check your Netlify URL to see the updates.
pause 