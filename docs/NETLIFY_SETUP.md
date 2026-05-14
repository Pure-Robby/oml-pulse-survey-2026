# Netlify Auto-Publishing Setup Guide

## Quick Setup Options

### Option 1: Netlify Drop (Immediate Deployment)
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag and drop your entire project folder
3. Get a live URL instantly
4. **Note**: This is manual deployment, not auto-publishing

### Option 2: Git-based Auto-Publishing (Recommended)

#### Step 1: Create a Git Repository
1. Create a new repository on GitHub/GitLab/Bitbucket
2. Initialize Git in your project folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin YOUR_REPOSITORY_URL
   git push -u origin main
   ```

#### Step 2: Connect to Netlify
1. Go to [app.netlify.com](https://app.netlify.com)
2. Click "New site from Git"
3. Choose your Git provider (GitHub, GitLab, etc.)
4. Select your repository
5. Configure build settings:
   - **Build command**: Leave empty (static site)
   - **Publish directory**: `.` (current directory)
6. Click "Deploy site"

#### Step 3: Auto-Publishing Setup
- Every time you push changes to your Git repository, Netlify will automatically deploy
- You can also set up branch deployments for previews

### Option 3: Using Netlify CLI (Local Deployment)

#### Install Netlify CLI
```bash
npm install -g netlify-cli
```

#### Deploy Using Scripts
- **Windows**: Run `deploy.bat`
- **PowerShell**: Run `deploy.ps1`
- **Manual**: Run `netlify deploy --prod --dir=.`

## Configuration Files

### netlify.toml
This file configures your Netlify deployment:
- Sets the publish directory to current folder
- Configures redirects for SPA routing
- Sets Node.js version

### Custom Domain (Optional)
1. In Netlify dashboard, go to Site settings > Domain management
2. Add your custom domain
3. Follow DNS configuration instructions

## Auto-Publishing Workflow

### For Git-based deployment:
1. Make changes to your files
2. Commit and push to Git:
   ```bash
   git add .
   git commit -m "Update survey"
   git push
   ```
3. Netlify automatically detects changes and deploys
4. Your live URL updates within 1-2 minutes

### For CLI-based deployment:
1. Make changes to your files
2. Run the deployment script
3. Get instant deployment

## Benefits of Auto-Publishing
- ✅ Instant updates to live site
- ✅ Version control and rollback capability
- ✅ Preview deployments for testing
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Form handling (if needed)

## Troubleshooting

### Common Issues:
1. **Build fails**: Check `netlify.toml` configuration
2. **Files not updating**: Clear browser cache or check Git push
3. **CLI not found**: Install with `npm install -g netlify-cli`

### Support:
- Netlify Docs: [docs.netlify.com](https://docs.netlify.com)
- Community: [community.netlify.com](https://community.netlify.com) 