# Feature Flag Implementation

## Overview

This document explains the feature flag system implemented for the Pulse Culture Survey, specifically focusing on the **Survey Results Dashboard** feature flag that allows switching between a simple "Thank You" message (production) and a full analytics dashboard (POC).

## Feature Flag System

### Configuration (`config.js`)

The feature flag system is implemented in `config.js` with the following structure:

```javascript
const PRODUCTION_CONFIG = {
    // Core Features (Always Active)
    core: {
        survey: true,
        basicAnalytics: true,
        simpleReporting: true,
        thankYouMessage: true
    },
    
    // Advanced Features (Toggleable)
    advanced: {
        surveyResultsDashboard: false,  // Disable for production - show simple thank you instead
        reportBuilder: false,           // Disable for production
        progressTracking: false,        // Disable for production
        complexFiltering: false,        // Disable for production
        pdfExport: false,               // Disable for production
        surveyLinking: false,           // Disable for production
        commentsSystem: false,          // Disable for production
        multiDimensionSurvey: true      // Keep if needed
    },
    
    // Future Features (Preserved)
    future: {
        sentimentAnalysis: true,        // Preserve for future
        riskCultureDimension: true,     // Preserve for future
        advancedCharts: true,           // Preserve for future
        customReports: true,            // Preserve for future
        detailedResults: true           // Preserve for future
    }
};
```

### Helper Functions

Two helper functions are provided for checking feature flags:

```javascript
// Check if a feature is enabled
function isFeatureEnabled(featurePath) {
    const pathParts = featurePath.split('.');
    let current = PRODUCTION_CONFIG;
    
    for (const part of pathParts) {
        if (current && typeof current === 'object' && part in current) {
            current = current[part];
        } else {
            return false;
        }
    }
    
    return current === true;
}

// Get feature configuration
function getFeatureConfig(featurePath) {
    const pathParts = featurePath.split('.');
    let current = PRODUCTION_CONFIG;
    
    for (const part of pathParts) {
        if (current && typeof current === 'object' && part in current) {
            current = current[part];
        } else {
            return null;
        }
    }
    
    return current;
}
```

## Survey Results Dashboard Feature

### Feature Flag: `advanced.surveyResultsDashboard`

- **Production Value:** `false` (Simple thank you message)
- **POC Value:** `true` (Full analytics dashboard)

### Implementation

#### 1. HTML Structure (`survey/index.html`)

The survey results page now contains two separate sections:

```html
<!-- FEATURE FLAG: Simple Thank You Message (Production) -->
<div id="simpleThankYou" class="thank-you-container" style="display: none;">
    <div class="thank-you-card md-card md-elevation-4">
        <div class="thank-you-icon">
            <span class="material-icons">check_circle</span>
        </div>
        <h2 class="thank-you-title">Thank You for Participating!</h2>
        <p class="thank-you-message">
            We appreciate you taking the time to complete the Old Mutual Culture Survey. 
            Your feedback is valuable and will help us improve our workplace culture.
        </p>
        <!-- ... rest of simple thank you content ... -->
    </div>
</div>

<!-- FEATURE FLAG: Advanced Survey Results Dashboard (POC) -->
<div id="advancedDashboard" class="advanced-dashboard" style="display: none;">
    <h2 class="dashboard-title">Survey Results & Insights</h2>
    <!-- ... full analytics dashboard content ... -->
</div>
```

#### 2. JavaScript Logic (`survey/script.js`)

The `showDashboard()` method now checks the feature flag:

```javascript
showDashboard() {
    // Hide survey pages
    document.querySelectorAll('.survey-page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show dashboard
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
        dashboard.classList.add('active');
        this.currentPage = this.totalPages + 1;
        this.updateProgressIndicator();
        
        // FEATURE FLAG: Check if advanced dashboard is enabled
        if (typeof isFeatureEnabled === 'function' && isFeatureEnabled('advanced.surveyResultsDashboard')) {
            // Show advanced dashboard with full analytics
            this.showAdvancedDashboard();
        } else {
            // Show simple thank you message for production
            this.showSimpleThankYou();
        }
        
        dashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}
```

#### 3. CSS Styles (`survey/styles.css`)

Separate styles for both modes:

```css
/* FEATURE FLAG: Simple Thank You Message Styles */
.thank-you-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
    padding: var(--spacing-xl);
}

.thank-you-card {
    max-width: 600px;
    width: 100%;
    text-align: center;
    padding: var(--spacing-xl);
    background: var(--surface);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--elevation-4);
}

/* FEATURE FLAG: Advanced Dashboard Styles */
.advanced-dashboard {
    width: 100%;
}
```

## Testing the Feature Flag

### Test File: `test-feature-flags.html`

A test file is provided to demonstrate the feature flag functionality:

1. **Open:** `test-feature-flags.html` in your browser
2. **Toggle:** Use the "Production Mode" and "POC Mode" buttons
3. **Preview:** Complete the survey in the iframe to see the results
4. **Observe:** Different behavior based on the selected mode

### Manual Testing

To test manually:

1. **Production Mode (Default):**
   - Open `survey/index.html`
   - Complete the survey
   - See simple "Thank You" message

2. **POC Mode:**
   - Temporarily change `advanced.surveyResultsDashboard: true` in `config.js`
   - Complete the survey
   - See full analytics dashboard

## Benefits

### 1. **Zero Code Loss**
- All POC features are preserved in the codebase
- Original functionality can be reactivated instantly

### 2. **Easy Reactivation**
- Change one line in `config.js` to re-enable features
- No code changes required

### 3. **Production Ready**
- Simple, clean interface for production
- No complex analytics that might confuse users

### 4. **Future Proof**
- Easy to add back features when needed
- Clear separation between production and advanced features

### 5. **Maintainable**
- Clear feature flag documentation
- Easy to understand what each flag controls

## Usage Examples

### Enable Advanced Dashboard (POC Mode)
```javascript
// In config.js
const PRODUCTION_CONFIG = {
    advanced: {
        surveyResultsDashboard: true,  // Enable full dashboard
        // ... other flags
    }
};
```

### Disable Advanced Dashboard (Production Mode)
```javascript
// In config.js
const PRODUCTION_CONFIG = {
    advanced: {
        surveyResultsDashboard: false,  // Show simple thank you
        // ... other flags
    }
};
```

### Check Feature Status in Code
```javascript
if (isFeatureEnabled('advanced.surveyResultsDashboard')) {
    // Show advanced dashboard
    showAdvancedDashboard();
} else {
    // Show simple thank you
    showSimpleThankYou();
}
```

## Future Enhancements

The feature flag system can be extended for other features:

- **Report Builder:** `advanced.reportBuilder`
- **Progress Tracking:** `advanced.progressTracking`
- **Complex Filtering:** `advanced.complexFiltering`
- **PDF Export:** `advanced.pdfExport`
- **Survey Linking:** `advanced.surveyLinking`
- **Comments System:** `advanced.commentsSystem`

Each feature can be toggled independently, allowing for granular control over which features are active in production vs POC environments. 