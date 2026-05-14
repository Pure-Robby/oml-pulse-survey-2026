# Static Report Troubleshooting Guide

## Common Issues and Solutions

### 1. Content Shows "Loading..." Instead of Data

**Symptoms:**
- All or most dynamic content shows "Loading..." text
- Report appears to load but data isn't populated

**Diagnosis:**
1. Open browser console (F12)
2. Look for JavaScript errors or warnings
3. Check if the Static Report Engine is initializing

**Solutions:**

#### A. Check JavaScript Loading
```javascript
// In browser console, check if scripts loaded:
console.log(typeof StaticReportEngine); // Should be "function"
console.log(typeof reportEngine); // Should be "object" 
console.log(typeof DIMENSION_CONFIG); // Should be "object" (if config.js available)
```

#### B. Verify File Paths
Ensure these files are accessible:
- `reports/js/report.js`
- `config.js` (optional, in parent directory)
- `data.js` (optional, in parent directory)

#### C. Check Console Output
Look for these console messages:
```
Initializing Static Report Engine...
Loaded configuration: [config object]
Starting report population...
Report populated successfully
```

If missing, check for error messages.

### 2. Wrong Report Type (Employee Engagement vs Change Readiness)

**Symptoms:**
- Always shows Employee Engagement even with URL parameters
- Wrong color scheme or scale type

**Diagnosis:**
1. Check URL parameters: `?type=change-readiness`
2. In console: `console.log(reportEngine.config)`

**Solutions:**
- Ensure URL parameter is correct: `?type=change-readiness` or `?type=employee-engagement`
- Clear browser cache
- Try different parameter variations: `?type=change` should also work

### 3. Configuration Not Loading

**Symptoms:**
- Uses fallback configuration instead of config.js
- Missing dimension questions or wrong colors

**Diagnosis:**
```javascript
// Check if external config loaded:
console.log(typeof DIMENSION_CONFIG);
console.log(DIMENSION_CONFIG); // Should show dimension definitions
```

**Solutions:**
1. Verify `config.js` exists in the correct path relative to the HTML file
2. Check browser Network tab to see if config.js is loading (should be 200 status)
3. If config.js has errors, system will fall back to built-in configuration

### 4. Data Not Populating

**Symptoms:**
- Some sections work, others don't
- Specific fields remain as "Loading..."

**Diagnosis:**
```javascript
// Check data loading:
console.log(reportEngine.reportData);
// Check specific field mapping:
console.log('Elements found for employee-headcount:', document.querySelectorAll('[data-field="employee-headcount"]').length);
```

**Solutions:**
1. Verify HTML data attributes match JavaScript field names
2. Check if data.js is loading properly
3. Look for console warnings about missing elements

### 5. Scale Section Not Showing

**Symptoms:**
- Neither 5-point nor 6-point scale is visible
- Scale section is empty

**Diagnosis:**
```javascript
console.log('Scale type:', reportEngine.config.ScaleType);
console.log('5-point element:', document.querySelector('.scoring-scale.five-point'));
console.log('6-point element:', document.querySelector('.scoring-scale.six-point'));
```

**Solutions:**
1. Check that scale elements exist in HTML
2. Verify CSS isn't hiding elements
3. Ensure scale type detection is working

## Debug Steps

### Step 1: Basic Functionality Test
1. Open `reports/debug-test.html`
2. Check if basic fields populate
3. Review console for errors

### Step 2: Manual Testing
```javascript
// In browser console:
// Test configuration
reportEngine.detectConfigFromURL();
console.log(reportEngine.config);

// Test data loading  
reportEngine.loadSampleData();
console.log(reportEngine.reportData);

// Test population
reportEngine.populateReport();
```

### Step 3: Element Inspection
```javascript
// Check specific elements
document.querySelectorAll('[data-field]').forEach(el => {
    console.log(`Field: ${el.getAttribute('data-field')}, Content: "${el.textContent}"`);
});
```

## File Structure Verification

Ensure your file structure matches:
```
reports/
├── js/
│   └── report.js
├── online/
│   └── index-static.html
├── css/
│   └── report.css
├── test-static.html
├── debug-test.html
└── README.md

Parent directory:
├── config.js (optional)
└── data.js (optional)
```

## Browser Compatibility

**Minimum Requirements:**
- ES6 class support
- Modern DOM APIs
- JavaScript enabled

**Tested Browsers:**
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Performance Issues

### Slow Loading
- Check file sizes of config.js and data.js
- Verify web server configuration
- Check for network issues

### Memory Issues
- Large datasets in data.js may cause performance issues
- Consider reducing sample data size for testing

## Contact & Support

If issues persist:
1. Check browser console for complete error messages
2. Verify all file paths and dependencies
3. Test with the debug page first
4. Review the main README.md for setup instructions

## Debugging Checklist

- [ ] Browser console shows no JavaScript errors
- [ ] All required files are accessible (check Network tab)
- [ ] Static Report Engine initializes successfully
- [ ] Configuration loads or falls back properly
- [ ] Data populates without warnings
- [ ] URL parameters work correctly
- [ ] Scale section displays appropriate type
- [ ] All data-field attributes have matching JavaScript handlers