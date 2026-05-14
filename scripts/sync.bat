@echo off
echo 🔄 Syncing with latest changes...

git pull

if %errorlevel% equ 0 (
    echo.
    echo ✅ Sync successful! You're up to date.
    echo You can now safely make your changes.
) else (
    echo.
    echo ⚠️ Sync had issues. Please check for conflicts.
    echo You may need to resolve merge conflicts before continuing.
)

echo.
pause 