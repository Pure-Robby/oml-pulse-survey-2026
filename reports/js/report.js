// Static Report Configuration System
// Converts ASP.NET report to static HTML/JS version

class StaticReportEngine {
    constructor() {
        this.config = null;
        this.reportData = null;
        this.currentYear = new Date().getFullYear();
        this.currentPage = 1;
        this.debug = window.location.search.includes('debug=true');
        
        this.init();
    }
    
    init() {
        try {
            console.log('Initializing Static Report Engine...');
            
            // Detect configuration from URL parameters
            this.detectConfigFromURL();
            
            // Load sample data
            this.loadSampleData();
            
            // Populate report content when DOM is ready
            if (document.readyState === 'loading') {
                if (this.debug) console.log('DOM still loading, waiting for DOMContentLoaded...');
                document.addEventListener('DOMContentLoaded', () => {
                    if (this.debug) console.log('DOM loaded, populating report...');
                    this.populateReport();
                });
            } else {
                if (this.debug) console.log('DOM already loaded, populating report immediately...');
                this.populateReport();
            }
        } catch (error) {
            console.error('Error during initialization:', error);
        }
    }
    
    detectConfigFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const reportType = urlParams.get('type') || 'employee-engagement';
        
        // Import configuration from existing config.js if available
        if (typeof DIMENSION_CONFIG !== 'undefined') {
            if (reportType.toLowerCase().includes('change') || reportType.toLowerCase().includes('readiness')) {
                this.config = this.createConfigFromDimension(DIMENSION_CONFIG.dimensionDefinitions.changeReadiness);
            } else {
                this.config = this.createConfigFromDimension(DIMENSION_CONFIG.dimensionDefinitions.engagement);
            }
        } else {
            // Fallback configuration
            this.config = this.createFallbackConfig(reportType);
        }
        
        if (this.debug) console.log('Loaded configuration:', this.config);
    }
    
    createConfigFromDimension(dimensionDef) {
        const isEngagement = dimensionDef.id === 'engagement';
        return {
            Id: dimensionDef.id,
            Name: dimensionDef.title,
            Color: dimensionDef.color,
            ColorSecondary: dimensionDef.gradientColors[1],
            CssClass: dimensionDef.id,
            QuestionCount: dimensionDef.numberOfQuestions || 6,
            ScaleType: dimensionDef.ratingScale || (isEngagement ? "6-point" : "5-point"),
            Questions: Object.values(dimensionDef.questionTexts || {})
        };
    }
    
    createFallbackConfig(reportType) {
        if (reportType.toLowerCase().includes('change') || reportType.toLowerCase().includes('readiness')) {
            return {
                Id: "change-readiness",
                Name: "Change Resilience",
                Color: "#E91E63",
                ColorSecondary: "#C2185B",
                CssClass: "changeReadiness",
                QuestionCount: 6,
                ScaleType: "6-point",
                Questions: [
                    "I feel confident in my ability to adapt to ongoing changes within the organisation",
                    "The organisation communicates the purpose and impact of changes clearly",
                    "I understand the impacts of changes to the organisation",
                    "When a change is introduced, my line manager effectively communicates and manages the change",
                    "My feedback and concerns about change are heard and considered by leadership",
                    "My organisation has provided me with sufficient resources to enable me to navigate current changes"
                ]
            };
        } else {
            return {
                Id: "employee-engagement",
                Name: "Employee Engagement",
                Color: "#F37021",
                ColorSecondary: "#E55A00",
                CssClass: "engagement",
                QuestionCount: 6,
                ScaleType: "6-point",
                Questions: [
                    "I feel energised by the work that I do",
                    "I feel excited about the work that I do",
                    "I feel energetic while at work",
                    "I feel enthusiastic about my work",
                    "I feel happy and in good spirits while at work",
                    "I am inspirsssed by my work"
                ]
            };
        }
    }
    
    loadSampleData() {
        // Use existing dashboardData if available, otherwise create sample data
        if (typeof dashboardData !== 'undefined') {
            this.reportData = this.adaptDashboardData(dashboardData);
        } else {
            this.reportData = this.createSampleData();
        }
    }
    
    adaptDashboardData(data) {
        // Get the current report type from URL to avoid inconsistencies
        const urlParams = new URLSearchParams(window.location.search);
        const reportType = urlParams.get('type') || 'employee-engagement';
        const isEngagement = !reportType.toLowerCase().includes('change');
        
        // Filter statements based on dimension, using the updated "Change Resilience" name
        const statements = data.allStatements ? data.allStatements.filter(s => 
            isEngagement ? s.dimension === 'Employee Engagement' : s.dimension === 'Change Resilience'
        ) : [];
        
        return {
            // Filter data
            WorkerGroupFilter: "All Employees",
            SegmentFilter: "Corporate, Mass and Foundation Cluster",
            DivisionFilter: "Group Finance, Group Internal Audit, Group Risk, Compliance & Actuarial",
            DepartmentFilter: "Customer Service, Product Development, Quality Assurance",
            TeamFilter: "Team Alpha, Team Beta, Team Gamma",
            CountryFilter: "South Africa",
            RegionFilter: "Western Cape, Gauteng",
            CompanyFilter: "Old Mutual Limited",
            SupervisoryOrganizationFilter: "Group Finance",
            JobFamilyFilter: "Management, Professional, Technical",
            WorksManagerFilter: "Yes",
            AgeFilter: "18-35, 36-50, 50+",
            GenderFilter: "Male, Female",
            RaceFilter: "African, Coloured, Indian, White",
            ManagementLevelFilter: "Senior, Middle, Junior",
            
            // Response data
            EmployeeHeadcount: data.responseRate?.total || 8540,
            ResponsesCount: data.responseRate?.responses || 4750,
            ResponsesRate: Math.round(((data.responseRate?.responses || 4750) / (data.responseRate?.total || 8540)) * 100),
            
            // Scores
            OverallAverageScore: isEngagement ? 3.52 : 4.29,
            TopScoringStatementText: statements.length > 0 ? statements.sort((a, b) => b.score - a.score)[0].text : this.config.Questions[isEngagement ? 4 : 1],
            TopScoringStatementScore: statements.length > 0 ? statements.sort((a, b) => b.score - a.score)[0].score : (isEngagement ? 4.5 : 4.8),
            BottomScoringStatementText: statements.length > 0 ? statements.sort((a, b) => a.score - b.score)[0].text : this.config.Questions[isEngagement ? 0 : 3],
            BottomScoringStatementScore: statements.length > 0 ? statements.sort((a, b) => a.score - b.score)[0].score : (isEngagement ? 2.8 : 2.6),
            
            // Page data
            CurrentPage: this.currentPage,
            Config: this.config,
            
            // Question scores for tables
            Scores: statements.length > 0 ? statements.map((stmt, index) => ({
                Description: stmt.text,
                Score: stmt.score,
                scoreType: "Statement"
            })) : this.config.Questions.map((question, index) => ({
                Description: question,
                Score: isEngagement ? [2.8, 3.1, 4.2, 3.6, 4.5, 2.9][index] || 3.5 : [3.4, 4.8, 4.6, 2.6, 4.3, 4.1][index] || 3.5,
                scoreType: "Statement"
            }))
        };
    }
    
    createSampleData() {
        const isEngagement = this.config.Id === 'employee-engagement';
        const sampleScores = isEngagement ? 
            [2.8, 3.1, 4.2, 3.6, 4.5, 2.9] : 
            [3.4, 4.8, 4.6, 2.6, 4.3, 4.1];
            
        return {
            WorkerGroupFilter: "All Employees",
            SegmentFilter: "Corporate, Mass and Foundation Cluster",
            DivisionFilter: "Group Finance, Group Internal Audit",
            DepartmentFilter: "Customer Service, Product Development",
            TeamFilter: "Team Alpha, Team Beta, Team Gamma",
            CountryFilter: "South Africa",
            RegionFilter: "Western Cape, Gauteng",
            CompanyFilter: "Old Mutual Limited",
            SupervisoryOrganizationFilter: "Group Finance",
            JobFamilyFilter: "Management, Professional",
            WorksManagerFilter: "Yes",
            AgeFilter: "18-35, 36-50, 50+",
            GenderFilter: "Male, Female",
            RaceFilter: "African, Coloured, Indian, White",
            ManagementLevelFilter: "Senior, Middle, Junior",
            
            EmployeeHeadcount: 8540,
            ResponsesCount: 4750,
            ResponsesRate: 56,
            
            OverallAverageScore: isEngagement ? 3.52 : 4.29,
            TopScoringStatementText: this.config.Questions[isEngagement ? 4 : 1],
            TopScoringStatementScore: isEngagement ? 4.5 : 4.8,
            BottomScoringStatementText: this.config.Questions[isEngagement ? 0 : 3],
            BottomScoringStatementScore: isEngagement ? 2.8 : 2.6,
            
            CurrentPage: this.currentPage,
            Config: this.config,
            
            Scores: this.config.Questions.map((question, index) => ({
                Description: question,
                Score: sampleScores[index] || 3.5,
                scoreType: "Statement"
            }))
        };
    }
    
    populateReport() {
        try {
            if (this.debug) {
                console.log('Starting report population...');
                console.log('Config:', this.config);
                console.log('Report data:', this.reportData);
            }
            
            // Set CSS custom properties for colors
            this.setCSSProperties();
            
            // Populate page title
            document.title = `Pulse Survey Report ${this.currentYear}`;
            
            // Populate all dynamic content
            if (this.debug) console.log('Populating filter data...');
            this.populateFilterData();
            
            if (this.debug) console.log('Populating headers...');
            this.populateHeaders();
            
            if (this.debug) console.log('Populating scale section...');
            this.populateScaleSection();
            
            if (this.debug) console.log('Populating summary section...');
            this.populateSummarySection();
            
            if (this.debug) console.log('Populating trend section...');
            this.populateTrendSection();
            
            if (this.debug) console.log('Populating top/bottom section...');
            this.populateTopBottomSection();
            
            if (this.debug) console.log('Populating footers...');
            this.populateFooters();
            
            if (this.debug) console.log('Report populated successfully');
        } catch (error) {
            console.error('Error populating report:', error);
        }
    }
    
    setCSSProperties() {
        const root = document.documentElement;
        root.style.setProperty('--dimension-color', this.config.Color);
        root.style.setProperty('--dimension-color-secondary', this.config.ColorSecondary);
    }
    
    populateFilterData() {
        // Map data to CSS classes or IDs
        const replacements = {
            'worker-group-filter': this.reportData.WorkerGroupFilter,
            'segment-filter': this.reportData.SegmentFilter,
            'division-filter': this.reportData.DivisionFilter,
            'department-filter': this.reportData.DepartmentFilter,
            'team-filter': this.reportData.TeamFilter,
            'country-filter': this.reportData.CountryFilter,
            'region-filter': this.reportData.RegionFilter,
            'company-filter': this.reportData.CompanyFilter,
            'supervisory-org-filter': this.reportData.SupervisoryOrganizationFilter,
            'job-family-filter': this.reportData.JobFamilyFilter,
            'works-manager-filter': this.reportData.WorksManagerFilter,
            'age-filter': this.reportData.AgeFilter,
            'gender-filter': this.reportData.GenderFilter,
            'race-filter': this.reportData.RaceFilter,
            'management-level-filter': this.reportData.ManagementLevelFilter,
            'generate-date': new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            'sample-size': `${this.reportData.ResponsesCount} of ${this.reportData.EmployeeHeadcount} responses`
        };
        
        // Apply replacements
        Object.entries(replacements).forEach(([fieldName, value]) => {
            const elements = document.querySelectorAll(`[data-field="${fieldName}"], .${fieldName}`);
            if (elements.length === 0 && this.debug) {
                console.warn(`No elements found for field: ${fieldName}`);
            }
            elements.forEach(el => {
                el.textContent = value;
                if (this.debug) console.log(`Updated ${fieldName}:`, value);
            });
        });
    }
    
    populateHeaders() {
        // Update all dynamic headers
        const headings = document.querySelectorAll('[data-dynamic-heading]');
        headings.forEach(heading => {
            let text = heading.textContent;
            text = text.replace('{config.Name}', this.config.Name);
            text = text.replace('{config.ScaleType}', this.config.ScaleType.replace(' - ', ' - Point '));
            heading.textContent = text;
        });
    }
    
    populateScaleSection() {
        // Show appropriate scale section
        const fivePointSection = document.querySelector('.scoring-scale.five-point');
        const sixPointSection = document.querySelector('.scoring-scale.six-point');
        
        if (this.config.ScaleType === '5-point') {
            if (fivePointSection) fivePointSection.style.display = 'block';
            if (sixPointSection) sixPointSection.style.display = 'none';
        } else {
            if (fivePointSection) fivePointSection.style.display = 'none';
            if (sixPointSection) sixPointSection.style.display = 'block';
        }
    }
    
    populateSummarySection() {
        // Update summary metrics
        this.updateElements('[data-field="employee-headcount"]', this.reportData.EmployeeHeadcount);
        this.updateElements('[data-field="responses-count"]', this.reportData.ResponsesCount);
        this.updateElements('[data-field="response-rate"]', this.reportData.ResponsesRate + '%');
        this.updateElements('[data-field="dimension-name"]', this.config.Name);
        this.updateElements('[data-field="dimension-questions"]', `${this.config.QuestionCount} Questions`);
        this.updateElements('[data-field="dimension-scale"]', `Rating Scale: 1-6`); // Both dimensions use 6-point scale
        this.updateElements('[data-field="overall-average-score"]', this.reportData.OverallAverageScore.toString().replace(',', '.'));
        this.updateElements('[data-field="scale-max"]', '6'); // Both dimensions use 6-point scale
        this.updateElements('[data-field="top-statement-text"]', this.reportData.TopScoringStatementText);
        this.updateElements('[data-field="top-statement-score"]', this.reportData.TopScoringStatementScore.toString().replace(',', '.'));
        this.updateElements('[data-field="bottom-statement-text"]', this.reportData.BottomScoringStatementText);
        this.updateElements('[data-field="bottom-statement-score"]', this.reportData.BottomScoringStatementScore.toString().replace(',', '.'));
        
        // Update dimension abbreviation for Score Trends section
        // Get the correct title from config instead of hardcoding
        const abbreviation = this.config.Name;
        this.updateElements('[data-field="dimension-abbreviation"]', abbreviation);
    }
    
    populateTrendSection() {
        // Update segment scores table question headers
        const questionHeaders = document.querySelectorAll('.question-header');
        questionHeaders.forEach((header, index) => {
            if (this.config.Questions[index]) {
                header.textContent = this.config.Questions[index];
            }
        });
        
        // Update dimension index header
        this.updateElements('[data-field="dimension-name"]', this.config.Name);
    }
    
    populateTopBottomSection() {
        // Update top 3 questions table
        const topTableBody = document.querySelector('[data-table="top-questions"] tbody');
        if (topTableBody) {
            const topScores = [...this.reportData.Scores].sort((a, b) => b.Score - a.Score).slice(0, 3);
            topTableBody.innerHTML = topScores.map((score, index) => `
                <tr>
                    <td class="question-scores__td number">${index + 1}</td>
                    <td class="question-scores__td question">${score.Description}</td>
                    <td class="question-scores__td dimension">${this.config.Name}</td>
                    <td class="question-scores__td score">
                        ${score.Score.toString().replace(',', '.')} 
                        <span class="question-scores__out-of">out of 6</span>
                    </td>
                </tr>
            `).join('');
        }
        
        // Update bottom 3 questions table
        const bottomTableBody = document.querySelector('[data-table="bottom-questions"] tbody');
        if (bottomTableBody) {
            const bottomScores = [...this.reportData.Scores].sort((a, b) => a.Score - b.Score).slice(0, 3);
            bottomTableBody.innerHTML = bottomScores.map((score, index) => `
                <tr>
                    <td class="question-scores__td number">${index + 1}</td>
                    <td class="question-scores__td question">${score.Description}</td>
                    <td class="question-scores__td dimension">${this.config.Name}</td>
                    <td class="question-scores__td score">
                        ${score.Score.toString().replace(',', '.')} 
                        <span class="question-scores__out-of">out of 6</span>
                    </td>
                </tr>
            `).join('');
        }
    }
    
    populateFooters() {
        // Update all page numbers and copyright
        this.updateElements('[data-field="page-number"]', (el, index) => index + 1);
        this.updateElements('[data-field="copyright-year"]', this.currentYear);
    }
    
    updateElements(selector, value) {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el, index) => {
            if (typeof value === 'function') {
                el.textContent = value(el, index);
            } else {
                el.textContent = value;
            }
        });
    }
}

// Initialize the report engine
const reportEngine = new StaticReportEngine();

console.log('Static Report Engine loaded');