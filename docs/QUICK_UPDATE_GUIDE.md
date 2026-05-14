# Quick Update Guide 🚀

Now that auto-deployment is set up, here are **4 easy ways** to update your live Netlify site:

## Option 1: Super Simple (No message needed)
**Double-click:** `update.bat`
- Uses automatic timestamp message
- One click and done!

## Option 2: With Custom Message
**Windows:** `quick-deploy.bat "Your message"`
**PowerShell:** `.\quick-deploy.ps1 "Your message"`

Examples:
```bash
quick-deploy.bat "Updated survey questions"
quick-deploy.bat "Fixed typos"
quick-deploy.bat "Added new section"
```

## Option 3: Git Alias (Command Line)
```bash
git quickpush
```
- Uses default "Quick update" message
- Super fast for command line users

## Option 4: Traditional Git (Full control)
```bash
git add .
git commit -m "Your detailed message"
git push
```

## ⚡ Recommended Workflow:

1. **Make your changes** to any files
2. **Double-click `update.bat`** (easiest)
3. **Wait 1-2 minutes** for auto-deployment
4. **Check your live Netlify URL** to see changes

## 🎯 Pro Tips:

- **For quick fixes:** Use `update.bat`
- **For important changes:** Use `quick-deploy.bat "Descriptive message"`
- **All methods do the same thing:** Add, commit, and push your changes
- **Your live site updates automatically** within 1-2 minutes

## 🔧 Files You Can Edit:
- `index.html` - Main survey page
- `styles.css` - Styling and colors
- `script.js` - Survey functionality
- Any other files in the folder

Just edit, save, and run one of the update commands above! 