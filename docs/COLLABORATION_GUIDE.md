# Team Collaboration Guide 🤝

## Setting Up Collaboration

### Option 1: Add as GitHub Collaborator (Recommended)

#### For You (Project Owner):
1. Go to your GitHub repository: `https://github.com/bertmert/pulse-culture-survey`
2. Click **Settings** (top menu)
3. Click **Collaborators** (left sidebar) 
4. Click **Add people**
5. Enter their GitHub username or email
6. Send the invitation

#### For Your Collaborator:
1. Accept the GitHub invitation email
2. Clone the repository to their computer:
   ```bash
   git clone https://github.com/bertmert/pulse-culture-survey.git
   cd pulse-culture-survey
   ```
3. They can now edit and deploy just like you!

### Option 2: Fork & Pull Request Workflow

#### For Your Collaborator:
1. Go to `https://github.com/bertmert/pulse-culture-survey`
2. Click **Fork** (top right)
3. Clone their fork:
   ```bash
   git clone https://github.com/THEIR-USERNAME/pulse-culture-survey.git
   ```
4. Make changes and submit pull requests

## 👥 **Team Workflow Best Practices**

### Before Making Changes:
```bash
# Always pull latest changes first
git pull

# Check what branch you're on
git branch
```

### Making Changes:
```bash
# Option A: Work on main branch (simple)
# Make your changes, then:
git add .
git commit -m "Describe your changes"
git push

# Option B: Use feature branches (recommended for bigger changes)
git checkout -b feature/survey-improvements
# Make changes
git add .
git commit -m "Added new question section"
git push -u origin feature/survey-improvements
```

### Handling Conflicts:
If both people edit the same file:
1. Git will show merge conflicts
2. Open the conflicted files
3. Look for `<<<<<<< HEAD` and `>>>>>>> branch-name`
4. Choose which version to keep
5. Remove the conflict markers
6. Commit the resolved changes

## 🚀 **Quick Deploy Scripts for Team**

Both team members can use the same quick deploy scripts:

### For Quick Updates:
- **Double-click:** `update.bat` 
- **With message:** `quick-deploy.bat "Your message"`
- **Command line:** `git quickpush`

### Team Communication:
Use descriptive commit messages so everyone knows what changed:
```bash
quick-deploy.bat "Updated question 5 wording"
quick-deploy.bat "Fixed mobile responsive issues"
quick-deploy.bat "Added new risk culture questions"
```

## 📂 **File Organization Tips**

### Who Works on What:
- **HTML Structure:** `index.html`
- **Styling/Colors:** `styles.css` 
- **Functionality:** `script.js`
- **Content/Questions:** Usually in `index.html`

### Avoiding Conflicts:
- **Communicate** who's working on what
- **Pull changes** before starting work
- **Make small, frequent commits**
- **Use descriptive commit messages**

## 🔄 **Netlify Auto-Deployment for Team**

The auto-deployment works for **everyone with access**:
- Any team member pushes → Netlify deploys automatically
- Both can see changes live within 1-2 minutes
- Deployment history shows who made what changes

## 🎯 **Recommended Team Workflow:**

### Daily Routine:
1. **Start:** `git pull` (get latest changes)
2. **Work:** Make your changes
3. **Test:** Check locally that everything works
4. **Deploy:** Use `update.bat` or `quick-deploy.bat "message"`
5. **Communicate:** Let teammate know what you changed

### For Bigger Changes:
1. Create a feature branch
2. Make changes
3. Test thoroughly  
4. Push branch and create pull request
5. Review together before merging

## 🚨 **Emergency Recovery**

If something breaks:
1. **Check Netlify deploy log** for errors
2. **Revert to previous version:**
   ```bash
   git log --oneline  # See recent commits
   git revert COMMIT-HASH  # Undo specific commit
   git push  # Deploy the fix
   ```

## 📞 **Communication Tools**

Consider using:
- **GitHub Issues** for tracking tasks
- **Slack/Teams** for daily communication  
- **Comments in code** for complex changes
- **Pull Request descriptions** for major updates

## ✅ **Quick Setup Checklist**

For the new team member:
- [ ] GitHub account created
- [ ] Added as collaborator (or forked repo)
- [ ] Repository cloned to their computer
- [ ] Git configured with their name/email
- [ ] Can successfully run `update.bat`
- [ ] Tested making a small change and deploying
- [ ] Has access to live Netlify URL

Both team members should have the same quick-deploy scripts and can update the live site instantly! 