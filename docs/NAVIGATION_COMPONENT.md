# Reusable Navigation Component

This document explains how to use the reusable navigation component for the Pulse Survey Dashboard.

## Overview

The navigation component (`navigation.js`) provides a consistent navigation experience across all main pages of the Pulse Survey Dashboard. It automatically creates the header structure including the logo, navigation tabs, and header actions.

## Features

- **Automatic Header Creation**: Creates logo, navigation tabs, and header actions
- **Survey Access Modal**: Handles the survey access modal functionality
- **Page Detection**: Automatically detects the current page and sets the active tab
- **Consistent Styling**: Maintains consistent styling across all pages
- **Browser History**: Handles browser back/forward navigation

## How to Use

### 1. Include the Navigation Script

Add the navigation script to your HTML page:

```html
<script src="navigation.js"></script>
```

### 2. Set the Current Page

Add a `data-current-page` attribute to the body element:

```html
<body data-current-page="overview">
```

Valid page values:
- `overview` - Overview page
- `overview-ee` - Overview (EE only) page
- `reports` - Reports page
- `progress` - Progress Tracker page

### 3. Create Header Structure

Replace the existing header content with a simple comment:

```html
<header>
    <!-- Logo, Navigation, and Header Actions will be created by navigation.js -->
</header>
```

### 4. Initialize Navigation

Add page-specific initialization in your script:

```javascript
document.addEventListener('DOMContentLoaded', function() {
    // Set the current page for navigation
    const currentPage = document.body.dataset.currentPage;
    if (window.pulseNavigation && currentPage) {
        window.pulseNavigation.updateCurrentPage(currentPage);
    }
    
    // Add your page-specific functionality here
});
```

## Page Template

Here's a complete template for creating new pages:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pulse Survey Admin Dashboard - Page Title</title>
    <link rel="icon" type="image/x-icon" href="/images/favicon.ico">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</head>
<body data-current-page="your-page-name">
    <div class="container">
        <header>
            <!-- Logo, Navigation, and Header Actions will be created by navigation.js -->
        </header>

        <main>
            <!-- Your page content goes here -->
            <section class="content-section active">
                <div class="section-header">
                    <div class="page-title">
                        <h1>Your Page Title</h1>
                        <p class="section-description">Your page description</p>
                    </div>
                </div>
                
                <!-- Your page content -->
                <div class="page-content">
                    <!-- Add your page-specific content here -->
                </div>
            </section>
        </main>
    </div>
    
    <!-- Scripts -->
    <script src="navigation.js"></script>
    <script src="data.js"></script>
    <script src="app.js"></script>
    
    <!-- Page-specific scripts -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Set the current page for navigation
            const currentPage = document.body.dataset.currentPage;
            if (window.pulseNavigation && currentPage) {
                window.pulseNavigation.updateCurrentPage(currentPage);
            }
            
            // Add your page-specific functionality here
        });
    </script>
</body>
</html>
```

## Components

### PulseNavigation Class

The main navigation class that handles:
- Creating the navigation structure
- Setting up event listeners
- Managing active tabs
- Handling page navigation

### SurveyAccessModal Class

Handles the survey access modal functionality:
- Creating the modal HTML
- Managing modal open/close
- Handling survey access options

### HeaderActions Class

Creates the header actions section including the "Open Survey" button.

### LogoComponent Class

Creates the logo section in the header.

### FooterComponent Class

Creates the footer section with copyright and links.

## Navigation Structure

The navigation component creates the following structure:

```html
<header>
    <div class="logo">
        <img src="images/pulse-logo.png" alt="Pulse Logo">
    </div>
    <nav class="main-nav">
        <div class="nav-container">
            <ul class="nav-tabs">
                <li class="nav-tab" data-page="overview" data-url="overview.html">
                    <i class="material-icons">dashboard</i>
                    Overview
                </li>
                <li class="nav-tab" data-page="overview-ee" data-url="overview.html">
                    <i class="material-icons">dashboard_customize</i>
                    Overview (EE only)
                </li>
                <li class="nav-tab" data-page="reports" data-url="reports.html">
                    <i class="material-icons">assessment</i>
                    Reports
                </li>
                <li class="nav-tab" data-page="progress" data-url="progress.html">
                    <i class="material-icons">trending_up</i>
                    Progress Tracker
                </li>
            </ul>
        </div>
    </nav>
    <div class="header-actions">
        <button id="openSurvey" class="survey-button">
            <i class="material-icons">poll</i>
            Open Survey (for demo only)
        </button>
    </div>
</header>
```

## Benefits

1. **Consistency**: All pages have the same navigation structure and behavior
2. **Maintainability**: Changes to navigation only need to be made in one place
3. **Reusability**: Easy to add new pages with consistent navigation
4. **Modularity**: Each component is self-contained and can be used independently
5. **Accessibility**: Proper semantic HTML and keyboard navigation support

## Migration Guide

To migrate existing pages to use the navigation component:

1. Remove the existing header HTML structure
2. Add the `data-current-page` attribute to the body element
3. Include the `navigation.js` script
4. Add the page-specific initialization script
5. Test the navigation functionality

## Troubleshooting

### Navigation not appearing
- Ensure `navigation.js` is loaded before other scripts
- Check that the header element exists in the DOM
- Verify the `data-current-page` attribute is set correctly

### Active tab not highlighting
- Check that the `data-current-page` value matches one of the navigation tab `data-page` values
- Ensure the page-specific initialization script is running

### Survey modal not working
- Check that the modal HTML is being created correctly
- Verify event listeners are attached to the survey button
- Ensure no JavaScript errors are preventing the modal from working 