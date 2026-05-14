@echo off
echo 👥 Team Member Setup Script
echo ============================

echo.
echo This script will help set up Git for collaboration.
echo.

set /p username="Enter your GitHub username: "
set /p email="Enter your GitHub email: "

echo.
echo Setting up Git configuration...
git config user.name "%username%"
git config user.email "%email%"

echo.
echo Creating quick deployment alias...
git config alias.quickpush "!git add . && git commit -m 'Quick update' && git push"

echo.
echo ✅ Setup complete! 
echo.
echo Your Git is now configured for:
echo   Name: %username%
echo   Email: %email%
echo.
echo You can now use:
echo   - update.bat (one-click deploy)
echo   - quick-deploy.bat "message" (with custom message)
echo   - git quickpush (command line)
echo.
echo Remember to always run 'git pull' before making changes!
echo.
pause 