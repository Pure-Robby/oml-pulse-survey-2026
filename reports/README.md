## Run App locally
# npx http-server -p 8080

# Static Report System

This document explains the conversion from ASP.NET report to static HTML/JavaScript.

## Overview

The report has been converted from server-side ASP.NET rendering to a client-side JavaScript solution that works with plain HTML files. The system automatically detects which type of report to show based on URL parameters and populates the content dynamically.

## Files

### Core Files
- `online/index-static.html` - Clean HTML template without server-side code
- `js/report.js` - JavaScript engine that populates the report
- `css/report.css` - Existing styles (unchanged)

### Configuration Files (from main project)
- `../../config.js` - Dimension configurations for Employee Engagement and Change Readiness
- `../../data.js` - Sample data and survey results

## Usage

### Basic Usage
Open the static HTML file directly:
```
reports/online/index-static.html
```

This will show the Employee Engagement report by default.

### URL Parameters
To show different report types, use URL parameters:

**Employee Engagement (default):**
```
reports/online/index-static.html
reports/online/index-static.html?type=employee-engagement
```

**Change Readiness:**
```
reports/online/index-static.html?type=change-readiness
```

### Configuration

The system automatically detects and uses configuration from:

1. **Primary Source**: `DIMENSION_CONFIG` from `config.js`
   - Employee Engagement: 6-point scale, orange theme (#F37021)
   - Change Readiness: 5-point scale, pink theme (#E91E63)

2. **Fallback**: Built-in configuration if config.js is not available

### Data Sources

The system uses data in this priority order:

1. **Primary**: `dashboardData` from `data.js` - Real survey data
2. **Fallback**: Generated sample data based on configuration

## What Changed

### From ASP.NET Razor Syntax
```csharp
@Model.WorkerGroupFilter
@config.Color
@DateTime.Now.Year
@Model.ReportPages[Model.CurrentItem].Heading.Replace("{config.Name}", Model.Config.Name)
```

### To Data Attributes
```html
<td data-field="worker-group-filter">Loading...</td>
<h1 data-dynamic-heading>{config.Name} Summary</h1>
<span data-field="copyright-year">2025</span>
```

### Dynamic Content Population

The JavaScript engine (`StaticReportEngine`) handles:

- **URL Parameter Detection**: Automatically switches between Employee Engagement and Change Readiness
- **Configuration Loading**: Uses existing config.js or fallback settings
- **Data Population**: Fills all data fields from sample data
- **Scale Selection**: Shows 5-point or 6-point scale based on dimension
- **Color Theming**: Sets CSS custom properties for dimension colors
- **Table Generation**: Dynamically creates top/bottom scoring questions tables

## Features

### Automatic Configuration
- Detects report type from URL
- Loads appropriate dimension configuration
- Sets correct colors and scale type
- Populates questions and metadata

### Dynamic Content
- Filter data (departments, teams, demographics)
- Response metrics (headcount, response rate)
- Scoring data (top/bottom statements, averages)
- Page numbers and dates

### Responsive Design
- Works with existing CSS
- Maintains all visual styling
- Supports print layouts

## Technical Details

### Class Structure
```javascript
class StaticReportEngine {
    detectConfigFromURL()        // Parse URL parameters
    createConfigFromDimension()  // Convert config format
    loadSampleData()            // Load or generate data
    populateReport()            // Fill all content
    setCSSProperties()          // Apply theme colors
}
```

### Data Mapping
The system maps ASP.NET Model properties to data attributes:

| ASP.NET Model | Data Attribute | Example |
|---------------|----------------|---------|
| `@Model.WorkerGroupFilter` | `data-field="worker-group-filter"` | "All Employees" |
| `@config.Name` | `data-field="dimension-name"` | "Employee Engagement" |
| `@DateTime.Now.Year` | `data-field="copyright-year"` | "2025" |

### Configuration Object
```javascript
{
    Id: "employee-engagement",
    Name: "Employee Engagement", 
    Color: "#F37021",
    ColorSecondary: "#E55A00",
    CssClass: "engagement",
    QuestionCount: 6,
    ScaleType: "6-point",
    Questions: [...]
}
```

## Development

### Adding New Fields
1. Add data attribute to HTML: `data-field="new-field"`
2. Add mapping in `populateFilterData()` or relevant method
3. Add sample data to `createSampleData()`

### Adding New Report Types
1. Extend `createFallbackConfig()` with new type detection
2. Add new configuration object
3. Update URL parameter parsing

### Testing
Test both report types:
- `index-static.html` (Employee Engagement)
- `index-static.html?type=change-readiness` (Change Readiness)

Verify:
- Correct colors and themes
- Appropriate scale (5-point vs 6-point)
- Proper question text
- All data fields populated

## Migration Benefits

1. **No Server Dependencies**: Works with any web server or file system
2. **Easy Deployment**: Just copy HTML/JS/CSS files
3. **Dynamic Configuration**: Still supports multiple report types
4. **Maintainable**: Uses existing configuration system
5. **Performance**: Faster loading, no server processing
6. **Debugging**: Easier to debug in browser developer tools

## Browser Support

Works in all modern browsers with JavaScript enabled. Requires ES6 support for class syntax and modern DOM APIs.