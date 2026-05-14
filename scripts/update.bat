@echo off
echo 🚀 Updating your Netlify site...

git add .
git commit -m "Survey updated on %date% at %time%"
git push

echo.
echo ✅ Done! Your changes should be live in 1-2 minutes.
pause 