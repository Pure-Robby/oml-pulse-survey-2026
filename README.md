# Pulse Survey Admin Dashboard

## 🤖 **AI CONTEXT - READ FIRST**

**CRITICAL PROJECT INFORMATION FOR AI ASSISTANTS:**

### **Environment & Technology Stack**
- **Project Type**: Static HTML/CSS/JavaScript frontend application
- **No Backend**: No Python, Node.js, or server-side code
- **Environment**: Windows PowerShell (no `&&` syntax support)
- **Deployment**: Netlify static hosting
- **No Build Process**: Direct file editing and browser testing

### **Key Conventions & Rules**
- **Command Syntax**: Use PowerShell syntax (`;` for chaining, not `&&`)
- **No Python Server**: Don't suggest `python -m http.server` or similar
- **Direct Browser Testing**: Open `index.html` directly in browser
- **File Structure**: All files in root directory, no complex folder structure
- **CSS Grid**: Uses CSS Grid for responsive layouts with auto-resizing

### **Current Implementation Details**
- **Scoring System**: Pulse Score uses 1-6 scale (not percentages)
- **Hidden Elements**: Flight Risk card and Settings/Users menu items are hidden
- **Grid Layout**: 4-column grid with 3 visible cards (auto-resizes)
- **Survey Integration**: Opens in new window, not iframe
- **Survey Dimensions**: Employee Engagement (6 questions, 6-point scale) and Change Readiness (6 questions, 5-point scale)
- **Hidden Dimensions**: Risk Culture is configured but inactive (can be reactivated in config.js)

### **Common Gotchas**
- Don't suggest Python/Node.js solutions
- Don't use `&&` in commands
- Don't assume server-side functionality
- Remember the 1-6 scale conversion for Pulse Score
- Flight Risk card is intentionally hidden

---
#### Run to serve
"npx http-server -p 8080 -o"

## 🚀 **New Application Structure**

This application has been restructured with the **Admin Dashboard as the main application**, with the **Survey** opened from the header as a linked page (typically `survey/index.html` in a new tab).

## 📁 **File Structure**

```
FrontEnd/
├── index.html             # Main dashboard entry point
├── app.js                 # Dashboard functionality
├── data.js                # Dashboard data
├── styles.css             # Dashboard styles
├── survey/                # Survey application
│   ├── index.html         # Survey interface
│   ├── script.js          # Survey functionality
│   └── styles.css         # Survey styles
├── images/                # Dashboard assets
├── assets/                # Survey assets
└── scripts/               # Deployment scripts
```

## 🎯 **How to Use**

### **Starting the Application**
1. Open `index.html` directly in your browser
2. No server required - static frontend application
3. Admin Dashboard loads immediately

### **Navigation**
- **Overview**: Main dashboard with metrics and analytics
- **Reports**: Detailed reports section (placeholder)
- **Settings**: Configuration section (hidden)
- **Users**: User management section (hidden)
- **Open Survey**: Header link to open the survey in a new tab

### **Survey Access**
- Use the **Open Survey** link in the header (opens `survey/index.html` in a new tab)
- Use browser controls to return to the dashboard

## 🔧 **Development**

### **Environment Setup**
- **No build tools required**
- **No package managers needed**
- **Direct file editing**
- **Browser-based testing**

### **Adding New Admin Sections**
1. Add new tab in `index.html`:
   ```html
   <li class="nav-tab" data-section="newsection">
       <i class="material-icons">icon_name</i>
       Section Name
   </li>
   ```

2. Add corresponding content section:
   ```html
   <section id="newsection" class="content-section">
       <div class="section-header">
           <h1>Section Name</h1>
       </div>
       <!-- Your content here -->
   </section>
   ```

3. The JavaScript will automatically handle the navigation

### **Styling**
- Main styles: `styles.css`
- Survey styles: `survey/styles.css`
- Both use consistent design tokens and colors

## 🎨 **Design System**

### **Colors**
- Primary: `#009677` (Green)
- Secondary: `#FFB800` (Yellow)
- Danger: `#FF4B4B` (Red)
- Text: `#282828` (Dark Gray)

### **Typography**
- Font: Montserrat
- Icons: Material Icons

### **Scoring System**
- **Pulse Score**: 1-6 scale (not percentages)
- **Conversion**: 73% = 4.38 out of 6
- **Display**: 2 decimal places maximum
- **Visual**: Progress circles show 1-6 scale

## 📱 **Responsive Design**
- Mobile-first approach
- Responsive navigation tabs
- Adaptive layouts for all screen sizes
- CSS Grid auto-resizing for metric cards

## 🚀 **Future Enhancements**
- Add more admin sections (Reports, Settings, Users)
- Implement user authentication
- Add data export functionality
- Real-time data updates
- Advanced filtering and search

## 🌐 **Live Site**
- **Netlify**: https://superlative-frangollo-4b3076.netlify.app/
- **Auto-deployment**: Changes pushed to GitHub appear live within 1-2 minutes

## 📖 **Documentation**
- **Team Setup:** `docs/COLLABORATION_GUIDE.md`
- **Deployment Help:** `docs/QUICK_UPDATE_GUIDE.md`
- **Netlify Setup:** `docs/NETLIFY_SETUP.md`

## ⚡ **Quick Actions**

```powershell
# Update live site (simple)
.\UPDATE.bat

# Update with message
.\DEPLOY.bat "Fixed question 5 typo"

# Sync with team changes
.\scripts\sync.bat

# Setup new team member
.\scripts\team-setup.bat
```

---

**Repository:** [github.com/bertmert/pulse-culture-survey](https://github.com/bertmert/pulse-culture-survey)

**Note**: This is a POC (Proof of Concept) demonstrating the integration between the survey and admin dashboard. In production, these would be separate applications with proper authentication and data management.

# Old Mutual Pulse Culture Survey 🎯

*Auto-deployment configured with Netlify + GitHub* ✅

A comprehensive survey application for Old Mutual's organizational culture assessment.

## 🚀 Quick Start

### Deploy Changes (Choose One):
- **Double-click:** `UPDATE.bat` (simplest - no message needed)
- **With message:** `DEPLOY.bat "Your message here"`
- **Advanced:** See `docs/QUICK_UPDATE_GUIDE.md`

### Team Collaboration:
- **Setup new member:** `scripts/team-setup.bat`
- **Sync before work:** `scripts/sync.bat`
- **Full guide:** `docs/COLLABORATION_GUIDE.md`

## 📁 Project Structure

```
├── 📄 index.html          # Main survey page
├── 🎨 styles.css          # Styling and layout
├── ⚡ script.js           # Survey functionality
├── ⚙️ netlify.toml        # Netlify configuration
├── 🚀 UPDATE.bat          # Quick deployment (no message)
├── 📤 DEPLOY.bat          # Deployment with custom message
│
├── 📂 docs/               # Documentation
│   ├── README.md          # Detailed project info
│   ├── NETLIFY_SETUP.md   # Netlify setup guide
│   ├── COLLABORATION_GUIDE.md  # Team workflow
│   └── QUICK_UPDATE_GUIDE.md   # Deployment options
│
├── 📂 scripts/            # Deployment & utility scripts
│   ├── update.bat         # Simple auto-deploy
│   ├── quick-deploy.bat   # Deploy with message
│   ├── sync.bat           # Pull latest changes
│   ├── team-setup.bat     # New team member setup
│   └── *.ps1 files       # PowerShell versions
│
└── 📂 assets/             # Images and static files
    └── attachment.png     # Survey images
```

## 🌐 Live Site - https://superlative-frangollo-4b3076.netlify.app/

Your survey is automatically deployed to Netlify. Any changes pushed to GitHub appear live within 1-2 minutes.

## 📖 Documentation

- **Getting Started:** `docs/README.md`
- **Team Setup:** `docs/COLLABORATION_GUIDE.md`
- **Deployment Help:** `docs/QUICK_UPDATE_GUIDE.md`
- **Netlify Setup:** `docs/NETLIFY_SETUP.md`

## ⚡ Quick Actions

```bash
# Update live site (simple)
UPDATE.bat

# Update with message
DEPLOY.bat "Fixed question 5 typo"

# Sync with team changes
scripts\sync.bat

# Setup new team member
scripts\team-setup.bat
```

---

**Repository:** [github.com/bertmert/pulse-culture-survey](https://github.com/bertmert/pulse-culture-survey) 