# Old Mutual Staff Culture Survey

*Auto-deployment configured with Netlify + GitHub* ✅

A sophisticated multi-page survey application designed for Old Mutual to assess staff culture across three key dimensions. Built with authentic Old Mutual branding and featuring an interactive analytics dashboard.

## Overview

This survey application provides a comprehensive assessment tool for measuring employee sentiment, talent management perceptions, and employee engagement at Old Mutual. The application features:

- **Authentic Old Mutual Branding**: Uses official Old Mutual colors (#009677, #50b848, #8dc63f, #d1133e) and professional typography
- **Multi-Page Experience**: Three separate pages for different survey dimensions
- **Interactive Dashboard**: Real-time analytics with charts and personalized insights
- **Professional UI/UX**: Modern, responsive design optimized for all devices
- **Progress Tracking**: Visual progress indicator and automatic progress saving

## Features

### Survey Structure
- **14 Questions** across 3 dimensions using 5-point Likert scales
- **Employee Sentiment** (Questions 1-3): Organizational loyalty and satisfaction
- **Talent Management** (Questions 4-8): Employer branding and talent attraction/retention
- **Employee Engagement** (Questions 9-14): Emotional attachment and team dynamics

### Technical Features
- **Page-by-Page Validation**: Ensures all questions are answered before proceeding
- **Automatic Progress Saving**: Uses localStorage to preserve responses
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Accessibility Compliant**: Keyboard navigation and screen reader friendly
- **Professional Animations**: Smooth transitions and hover effects

### Analytics Dashboard
- **Real-Time Score Calculation**: Overall culture score and dimension-specific averages
- **Interactive Charts**: Response distribution and dimension comparison charts using Chart.js
- **AI-Generated Insights**: Personalized feedback based on response patterns
- **Export Functionality**: Download detailed results as text file
- **Retake Option**: Clear all data and restart the survey

## File Structure

```
old-mutual-survey/
├── index.html          # Main survey page with multi-page structure
├── styles.css          # Old Mutual branded CSS with responsive design
├── script.js           # JavaScript functionality and analytics
└── README.md           # Documentation
```

## Installation & Setup

1. **Clone or Download**: Get all project files
2. **No Dependencies**: The survey uses CDN links for external libraries
3. **Open index.html**: Double-click or serve via web server
4. **Ready to Use**: Survey is immediately functional

### External Libraries (CDN)
- **Chart.js**: For creating interactive charts
- **Google Fonts (Inter)**: Professional typography
- **No other dependencies required**

## Usage

### For Survey Participants
1. **Start Survey**: Read the introduction and begin with Employee Sentiment
2. **Answer Questions**: Use the 5-point Likert scale for each question
3. **Navigate Pages**: Use Next/Previous buttons to move between sections
4. **Complete Survey**: Submit on the final page to see results
5. **View Dashboard**: Analyze your results with charts and insights
6. **Download Results**: Save a detailed report of your responses

### For Administrators
- **Deploy**: Host on any web server or file system
- **Customize**: Modify questions, branding, or styling as needed
- **Collect Data**: Results are generated client-side; integrate with backend as needed

## Survey Questions

### Employee Sentiment (Questions 1-3)
1. I rarely think about looking for a job at a different organisation
2. I am happy working at our organisation
3. I would recommend our organisation as a great place to work

### Talent Management (Questions 4-8)
4. Our organisation has succeeded in developing a unique identity as an employer
5. Our organisation is fast becoming an employer of choice
6. Our organisation really succeeds in attracting the best talent
7. Our organisation really succeeds in keeping the best talent
8. Our organisation would be a good place to work for most people

### Employee Engagement (Questions 9-14)
9. I really feel as if this organisation's problems are my own
10. I do not feel emotionally attached to this organisation (reverse-scored)
11. This organisation has a great deal of personal meaning for me
12. I do not feel like part of the family at my organisation (reverse-scored)
13. I do not feel a strong sense of belonging to my organisation (reverse-scored)
14. At my work, I feel bursting with energy

## Analytics & Insights

### Scoring System
- **5-Point Likert Scale**: Strongly Disagree (1) to Strongly Agree (5)
- **Reverse Scoring**: Questions 10, 12, and 13 are automatically reverse-scored
- **Dimension Averages**: Calculated for each of the three dimensions
- **Overall Score**: Average across all three dimensions

### Generated Insights
The dashboard provides personalized insights including:
- Overall culture assessment
- Strongest and weakest dimensions
- Organizational loyalty indicators
- Team engagement levels
- Brand ambassador potential
- Retention risk factors

### Data Export
Results can be downloaded as a comprehensive text file containing:
- Summary scores for all dimensions
- Detailed question-by-question responses
- Timestamp and completion information
- Professional formatting for reporting

## Customization

### Branding
```css
/* Old Mutual Brand Colors */
--om-primary: #009677;    /* Primary teal */
--om-secondary: #50b848;  /* Secondary green */
--om-accent: #8dc63f;     /* Light green */
--om-highlight: #d1133e;  /* Red accent */
```

### Questions
Modify the questions object in `script.js`:
```javascript
this.questions = {
    sentiment: ['q1', 'q2', 'q3'],
    talent: ['q4', 'q5', 'q6', 'q7', 'q8'],
    engagement: ['q9', 'q10', 'q11', 'q12', 'q13', 'q14']
};
```

### Insights Engine
Add custom insights in the `generateInsights()` method to provide more specific feedback based on your organization's needs.

## Technical Details

### Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Browsers**: iOS Safari, Chrome Mobile, Samsung Internet
- **Progressive Enhancement**: Graceful degradation for older browsers

### Performance
- **Lightweight**: Minimal external dependencies
- **Fast Loading**: Optimized CSS and JavaScript
- **Efficient Charts**: Chart.js renders smoothly on all devices
- **Local Storage**: Progress saved without server calls

### Security
- **Client-Side Processing**: No data transmitted to external servers
- **Local Storage Only**: Responses stored in browser localStorage
- **No Tracking**: Privacy-focused design

## Deployment Options

### 1. Static File Hosting
- Upload files to any web server
- Works with GitHub Pages, Netlify, Vercel
- No backend required

### 2. Integration with Backend
- Modify `submitSurvey()` to send data to your server
- Add authentication if required
- Implement data collection endpoints

### 3. Learning Management Systems
- Compatible with most LMS platforms
- Can be embedded as SCORM package
- Iframe-friendly design

## Support & Maintenance

### Browser Requirements
- JavaScript enabled
- localStorage support
- CSS3 and HTML5 compatibility
- Canvas support for charts

### Troubleshooting
- **Progress Not Saving**: Check localStorage availability
- **Charts Not Loading**: Verify Chart.js CDN connection
- **Styling Issues**: Ensure CSS file is properly linked
- **Navigation Problems**: Check JavaScript console for errors

## License

This survey application is created for Old Mutual staff culture assessment. Modify and use according to your organization's requirements.

## Version History

- **v2.0**: Multi-page experience with authentic Old Mutual branding
- **v1.0**: Single-page survey with basic functionality

For questions or support, contact your Old Mutual IT administrator. 