// Store original data for resetting - make sure this is at the top of the file, before any modifications
const originalData = {
    responseRate: { ...dashboardData.responseRate },
    pulseScore: { ...dashboardData.pulseScore },
    flightRisk: { ...dashboardData.flightRisk },
    dimensions: dashboardData.dimensions.map(d => ({...d})),
    sentiment: { ...dashboardData.sentiment },
    sentimentAnalysis: {
        positive: [...dashboardData.sentimentAnalysis.positive],
        negative: [...dashboardData.sentimentAnalysis.negative]
    },
    allStatements: dashboardData.allStatements.map(s => ({...s})),
    organizationLevels: {
        levels: dashboardData.organizationLevels.levels.map(l => ({...l}))
    }
};

let activeFilters = {
    organization: {},
    demographics: {
        age: [],
        gender: [],
        race: [],
        jobLevel: []
    }
};

// Reliability threshold configuration
const RELIABILITY_THRESHOLDS = {
    default: {
        high: 75,
        moderate: 50
    },
    small_group: {
        high: 85,    // Example: Higher threshold for small groups
        moderate: 65,
        max_participants: 50  // Defines what constitutes a small group
    }
};

// Colors for different reliability states
const STATUS_COLORS = {
    high: '#00AE4E',    // Dark Green - Excellent
    moderate: '#FFB800', // Yellow/Orange - Good
    low: '#FF6B6B'       // Light Red - Fair (less alarming than bright red)
};

// PDF export configuration
const pdfOptions = {
    margin: 10,
    filename: 'pulse-survey-dashboard.pdf',
    html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: true
    },
    jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait'
    }
};

// Report Builder State
let reportBuilderState = {
    selectedReportType: null,
    selectedBusinessUnits: [],
    additionalFilters: {
        age: ['all'],
        jobLevel: ['all']
    },
    commentsFilters: {
        sentiment: ['all'],
        volume: ['all'],
        timePeriod: 'all'
    },
    exportOptions: {
        format: 'online',
        includeCharts: true,
        includeTables: true,
        includeInsights: true,
        includeRecommendations: true
    }
};

// Helper function to clone canvas elements
function cloneCanvasElement(originalCanvas) {
    return new Promise((resolve) => {
        const clone = originalCanvas.cloneNode(true);
        const context = clone.getContext('2d');
        context.drawImage(originalCanvas, 0, 0);
        resolve(clone);
    });
}

// Helper function to handle all canvas elements in a container
async function handleCanvasElements(container) {
    // Handle sentiment donut chart
    const originalDonut = document.querySelector('#sentimentChart canvas');
    const clonedDonutContainer = container.querySelector('#sentimentChart');
    
    if (originalDonut && clonedDonutContainer) {
        const donutClone = await cloneCanvasElement(originalDonut);
        const existingDonut = clonedDonutContainer.querySelector('canvas');
        if (existingDonut) {
            existingDonut.replaceWith(donutClone);
        } else {
            clonedDonutContainer.appendChild(donutClone);
        }
    }

    // Handle circular progress elements
    const originalProgressElements = document.querySelectorAll('.circular-progress canvas');
    const clonedProgressContainers = container.querySelectorAll('.circular-progress');

    for (let i = 0; i < originalProgressElements.length; i++) {
        const originalCanvas = originalProgressElements[i];
        const clonedContainer = clonedProgressContainers[i];
        
        if (originalCanvas && clonedContainer) {
            const canvasClone = await cloneCanvasElement(originalCanvas);
            const existingCanvas = clonedContainer.querySelector('canvas');
            if (existingCanvas) {
                existingCanvas.replaceWith(canvasClone);
            } else {
                clonedContainer.appendChild(canvasClone);
            }
        }
    }
}

// Helper function to convert SVG to canvas
async function svgToCanvas(svgElement) {
    return new Promise((resolve) => {
        const svgString = new XMLSerializer().serializeToString(svgElement);
        // Add XML declaration and force SVG namespace
        const svgBlob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>
            ${svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')}`], 
            { type: 'image/svg+xml;charset=utf-8' }
        );
        const url = URL.createObjectURL(svgBlob);
        
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            // Set size to be larger for better quality
            canvas.width = img.width * 2;
            canvas.height = img.height * 2;
            canvas.style.width = img.width + 'px';
            canvas.style.height = img.height + 'px';
            
            const ctx = canvas.getContext('2d');
            ctx.scale(2, 2);
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);
            resolve(canvas);
        };
        img.src = url;
    });
}

// Helper function to convert all SVGs in a container to canvases
async function convertSVGsToCanvas(container) {
    // First handle circular progress elements
    const circularProgressElements = container.querySelectorAll('.circular-progress');
    for (const element of circularProgressElements) {
        const svg = element.querySelector('svg');
        if (svg) {
            // Get the current values and colors before conversion
            const value = parseInt(element.querySelector('.percentage')?.textContent) || 0;
            const color = element.querySelector('circle:last-child')?.getAttribute('stroke') || getProgressColor(value);
            
            // Create a new SVG with explicit dimensions
            const newSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            newSvg.setAttribute('width', '150');
            newSvg.setAttribute('height', '150');
            newSvg.setAttribute('viewBox', '0 0 36 36');
            newSvg.style.transform = 'rotate(-90deg)';
            
            // Calculate the stroke dash array and offset
            const radius = 16;
            const circumference = 2 * Math.PI * radius;
            const dashArray = circumference;
            const dashOffset = circumference * (1 - value / 100);
            
            // Create background circle
            const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            bgCircle.setAttribute('cx', '18');
            bgCircle.setAttribute('cy', '18');
            bgCircle.setAttribute('r', radius.toString());
            bgCircle.setAttribute('fill', 'none');
            bgCircle.setAttribute('stroke', '#E5E5E5');
            bgCircle.setAttribute('stroke-width', '3');
            
            // Create progress circle
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', '18');
            circle.setAttribute('cy', '18');
            circle.setAttribute('r', radius.toString());
            circle.setAttribute('fill', 'none');
            circle.setAttribute('stroke', color);
            circle.setAttribute('stroke-width', '3');
            circle.setAttribute('stroke-dasharray', dashArray.toString());
            circle.setAttribute('stroke-dashoffset', dashOffset.toString());
            circle.setAttribute('stroke-linecap', 'round');
            
            newSvg.appendChild(bgCircle);
            newSvg.appendChild(circle);
            
            // Convert to canvas
            const canvas = await svgToCanvas(newSvg);
            
            // Create wrapper for positioning
            const wrapper = document.createElement('div');
            wrapper.style.position = 'relative';
            wrapper.style.width = '150px';
            wrapper.style.height = '150px';
            wrapper.appendChild(canvas);
            
            // Add percentage text
            const percentage = document.createElement('div');
            percentage.className = 'percentage';
            percentage.style.position = 'absolute';
            percentage.style.top = '50%';
            percentage.style.left = '50%';
            percentage.style.transform = 'translate(-50%, -50%)';
            percentage.style.fontSize = '24px';
            percentage.style.fontWeight = 'bold';
            percentage.textContent = `${value}%`;
            wrapper.appendChild(percentage);
            
            // Replace original content
            element.innerHTML = '';
            element.appendChild(wrapper);
        }
    }
    
    // Then handle donut chart
    const donutChart = container.querySelector('#sentimentChart svg');
    if (donutChart) {
        const canvas = await svgToCanvas(donutChart);
        const chartContainer = donutChart.parentElement;
        donutChart.replaceWith(canvas);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderMetrics();
    renderDimensions();
    renderStatements();
    renderSentiment();
    renderReliabilityIndicator();
    setupModalControls(); // Add modal controls initialization
    
    // Add PDF export event listener
    const exportButton = document.getElementById('exportPdf');
    if (exportButton) {
        exportButton.addEventListener('click', () => {
            alert('Exporting PDF function not implemented yet...');
        });
        // exportButton.addEventListener('click', generatePDF);
    }
});

function getProgressColor(value) {
    if (value >= 85) return '#00AE4E';  // Dark Green
    if (value >= 65) return '#92D051';  // Light Green
    if (value >= 51) return '#FFB800';  // Yellow/Orange
    return '#FF0000';                    // Red
}

// Helper function for 1-5 Likert score colour (circle progress)
function getProgressColorLikertFive(value) {
    if (value >= 4.25) return '#00AE4E';
    if (value >= 3.25) return '#92D051';
    if (value >= 2.55) return '#FFB800';
    return '#FF0000';
}

// Helper function to get response target color (more positive approach)
function getResponseTargetColor(responseRate) {
    if (responseRate >= 75) return '#00AE4E';  // Dark Green - Excellent
    if (responseRate >= 60) return '#92D051';  // Light Green - Good
    if (responseRate >= 45) return '#FFB800';  // Yellow/Orange - Fair
    return '#FF6B6B';                          // Light Red - Needs Attention
}

function getScoreClass(disagreePercentage) {
    if (disagreePercentage >= 50) return 'score-critical';
    if (disagreePercentage >= 31) return 'score-warning';
    if (disagreePercentage >= 16) return 'score-good';
    return 'score-excellent';
}

function getProgressClass(disagreePercentage) {
    if (disagreePercentage >= 50) return 'progress-danger';
    if (disagreePercentage >= 30) return 'progress-warning';
    return 'progress-success';
}

function getProgressClassFiveScale(score) {
    if (score < 3) return 'red';
    if (score < 4) return 'amber';
    return 'green';
}

function calculateTrend(current, previous) {
    return Math.round((current - previous) * 10) / 10;
}

function calculateResponseRate(responses, total) {
    return Math.round((responses / total) * 100);
}

function renderMetrics() {
    // Get the active content section
    const activeSection = document.querySelector('.content-section.active');
    if (!activeSection) return;
    
    // Response Rate Circle - color based on reliability status
    const currentResponseRate = calculateResponseRate(dashboardData.responseRate.responses, dashboardData.responseRate.total);
    const previousResponseRate = calculateResponseRate(dashboardData.responseRate.previous.responses, dashboardData.responseRate.previous.total);
    const responseTrend = calculateTrend(currentResponseRate, previousResponseRate);
    
    const reliabilityStatus = getReliabilityStatus(currentResponseRate, dashboardData.responseRate.total);
    const reliabilityColor = getReliabilityColor(reliabilityStatus);
    
    // Find elements within the active section
    const responseRateProgress = activeSection.querySelector('.circular-progress');
    const responseRateTrend = activeSection.querySelector('.trend-container');
    const responseRateDetails = activeSection.querySelector('.details');
    
    if (responseRateProgress) {
        renderCircleProgressElement(responseRateProgress, currentResponseRate, reliabilityColor);
    }
    if (responseRateTrend) {
        renderTrendElement(responseRateTrend, responseTrend);
    }
    if (responseRateDetails) {
        responseRateDetails.innerHTML = `
            <div>N = ${dashboardData.responseRate.responses.toLocaleString()}</div>
            <div>Total Sample = ${dashboardData.responseRate.total.toLocaleString()}</div>
        `;
    }
    
    // Pulse Score Circle (1–5 scale)
    const pulseScore = dashboardData.pulseScore.current;
    const pulseScorePrevious = dashboardData.pulseScore.previous;
    const pulseTrend = Math.round((pulseScore - pulseScorePrevious) * 100) / 100; // Round to 2 decimal places
    const pulseScoreProgress = activeSection.querySelector('#pulseScoreProgress');
    const pulseScoreTrend = activeSection.querySelector('#pulseScoreTrend');
    
    if (pulseScoreProgress) {
        renderCircleProgressElement(pulseScoreProgress, pulseScore, null, true);
    }
    if (pulseScoreTrend) {
        renderTrendElement(pulseScoreTrend, pulseTrend, true);
    }
    
    // Flight Risk Circle (1–5 scale)
    const flightRiskTrend = Math.round((dashboardData.flightRisk.current - dashboardData.flightRisk.previous) * 100) / 100;
    const flightRiskProgress = activeSection.querySelector('#flightRiskProgress');
    const flightRiskTrendEl = activeSection.querySelector('#flightRiskTrend');
    
    if (flightRiskProgress) {
        renderCircleProgressElement(flightRiskProgress, dashboardData.flightRisk.current, null, true);
    }
    if (flightRiskTrendEl) {
        renderTrendElement(flightRiskTrendEl, flightRiskTrend, true);
    }
}

function renderCircleProgressElement(element, value, color, isLikertScore) {
    element.innerHTML = ''; // Clear existing content
    
    // If no specific color provided, use the default color scheme
    if (!color) {
        color = isLikertScore ? getProgressColorLikertFive(value) : getProgressColor(value);
    }
    
    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 36 36');
    svg.style.transform = 'rotate(-90deg)';
    
    // Calculate the stroke dash array and offset
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const dashArray = circumference;
    
    const visualValue = isLikertScore ? (value / 5) * 100 : value;
    const dashOffset = circumference * (1 - visualValue / 100);
    
    // Create background circle
    const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    bgCircle.setAttribute('cx', '18');
    bgCircle.setAttribute('cy', '18');
    bgCircle.setAttribute('r', radius.toString());
    bgCircle.setAttribute('fill', 'none');
    bgCircle.setAttribute('stroke', '#E5E5E5');
    bgCircle.setAttribute('stroke-width', '3');
    
    // Create progress circle
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '18');
    circle.setAttribute('cy', '18');
    circle.setAttribute('r', radius.toString());
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', color);
    circle.setAttribute('stroke-width', '3');
    circle.setAttribute('stroke-dasharray', dashArray.toString());
    circle.setAttribute('stroke-dashoffset', dashOffset.toString());
    circle.setAttribute('stroke-linecap', 'round');
    
    svg.appendChild(bgCircle);
    svg.appendChild(circle);
    
    // Create percentage text
    const percentage = document.createElement('div');
    percentage.className = 'percentage';
    percentage.textContent = isLikertScore ? `${value}` : `${value}%`;
    
    element.appendChild(svg);
    element.appendChild(percentage);
}

function renderCircleProgress(elementId, value, color, isLikertScore) {
    const element = document.getElementById(elementId);
    if (element) {
        renderCircleProgressElement(element, value, color, isLikertScore);
    }
}

function renderTrend(elementId, trendValue, isSixScale) {
    const element = document.getElementById(elementId);
    if (element) {
        renderTrendElement(element, trendValue, isSixScale);
    }
}

function renderTrendElement(element, trendValue, isSixScale) {
    const trendClass = getTrendClass(trendValue);
    const trendIcon = getTrendIcon(trendValue);
    
    element.innerHTML = `
        <div class="trend">
            <span class="${trendClass}">
                <i class="material-icons">${trendIcon}</i>${Math.abs(trendValue)}${isSixScale ? '' : '%'}
            </span>
            Since Previous Survey (2023)
        </div>
    `;
}

function getTrendClass(value) {
    if (value > 0) return 'trend-positive';
    if (value < 0) return 'trend-negative';
    return 'trend-neutral';
}

function getTrendIcon(value) {
    if (value > 0) return 'trending_up';
    if (value < 0) return 'trending_down';
    return 'trending_flat';
}

function renderDimensions() {
    // Get the active content section
    const activeSection = document.querySelector('.content-section.active');
    if (!activeSection) return;
    
    const dimensionsGrid = activeSection.querySelector('.dimensions-grid');
    if (!dimensionsGrid) return;
    
    dimensionsGrid.innerHTML = '';
    let activeDimensions = DIMENSION_CONFIG.getActiveDimensions();
    
    // Filter out Organisational Culture dimension when on EE-only page
    const currentSection = document.querySelector('.content-section.active');
    if (currentSection && currentSection.id === 'overview-ee') {
        activeDimensions = activeDimensions.filter(dimension => dimension.title !== 'Organisational Culture');
    }
    
    activeDimensions.forEach(dimensionConfig => {
        const dimensionData = dashboardData.dimensions.find(d => d.title === dimensionConfig.title);
        if (!dimensionData) return;
        const dimensionEl = document.createElement('div');
        dimensionEl.className = 'dimension-item';
        dimensionEl.setAttribute('data-dimension', dimensionConfig.id);
        let scale = 5;
        let progressClass = getProgressClassFiveScale(dimensionData.score);
        let scaleMarkers = [1, 2, 3, 4, 5];
        // All dimensions now use the 5-point scale
        const dimensionTrend = dimensionData.previous ? Math.round((dimensionData.score - dimensionData.previous.score) * 100) / 100 : 0;
        const trendClass = getTrendClass(dimensionTrend);
        const questionCount = dimensionConfig.originalQuestions.length;
        dimensionEl.innerHTML = `
            <div class="dimension-header">
                <div class="dimension-title">
                    <span class="dimension-color-indicator" style="background-color: ${dimensionConfig.color};"></span>
                    ${dimensionConfig.title} <span class="fw-normal">Average Score</span>
                </div>
                ${dimensionData.hasWarning ? '<div class="dimension-warning"><img src="images/error-circle.svg" alt="Warning"></div>' : ''}
            </div>
            <div class="dimension-description">${dimensionConfig.description}</div>
            <div class="d-flex align-items-end">
                <div class="dimension-score">${dimensionData.score}</div>
                <span class="dimension-stats scale"><strong>/${scale}</strong></span>
            </div>
            <div>
                <div class="progress-bar">
                    <div class="progress-fill ${progressClass}" style="width: ${(dimensionData.score / scale) * 100}%;"></div>
                </div>
                <div class="progress-scale-markers">
                    ${scaleMarkers.map(n => `<span>${n}</span>`).join('')}
                </div>
            </div>
            
            <div class="dimension-stats">
                <span><strong>${questionCount}</strong> Questions</span>
                <span>
                    <i class="material-icons ${trendClass}">${getTrendIcon(dimensionTrend)}</i>
                    ${dimensionTrend > 0 ? '+' : ''}${dimensionTrend} vs previous
                </span>
            </div>
        `;
        dimensionsGrid.appendChild(dimensionEl);
    });
}

function renderStatements() {
    // Get the active content section
    const activeSection = document.querySelector('.content-section.active');
    if (!activeSection) return;
    
    // Get active dimensions
    const activeDimensions = DIMENSION_CONFIG.getActiveDimensions();
    
    // Ensure statements are up to date with current config
    if (typeof regenerateStatements === 'function') {
        // Regenerate statements to ensure they match current config
        regenerateStatements();
    }
    
    // Render statements for each dimension separately
    activeDimensions.forEach(dimension => {
        const dimensionStatements = dashboardData.allStatements.filter(statement => 
            statement.dimension === dimension.title
        );
        
        if (dimensionStatements.length > 0) {
            // Sort statements by score (descending order)
            const sortedStatements = [...dimensionStatements].sort((a, b) => b.score - a.score);
            
            // Get top 3 and bottom 3 statements for this dimension
            const topStatements = sortedStatements.slice(0, 3);
            const bottomStatements = sortedStatements.slice(-3).reverse(); // Reverse to show lowest score first
            
            // Determine the scale and element IDs based on dimension
            let scale, topElementId, bottomElementId;
            
            if (dimension.title === "Employee Engagement") {
                scale = 5;
                topElementId = 'topEngagementStatements';
                bottomElementId = 'bottomEngagementStatements';
            } else if (dimension.title === "Organisational Culture") {
                scale = 5;
                topElementId = 'topOrganisationalCultureStatements';
                bottomElementId = 'bottomOrganisationalCultureStatements';
            }
            
            if (topElementId && bottomElementId) {
                // Find elements within the active section, trying both ID patterns
                let topElement = activeSection.querySelector(`#${topElementId}`);
                let bottomElement = activeSection.querySelector(`#${bottomElementId}`);
                
                // If not found, try with EE suffix for the overview-ee page
                if (!topElement) {
                    topElement = activeSection.querySelector(`#${topElementId}EE`);
                }
                if (!bottomElement) {
                    bottomElement = activeSection.querySelector(`#${bottomElementId}EE`);
                }
                
                if (topElement) {
                    renderStatementsColumnElement(topElement, topStatements, scale, dimension.title);
                }
                if (bottomElement) {
                    renderStatementsColumnElement(bottomElement, bottomStatements, scale, dimension.title);
                }
            }
        }
    });
    
    // Setup legend sticky behavior
    setupStatementsLegendSticky();
}

function renderAllStatements(elementId, statements) {
    const container = document.getElementById(elementId);
    container.innerHTML = ''; // Clear existing content
    
    statements.forEach((statement, index) => {
        const statementEl = document.createElement('div');
        statementEl.className = 'statement-item';
        
        const progressClass = getProgressClassFiveScale(statement.score);
        
        statementEl.innerHTML = `
            <div class="statement-header">
                <div class="statement-rank">#${index + 1}</div>
                <div class="statement-dimension">${statement.dimension}</div>
            </div>
            <div class="statement-text">${statement.text}</div>
            <div class="statement-score">
                <div class="score-value">${statement.score}</div>
                <div class="score-scale">/5</div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill ${progressClass}" style="width: ${(statement.score / 5) * 100}%"></div>
            </div>
        `;
        
        container.appendChild(statementEl);
    });
}

function renderStatementsColumnByDimension(elementId, statements, scale, dimensionTitle) {
    const container = document.getElementById(elementId);
    if (container) {
        renderStatementsColumnElement(container, statements, scale, dimensionTitle);
    }
}

function renderStatementsColumnElement(container, statements, scale, dimensionTitle) {
    container.innerHTML = ''; // Clear existing content
    
    // Filter and sort statements for this specific dimension for ranking
    const dimensionStatements = dashboardData.allStatements.filter(statement => 
        statement.dimension === dimensionTitle
    );
    const sortedDimensionStatements = [...dimensionStatements].sort((a, b) => b.score - a.score);
    
    statements.forEach((statement, index) => {
        const statementEl = document.createElement('div');
        statementEl.className = 'statement-item';
        
        const progressClass = getProgressClassFiveScale(statement.score);
        
        // Calculate rank within this dimension only
        const dimensionRank = sortedDimensionStatements.findIndex(s => s.text === statement.text) + 1;
        
        // Calculate trend value and get trend info
        const trendValue = (statement.score - statement.previousScore).toFixed(2);
        const numericTrend = statement.score - statement.previousScore;
        const trendIcon = getTrendIcon(numericTrend);
        const trendClass = getTrendClass(numericTrend);
        
        statementEl.innerHTML = `
            <div class="statement-header">
                <div class="statement-rank">#${dimensionRank}</div>
                <div class="statement-dimension">${statement.dimension}</div>
            </div>
            <div class="statement-text">${statement.text}</div>
            <div class="statement-score">
                <div class="score-value">${statement.score}</div>
                <div class="score-scale">/${scale}</div>
                <span class="statement-trend">
                    <i class="material-icons ${trendClass}">${trendIcon}</i>
                    ${trendValue >= 0 ? '+' : ''}${trendValue} vs previous
                </span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill ${progressClass}" style="width: ${(statement.score / scale) * 100}%"></div>
            </div>
        `;
        
        container.appendChild(statementEl);
    });
}

function renderStatementsColumn(elementId, statements) {
    const container = document.getElementById(elementId);
    container.innerHTML = ''; // Clear existing content
    
    // Get active dimension titles for ranking
    const activeDimensions = DIMENSION_CONFIG.getActiveDimensions();
    const activeDimensionTitles = activeDimensions.map(dim => dim.title);
    
    // Filter and sort active statements for ranking
    const activeStatements = dashboardData.allStatements.filter(statement => 
        activeDimensionTitles.includes(statement.dimension)
    );
    const sortedActiveStatements = [...activeStatements].sort((a, b) => b.score - a.score);
    
    statements.forEach((statement, index) => {
        const statementEl = document.createElement('div');
        statementEl.className = 'statement-item';
        
        const progressClass = getProgressClassFiveScale(statement.score);
        
        // Calculate rank within active dimensions only
        const overallRank = sortedActiveStatements.findIndex(s => s.text === statement.text) + 1;
        
        // Calculate trend value and get trend info
        const trendValue = (statement.score - statement.previousScore).toFixed(2);
        const numericTrend = statement.score - statement.previousScore;
        const trendIcon = getTrendIcon(numericTrend);
        const trendClass = getTrendClass(numericTrend);
        
        statementEl.innerHTML = `
            <div class="statement-header">
                <div class="statement-rank">#${overallRank}</div>
                <div class="statement-dimension">${statement.dimension}</div>
            </div>
            <div class="statement-text">${statement.text}</div>
            <div class="statement-score">
                <div class="score-value">${statement.score}</div>
                <div class="score-scale">/5</div>
                <span class="statement-trend">
                    <i class="material-icons ${trendClass}">${trendIcon}</i>
                    ${trendValue >= 0 ? '+' : ''}${trendValue} vs previous
                </span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill ${progressClass}" style="width: ${(statement.score / 5) * 100}%"></div>
            </div>
        `;
        
        container.appendChild(statementEl);
    });
}

function setupStatementsLegendSticky() {
    const statementsSection = document.querySelector('.statements-section');
    const legends = document.querySelectorAll('.statements-legend');
    
    if (!statementsSection || legends.length === 0) return;
    
    // Create intersection observer to watch the statements section
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Statements section is visible, make all legends sticky
                legends.forEach(legend => {
                    legend.style.position = 'sticky';
                });
            } else {
                // Statements section is not visible, make all legends static
                legends.forEach(legend => {
                    legend.style.position = 'static';
                });
            }
        });
    }, {
        // Trigger when any part of the statements section is visible
        threshold: 0,
        // Add some margin to trigger slightly before/after
        rootMargin: '0px 0px -50px 0px'
    });
    
    observer.observe(statementsSection);
}

function renderSentiment() {
    const sentimentChart = document.getElementById('sentimentChart');
    const sentimentAnalysis = document.getElementById('sentimentAnalysis');
    
    // Check if elements exist before proceeding
    if (!sentimentChart || !sentimentAnalysis) {
        console.log('Original sentiment elements not found - using dimension-specific sentiment instead');
        return;
    }
    
    // Clear any existing content
    sentimentChart.innerHTML = '';
    sentimentAnalysis.innerHTML = '';
    
    // Create and style the chart container
    const chartContainer = document.createElement('div');
    chartContainer.style.display = 'flex';
    chartContainer.style.alignItems = 'center';
    chartContainer.style.gap = '24px';
    
    // Create tooltip div
    const tooltip = document.createElement('div');
    tooltip.className = 'chart-tooltip';
    tooltip.style.display = 'none';
    chartContainer.appendChild(tooltip);
    
    // Render donut chart
    const canvas = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 300 * dpr;
    canvas.height = 300 * dpr;
    canvas.style.width = '300px';
    canvas.style.height = '300px';
    
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    const centerX = 150;
    const centerY = 150;
    const radius = 140;
    const innerRadius = radius * 0.7;
    
    // Calculate actual comment numbers based on percentages
    const totalComments = dashboardData.sentiment.totalComments;
    const positiveComments = Math.round(totalComments * (dashboardData.sentiment.positive / 100));

    console.log('positiveComments', positiveComments);
    const neutralComments = Math.round(totalComments * (dashboardData.sentiment.neutral / 100));
    const negativeComments = Math.round(totalComments * (dashboardData.sentiment.negative / 100));
    
    // Store segment data for hover detection
    const segments = [
        {
            name: 'Positive',
            percentage: dashboardData.sentiment.positive,
            comments: positiveComments,
            color: '#00AE4E',
            startAngle: 0,
            endAngle: 0
        },
        {
            name: 'Neutral',
            percentage: dashboardData.sentiment.neutral,
            comments: neutralComments,
            color: '#FFB800',
            startAngle: 0,
            endAngle: 0
        },
        {
            name: 'Negative',
            percentage: dashboardData.sentiment.negative,
            comments: negativeComments,
            color: '#FF0000',
            startAngle: 0,
            endAngle: 0
        }
    ];
    
    // Calculate and store angles
    let currentAngle = 0;
    segments.forEach(segment => {
        segment.startAngle = currentAngle;
        segment.endAngle = currentAngle + (Math.PI * 2 * (segment.percentage / 100));
        currentAngle = segment.endAngle;
    });
    
    function drawDonutSegment(segment) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, segment.startAngle, segment.endAngle);
        ctx.arc(centerX, centerY, innerRadius, segment.endAngle, segment.startAngle, true);
        ctx.closePath();
        ctx.fillStyle = segment.color;
        ctx.fill();
    }
    
    // Draw all segments
    segments.forEach(drawDonutSegment);
    
    // Wait for font to load before drawing text
    document.fonts.ready.then(() => {
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.font = '600 16px Montserrat';
        ctx.fillText('Total Comments', centerX, centerY - 15);
        
        ctx.font = '600 24px Montserrat';
        ctx.fillText(totalComments.toLocaleString(), centerX, centerY + 15);
    });
    
    chartContainer.appendChild(canvas);
    
    // Add legend with updated format
    const legendEl = document.createElement('div');
    legendEl.className = 'sentiment-legend';
    legendEl.innerHTML = segments.map(segment => `
        <div class="legend-item">
            <div class="legend-dot ${segment.name.toLowerCase()}"></div>
            <span>${segment.name}:<br/>${segment.comments.toLocaleString()} <strong>(${segment.percentage}%)</strong></span>
        </div>
    `).join('');
    
    chartContainer.appendChild(legendEl);
    sentimentChart.appendChild(chartContainer);
    
    // Render sentiment analysis themes
    const maxComments = Math.max(
        ...dashboardData.sentimentAnalysis.positive.map(item => item.comments),
        ...dashboardData.sentimentAnalysis.negative.map(item => item.comments)
    );

    renderAnalysisList(
        dashboardData.sentimentAnalysis.positive, 
        'Top 5 Positive Themes',
        maxComments,
        'positive'
    );
    renderAnalysisList(
        dashboardData.sentimentAnalysis.negative, 
        'Bottom 5 Negative Themes',
        maxComments,
        'negative'
    );
}

function renderAnalysisList(items, titleText, maxComments, type) {
    const sentimentAnalysis = document.getElementById('sentimentAnalysis');
    
    const analysisSection = document.createElement('div');
    analysisSection.className = 'analysis-section';
    
    const title = document.createElement('h4');
    title.textContent = titleText;
    analysisSection.appendChild(title);
    
    const analysisList = document.createElement('div');
    analysisList.className = 'analysis-list';
    
    items.forEach(item => {
        const analysisItem = document.createElement('div');
        analysisItem.className = 'analysis-item';
        
        // Calculate width relative to the theme with the most comments
        const barWidth = (item.comments / maxComments) * 100;
        
        analysisItem.innerHTML = `
            <div class="analysis-header">
                <div class="theme-name">${item.theme}</div>
                <div class="comment-count">${item.comments} comments</div>
            </div>
            <div class="analysis-bar">
                <div class="analysis-bar-fill ${type}" style="width: ${barWidth}%"></div>
            </div>
        `;
        analysisList.appendChild(analysisItem);
    });
    
    analysisSection.appendChild(analysisList);
    sentimentAnalysis.appendChild(analysisSection);
}

function setupFilters() {
    const filterToggle = document.getElementById('filterToggle');
    const filterMenu = document.getElementById('filterMenu');
    const closeFilters = document.getElementById('closeFilters');
    const clearFilters = document.getElementById('clearFilters');
    const applyFilters = document.getElementById('applyFilters');
    const container = document.querySelector('.container');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const activeFiltersContainer = document.getElementById('activeFilters');
    
    console.log('setupFilters called - elements found:', {
        filterToggle: !!filterToggle,
        filterMenu: !!filterMenu
    });

    // Toggle filter menu for main overview page
    filterToggle.addEventListener('click', () => {
        const isMenuOpen = filterMenu.classList.contains('active');
        if (isMenuOpen) {
            filterMenu.classList.remove('active');
            container.classList.remove('filter-active');
        } else {
            filterMenu.classList.add('active');
            container.classList.add('filter-active');
        }
    });

    // Toggle filter menu for EE-only page
    const filterToggleEE = document.getElementById('filterToggleEE');
    console.log('filterToggleEE found:', !!filterToggleEE);
    if (filterToggleEE) {
        filterToggleEE.addEventListener('click', () => {
            const isMenuOpen = filterMenu.classList.contains('active');
            if (isMenuOpen) {
                filterMenu.classList.remove('active');
                container.classList.remove('filter-active');
            } else {
                filterMenu.classList.add('active');
                container.classList.add('filter-active');
            }
        });
    }

    closeFilters.addEventListener('click', () => {
        filterMenu.classList.remove('active');
        container.classList.remove('filter-active');
    });

    // Setup organization levels (legacy code - now handled by new dropdown structure)
    const orgLevelsContainer = document.getElementById('orgLevels');
    if (orgLevelsContainer && dashboardData.organizationLevels) {
        dashboardData.organizationLevels.levels.forEach((level, index) => {
            const levelGroup = document.createElement('div');
            levelGroup.className = 'filter-group';
            
            levelGroup.innerHTML = `
                <h4>${level.name}</h4>
                <div class="filter-options">
                    ${level.options.map(option => `
                        <label>
                            <input type="checkbox" 
                                   name="org-${index}" 
                                   value="${option}"
                                   data-level="${level.name}"> ${option}
                        </label>
                    `).join('')}
                </div>
            `;
            
            orgLevelsContainer.appendChild(levelGroup);
        });
    }

    // Handle clear filters
    clearFilters.addEventListener('click', async () => {
        // Clear checkboxes
        filterMenu.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });

        // Reset active filters
        activeFilters = {
            organization: {},
            demographics: {
                age: [],
                gender: [],
                race: [],
                jobLevel: []
            }
        };
        
        // Show loading overlay
        loadingOverlay.classList.add('active');

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Clear active filters display
            activeFiltersContainer.innerHTML = '';

            // Restore original data
            restoreOriginalData();
            renderAllData();
        } finally {
            // Hide loading overlay
            loadingOverlay.classList.remove('active');
        }
    });

    // Handle apply filters
    applyFilters.addEventListener('click', async () => {
        await applyActiveFilters();
    });
}

async function applyActiveFilters() {
    // Update organization filters
    activeFilters.organization = {};
    document.querySelectorAll('input[name^="org-"]').forEach(checkbox => {
        if (checkbox.checked) {
            const level = checkbox.dataset.level;
            if (!activeFilters.organization[level]) {
                activeFilters.organization[level] = [];
            }
            activeFilters.organization[level].push(checkbox.value);
        }
    });

    // Update demographic filters
    ['age', 'gender', 'race', 'jobLevel'].forEach(type => {
        activeFilters.demographics[type] = Array.from(
            document.querySelectorAll(`input[name="${type}"]:checked`)
        ).map(checkbox => checkbox.value);
    });

    // Close filter menu if open
    const filterMenu = document.getElementById('filterMenu');
    const container = document.querySelector('.container');
    filterMenu.classList.remove('active');
    container.classList.remove('filter-active');

    // Show loading overlay
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.add('active');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Update active filters display
    updateActiveFiltersDisplay();

    // Simulate data changes
    simulateDataChanges();

    // Hide loading overlay
    loadingOverlay.classList.remove('active');
}

function updateActiveFiltersDisplay() {
    const activeFiltersContainer = document.getElementById('activeFilters');
    const loadingOverlay = document.getElementById('loadingOverlay');
    activeFiltersContainer.innerHTML = '';

    let hasActiveFilters = false;

    // Add organization filters
    Object.entries(activeFilters.organization).forEach(([level, values]) => {
        if (values && values.length > 0) {
            values.forEach(value => {
                addFilterTag(`${level}: ${value}`, level, value);
                hasActiveFilters = true;
            });
        }
    });

    // Add demographic filters
    Object.entries(activeFilters.demographics).forEach(([type, values]) => {
        if (values && values.length > 0) {
            values.forEach(value => {
                addFilterTag(`${type.charAt(0).toUpperCase() + type.slice(1)}: ${value}`, type, value);
                hasActiveFilters = true;
            });
        }
    });

    // If no filters are active, restore original data
    if (!hasActiveFilters) {
        restoreOriginalData();
        renderAllData();
        // Ensure loading overlay is hidden
        loadingOverlay.classList.remove('active');
    }
}

function addFilterTag(text, filterType, filterValue) {
    const activeFiltersContainer = document.getElementById('activeFilters');
    const tag = document.createElement('div');
    tag.className = 'filter-tag';
    tag.innerHTML = `
        ${text}
        <span class="remove-filter" data-type="${filterType}" data-value="${filterValue}">×</span>
    `;

    // Add click handler to remove filter
    tag.querySelector('.remove-filter').addEventListener('click', async () => {
        // Show loading overlay
        const loadingOverlay = document.getElementById('loadingOverlay');
        loadingOverlay.classList.add('active');

        try {
            // Remove the checkbox selection
            const checkbox = document.querySelector(`input[data-level="${filterType}"][value="${filterValue}"], input[name="${filterType}"][value="${filterValue}"]`);
            if (checkbox) {
                checkbox.checked = false;
            }

            // Remove from activeFilters
            if (filterType in activeFilters.organization) {
                activeFilters.organization[filterType] = activeFilters.organization[filterType].filter(v => v !== filterValue);
                if (activeFilters.organization[filterType].length === 0) {
                    delete activeFilters.organization[filterType];
                }
            } else {
                activeFilters.demographics[filterType] = activeFilters.demographics[filterType].filter(v => v !== filterValue);
            }

            // Remove the tag from UI immediately
            tag.remove();

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Check if this was the last filter
            const hasRemainingFilters = 
                Object.keys(activeFilters.organization).length > 0 || 
                Object.values(activeFilters.demographics).some(arr => arr && arr.length > 0);

            if (!hasRemainingFilters) {
                // If no filters remain, restore original data
                restoreOriginalData();
                renderAllData();
            } else {
                // Only simulate changes if there are still active filters
                simulateDataChanges();
                updateActiveFiltersDisplay();
            }

        } finally {
            // Always ensure the loading overlay is hidden
            loadingOverlay.classList.remove('active');
        }
    });

    activeFiltersContainer.appendChild(tag);
}

function renderAllData() {
    renderMetrics();
    renderDimensions();
    renderStatements();
    renderSentiment();
    renderReliabilityIndicator();
    
    // Render dimension-specific sentiment
    renderDimensionSentiment('engagement');
    renderDimensionSentiment('organisationalCulture');
}

function simulateDataChanges() {
    // Simulate random changes (1–5 scale)
    dashboardData.responseRate.responses = Math.floor(dashboardData.responseRate.total * (Math.random() * 0.3 + 0.5));
    dashboardData.pulseScore.current = parseFloat((Math.random() * 1.49 + 3.51).toFixed(2)); // Range ~3.51–5
    dashboardData.flightRisk.current = parseFloat((Math.random() * 1.5 + 2.0).toFixed(2)); // Range 2.0-3.5

    // Update dimensions with random 1–5 scale scores
    dashboardData.dimensions.forEach(dimension => {
        dimension.score = parseFloat((Math.random() * 2 + 3.0).toFixed(2)); // Range 3.0-5.0
        dimension.trend = parseFloat((Math.random() * 0.4 - 0.2).toFixed(2)); // Range -0.2 to +0.2
    });

    // Update all statements with random 1–5 scale scores
    dashboardData.allStatements.forEach(statement => {
        statement.score = parseFloat((Math.random() * 2 + 3.0).toFixed(2)); // Range 3.0-5.0
        statement.trend = parseFloat((Math.random() * 0.4 - 0.2).toFixed(2)); // Range -0.2 to +0.2
    });

    // Re-render everything
    renderAllData();
}

function getReliabilityThresholds(totalParticipants) {
    return totalParticipants <= RELIABILITY_THRESHOLDS.small_group.max_participants
        ? RELIABILITY_THRESHOLDS.small_group
        : RELIABILITY_THRESHOLDS.default;
}

function getReliabilityStatus(responseRate, totalParticipants) {
    const thresholds = getReliabilityThresholds(totalParticipants);
    
    if (responseRate >= thresholds.high) return 'high';
    if (responseRate >= thresholds.moderate) return 'moderate';
    return 'low';
}

function calculateRemainingResponses(responses, total) {
    const thresholds = getReliabilityThresholds(total);
    const targetResponses = Math.ceil(total * (thresholds.high / 100));
    return Math.max(0, targetResponses - responses);
}

function getReliabilityColor(status) {
    switch (status) {
        case 'high': return '#00AE4E';
        case 'moderate': return '#FFB800';
        case 'low': return '#FF6B6B';
    }
}

function renderReliabilityIndicator() {
    // Get the active content section
    const activeSection = document.querySelector('.content-section.active');
    if (!activeSection) return;
    
    const element = activeSection.querySelector('.reliability-indicator');
    // Look for the specific reliability footer element
    let footer = activeSection.querySelector('#reliabilityFooter');
    if (!footer) {
        footer = activeSection.querySelector('#reliabilityFooterEE');
    }
    if (!element || !footer) return;
    
    const totalParticipants = dashboardData.responseRate.total;
    const responseRate = calculateResponseRate(dashboardData.responseRate.responses, totalParticipants);
    const status = getReliabilityStatus(responseRate, totalParticipants);
    const thresholds = getReliabilityThresholds(totalParticipants);
    
    // Use more positive language
    const statusLabels = {
        'high': 'Excellent',
        'moderate': 'Good', 
        'low': 'Fair'
    };
    const statusText = statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1);
    const remainingResponses = calculateRemainingResponses(
        dashboardData.responseRate.responses,
        totalParticipants
    );
    
    element.innerHTML = `
        <div class="intro-text">
            Current response target progress:
        </div>
        <div class="reliability-status">
            <div class="status-icon ${status}"></div>
            <strong>${statusText}</strong> ${dashboardData.responseRate.responses.toLocaleString()} / ${totalParticipants.toLocaleString()} (${responseRate}%)
        </div>
        <div class="reliability-progress">
            <div class="reliability-bar">
                <div class="reliability-bar-fill" style="width: ${responseRate}%; background: ${STATUS_COLORS[status]}"></div>
            </div>
            <div class="reliability-thresholds">
                <div class="threshold-marker" style="left: ${thresholds.moderate}%">
                    <div class="marker-line"></div>
                    <span class="threshold-label">${thresholds.moderate}%</span>
                </div>
                <div class="threshold-marker" style="left: ${thresholds.high}%">
                    <div class="marker-line"></div>
                    <span class="threshold-label">${thresholds.high}%</span>
                </div>
            </div>
        </div>
    `;

    footer.innerHTML = `
        <div class="trend">
            <strong>${remainingResponses.toLocaleString()}</strong> more responses needed for Excellent target
        </div>
    `;
}

function restoreOriginalData() {
    // Properly restore each section of the data
    dashboardData.responseRate = { ...originalData.responseRate };
    dashboardData.pulseScore = { ...originalData.pulseScore };
    dashboardData.flightRisk = { ...originalData.flightRisk };
    dashboardData.dimensions = originalData.dimensions.map(d => ({...d}));
    dashboardData.sentiment = { ...originalData.sentiment };
    dashboardData.sentimentAnalysis = {
        positive: [...originalData.sentimentAnalysis.positive],
        negative: [...originalData.sentimentAnalysis.negative]
    };
    dashboardData.allStatements = originalData.allStatements.map(s => ({...s}));
    dashboardData.organizationLevels = {
        levels: originalData.organizationLevels.levels.map(l => ({...l}))
    };
}

function generatePDF() {
    // Get the container element
    const element = document.querySelector('.container');
    
    // Basic configuration with improved settings
    const opt = {
        margin: [10, 10, 10, 10],
        filename: 'dashboard.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            logging: true,
            allowTaint: true,
            foreignObjectRendering: true,
            removeContainer: true,
            scrollY: 0,
            onclone: function(clonedDoc) {
                // Handle the cloned document
                const clone = clonedDoc.querySelector('.container');
                
                // Ensure material icons are loaded
                const iconLink = clonedDoc.createElement('link');
                iconLink.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
                iconLink.rel = 'stylesheet';
                clonedDoc.head.appendChild(iconLink);
                
                // Reset container styles
                clone.style.width = '100%';
                clone.style.maxWidth = '100%';
                clone.style.margin = '0';
                clone.style.padding = '10px';
                clone.style.boxSizing = 'border-box';
                
                // Force grid layouts
                const grids = clone.querySelectorAll('.metrics-grid, .dimensions-grid');
                grids.forEach(grid => {
                    grid.style.display = 'grid';
                    grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
                    grid.style.gap = '20px';
                    grid.style.width = '100%';
                    grid.style.pageBreakInside = 'avoid';
                });

                // Ensure all sections stay together
                const sections = clone.querySelectorAll('.metrics-section, .dimensions-section, .statements-section, .sentiment-section');
                sections.forEach(section => {
                    section.style.pageBreakInside = 'avoid';
                    section.style.marginBottom = '20px';
                    section.style.width = '100%';
                });

                // Handle SVG elements
                const svgElements = clone.querySelectorAll('svg');
                svgElements.forEach(svg => {
                    svg.style.width = '100%';
                    svg.style.height = '100%';
                    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                });

                // Handle canvas elements
                const canvasElements = clone.querySelectorAll('canvas');
                canvasElements.forEach(canvas => {
                    canvas.style.width = '100%';
                    canvas.style.height = '100%';
                });

                // Ensure material icons are visible
                const icons = clone.querySelectorAll('.material-icons');
                icons.forEach(icon => {
                    icon.style.fontFamily = 'Material Icons';
                    icon.style.fontSize = '24px';
                    icon.style.display = 'inline-block';
                });
            }
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'landscape',
            compress: true
        }
    };

    // Show loading overlay
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.add('active');

    // Wait for fonts to load before generating PDF
    Promise.all([
        document.fonts.ready,
        new Promise(resolve => {
            const link = document.createElement('link');
            link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
            link.rel = 'stylesheet';
            link.onload = resolve;
            document.head.appendChild(link);
        })
    ]).then(() => {
        // Generate PDF
        html2pdf()
            .set(opt)
            .from(element)
            .toPdf()
            .get('pdf')
            .then((pdf) => {
                pdf.save();
                loadingOverlay.classList.remove('active');
            })
            .catch(err => {
                console.error('PDF generation failed:', err);
                loadingOverlay.classList.remove('active');
                alert('PDF generation failed. Please try again.');
            });
    });
}

// Back to Survey functionality
document.addEventListener('DOMContentLoaded', function() {
    // Navigation tabs functionality with memory
    const navTabs = document.querySelectorAll('.nav-tab');
    const contentSections = document.querySelectorAll('.content-section');
    
    // Get the last active tab from localStorage, default to 'overview'
    const lastActiveTab = localStorage.getItem('lastActiveTab') || 'overview';
    
    // Function to switch to a specific tab
    function switchToTab(targetSection, updateURL = true) {
        // Remove active class from all tabs and sections
        navTabs.forEach(t => t.classList.remove('active'));
        contentSections.forEach(s => s.classList.remove('active'));
        
        // Add active class to target tab and corresponding section
        const targetTab = document.querySelector(`[data-section="${targetSection}"]`);
        const targetContent = document.getElementById(targetSection);
        
        if (targetTab && targetContent) {
            targetTab.classList.add('active');
            targetContent.classList.add('active');
            // Save to localStorage
            localStorage.setItem('lastActiveTab', targetSection);
            
            // Close filter menu when switching pages
            const filterMenu = document.getElementById('filterMenu');
            const container = document.querySelector('.container');
            if (filterMenu && container) {
                filterMenu.classList.remove('active');
                container.classList.remove('filter-active');
            }
            
            // Render content for Overview (EE only)
            if (targetSection === 'overview-ee') {
                setTimeout(() => {
                    // Simulate MFC user - automatically apply Mass and Foundation Cluster filter
                    simulateMFCUserFilter();
                    renderAllData();
                    setupDimensionTabs();
                }, 100);
            }
            
            // Setup dimension tabs for overview pages
            if (targetSection === 'overview' || targetSection === 'overview-ee') {
                setTimeout(() => {
                    setupDimensionTabs();
                }, 100);
            }
        }
    }

    // Function to get section from URL hash (removed - no longer using hash navigation)
    function getSectionFromURL() {
        return null; // Always return null to disable hash navigation
    }

    // Function to handle URL hash changes (removed - no longer using hash navigation)
    function handleHashChange() {
        // Disabled hash navigation
    }

    // Listen for hash changes (browser back/forward buttons) - disabled
    // window.addEventListener('hashchange', handleHashChange);
    
    navTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetSection = this.getAttribute('data-section');
            switchToTab(targetSection);
        });
    });
    
    // Use localStorage for initial section, but force 'overview' on root URL
    const currentPath = window.location.pathname;
    const isRootOrIndex = currentPath === '/' || currentPath === '/index.html' || currentPath.endsWith('/index.html');
    const initialSection = isRootOrIndex ? 'overview' : lastActiveTab;
    switchToTab(initialSection, false); // Don't update URL
});

// Report Builder Functions
function setupReportBuilder() {
    // Report type selection
    const reportTypeCards = document.querySelectorAll('.report-type-card');
    reportTypeCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove previous selection
            reportTypeCards.forEach(c => c.classList.remove('selected'));
            // Add selection to clicked card
            card.classList.add('selected');
            
            const reportType = card.getAttribute('data-report-type');
            reportBuilderState.selectedReportType = reportType;
            
            // Show/hide comments filters based on report type
            const commentsFilters = document.getElementById('commentsFilters');
            if (reportType === 'comments-analysis') {
                commentsFilters.style.display = 'block';
            } else {
                commentsFilters.style.display = 'none';
            }
        });
    });

    // Additional filters
    setupAdditionalFilters();

    // Comments filters
    setupCommentsFilters();

    // Export options
    setupExportOptions();

    // Action buttons
    // The following lines are obsolete and should be removed:
    // const generateReportBtn = document.getElementById('generateReport');
    // const exportReport = document.getElementById('exportReport');
    // generateReportBtn.addEventListener('click', generateReport);
    // exportReport.addEventListener('click', generateReport);
}

function setupAdditionalFilters() {
    // Age filters
    const ageCheckboxes = document.querySelectorAll('input[name="reportAge"]');
    ageCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateAdditionalFilters();
        });
    });

    // Job level filters
    const jobLevelCheckboxes = document.querySelectorAll('input[name="reportJobLevel"]');
    jobLevelCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateAdditionalFilters();
        });
    });
}

function updateAdditionalFilters() {
    const selectedAges = Array.from(document.querySelectorAll('input[name="reportAge"]:checked')).map(cb => cb.value);
    const selectedJobLevels = Array.from(document.querySelectorAll('input[name="reportJobLevel"]:checked')).map(cb => cb.value);
    
    // Handle "all" options
    const ageFilters = selectedAges.includes('all') ? ['all'] : selectedAges;
    const jobLevelFilters = selectedJobLevels.includes('all') ? ['all'] : selectedJobLevels;
    
    reportBuilderState.additionalFilters.age = ageFilters;
    reportBuilderState.additionalFilters.jobLevel = jobLevelFilters;
}

function setupCommentsFilters() {
    // Sentiment filters
    const sentimentCheckboxes = document.querySelectorAll('input[name="reportSentiment"]');
    sentimentCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateCommentsFilters();
        });
    });

    // Volume filters
    const volumeCheckboxes = document.querySelectorAll('input[name="reportVolume"]');
    volumeCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateCommentsFilters();
        });
    });

    // Time period filters
    const timePeriodRadios = document.querySelectorAll('input[name="reportTimePeriod"]');
    timePeriodRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            updateCommentsFilters();
        });
    });
}

function updateCommentsFilters() {
    const selectedSentiment = Array.from(document.querySelectorAll('input[name="reportSentiment"]:checked')).map(cb => cb.value);
    const selectedVolume = Array.from(document.querySelectorAll('input[name="reportVolume"]:checked')).map(cb => cb.value);
    const selectedTimePeriod = document.querySelector('input[name="reportTimePeriod"]:checked')?.value || 'all';
    
    // Handle "all" options
    const sentimentFilters = selectedSentiment.includes('all') ? ['all'] : selectedSentiment;
    const volumeFilters = selectedVolume.includes('all') ? ['all'] : selectedVolume;
    
    reportBuilderState.commentsFilters.sentiment = sentimentFilters;
    reportBuilderState.commentsFilters.volume = volumeFilters;
    reportBuilderState.commentsFilters.timePeriod = selectedTimePeriod;
}

function setupExportOptions() {
    // Format selection
    const formatRadios = document.querySelectorAll('input[name="exportFormat"]');
    formatRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            reportBuilderState.exportOptions.format = radio.value;
        });
    });

    // Include options
    const includeCheckboxes = document.querySelectorAll('input[name="includeCharts"], input[name="includeTables"], input[name="includeInsights"], input[name="includeRecommendations"]');
    includeCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            reportBuilderState.exportOptions[checkbox.name] = checkbox.checked;
        });
    });
}

function generateReport() {
    if (!reportBuilderState.selectedReportType) {
        alert('Please select a report type first.');
        return;
    }

    const format = reportBuilderState.exportOptions.format;
    
    if (format === 'online') {
        // Generate and display online report
        displayOnlineReport();
    } else {
        // Handle other export formats
        const reportName = `${reportBuilderState.selectedReportType}-report-${new Date().toISOString().split('T')[0]}`;
        alert(`Generating ${reportName} as ${format.toUpperCase()}...\n\nThis would generate a ${format} file with the current report data and filters.`);
    }
}

function displayOnlineReport() {
    const modal = document.getElementById('onlineReportModal');
    const reportTitle = document.getElementById('reportTitle');
    const reportContent = document.getElementById('reportContent');
    
    // Set report title
    const reportTypeNames = {
        'executive': 'Executive Summary Report',
        'score-breakdown': 'Score Breakdown Report',
        'dimension-analysis': 'Dimension Analysis Report',
        'statement-performance': 'Statement Performance Report',
        'trend-analysis': 'Trend Analysis Report',
        'action-planning': 'Action Planning Report',
        'comments-analysis': 'Comments Analysis Report'
    };
    
    reportTitle.textContent = reportTypeNames[reportBuilderState.selectedReportType] || 'Report';
    
    // Generate report content
    const content = generateReportContent();
    reportContent.innerHTML = content;
    
    // Initialize charts for Comments Analysis report
    if (reportBuilderState.selectedReportType === 'comments-analysis') {
        const selectedUnits = reportBuilderState.selectedBusinessUnits.length > 0 ? 
            reportBuilderState.selectedBusinessUnits : 
            dashboardData.businessUnits.map(unit => unit.name);
        
        const filteredCommentsByUnit = {};
        selectedUnits.forEach(unit => {
            if (dashboardData.comments?.commentsByBusinessUnit && dashboardData.comments.commentsByBusinessUnit[unit]) {
                filteredCommentsByUnit[unit] = dashboardData.comments.commentsByBusinessUnit[unit];
            }
        });
        
        // Render sentiment chart
        setTimeout(() => {
            renderReportSentimentChart(reportContent, filteredCommentsByUnit);
        }, 100);
    }
    
    // Show modal
    modal.classList.add('active');
}

function generateReportContent() {
    const reportType = reportBuilderState.selectedReportType;
    const selectedUnits = reportBuilderState.selectedBusinessUnits.length > 0 
        ? reportBuilderState.selectedBusinessUnits 
        : dashboardData.businessUnits.map(unit => unit.name);

    const filteredData = dashboardData.businessUnits.filter(unit => selectedUnits.includes(unit.name));
    
    switch (reportType) {
        case 'executive':
            return generateExecutiveReportContent(filteredData);
        case 'score-breakdown':
            return generateScoreBreakdownReportContent(filteredData);
        case 'dimension-analysis':
            return generateDimensionAnalysisReportContent(filteredData);
        case 'statement-performance':
            return generateStatementPerformanceReportContent();
        case 'trend-analysis':
            return generateTrendAnalysisReportContent(filteredData);
        case 'action-planning':
            return generateActionPlanningReportContent(filteredData);
        case 'comments-analysis':
            return generateCommentsAnalysisReportContent(selectedUnits);
        default:
            return '<p>Report content not available.</p>';
    }
}

function generateExecutiveReportContent(filteredData) {
    const avgPulseScore = calculateAveragePulseScore(filteredData);
    const avgResponseRate = calculateAverageResponseRate(filteredData);
    
    return `
        <div class="report-section">
            <h3>Executive Summary</h3>
            <p>High-level overview of organizational culture performance across selected business units.</p>
            
            <div class="report-metrics">
                <div class="metric-card">
                    <h5>Average Pulse Score</h5>
                    <div class="value">${avgPulseScore.toFixed(2)}</div>
                </div>
                <div class="metric-card">
                    <h5>Average Response Rate</h5>
                    <div class="value">${avgResponseRate.toFixed(1)}%</div>
                </div>
                <div class="metric-card">
                    <h5>Business Units Analyzed</h5>
                    <div class="value">${filteredData.length}</div>
                </div>
            </div>
            
            <h4>Business Unit Performance</h4>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Business Unit</th>
                        <th>Pulse Score</th>
                        <th>Response Rate</th>
                        <th>Trend</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredData.map(unit => `
                        <tr>
                            <td>${unit.name}</td>
                            <td>${unit.pulseScore.current}</td>
                            <td>${unit.responseRate.current}%</td>
                            <td class="${getTrendClass(unit.pulseScore.current - unit.pulseScore.previous)}">
                                ${formatTrend(unit.pulseScore.current - unit.pulseScore.previous)}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function generateScoreBreakdownReportContent(filteredData) {
    return `
        <div class="report-section">
            <h3>Score Breakdown Analysis</h3>
            <p>Detailed performance analysis by business unit with period comparison.</p>
            
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Business Unit</th>
                        <th>Pulse Score (Current)</th>
                        <th>Pulse Score (Previous)</th>
                        <th>Change</th>
                        <th>Response Rate</th>
                        <th>Employee Engagement</th>
                        <th>Risk Culture</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredData.map(unit => `
                        <tr>
                            <td><strong>${unit.name}</strong></td>
                            <td>${unit.pulseScore.current}</td>
                            <td>${unit.pulseScore.previous}</td>
                            <td class="${getTrendClass(unit.pulseScore.current - unit.pulseScore.previous)}">
                                ${formatTrend(unit.pulseScore.current - unit.pulseScore.previous)}
                            </td>
                            <td>${unit.responseRate.current}%</td>
                            <td>${unit.dimensions["Employee Engagement"].current}</td>
                            <td>${unit.dimensions["Risk Culture"].current}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function generateCommentsAnalysisReportContent(selectedUnits) {
    const commentsData = dashboardData.comments || {};
    const filteredCommentsByUnit = {};
    selectedUnits.forEach(unit => {
        if (commentsData.commentsByBusinessUnit && commentsData.commentsByBusinessUnit[unit]) {
            filteredCommentsByUnit[unit] = commentsData.commentsByBusinessUnit[unit];
        }
    });

    const insights = generateCommentsInsights(filteredCommentsByUnit, commentsData.commentsByStatement || {});
    const recommendations = generateCommentsRecommendations(filteredCommentsByUnit, commentsData.trendingTopics || []);
    
    // Calculate summary metrics
    const totalComments = Object.values(filteredCommentsByUnit).reduce((sum, unit) => sum + (unit.totalComments || 0), 0);
    const avgSentiment = Object.values(filteredCommentsByUnit).reduce((sum, unit) => {
        return sum + (unit.sentiment?.positive || 0);
    }, 0) / Math.max(Object.keys(filteredCommentsByUnit).length, 1);
    
    // Get trending topics for selected units
    const relevantTrendingTopics = commentsData.trendingTopics?.filter(topic => 
        selectedUnits.some(unit => 
            topic.relatedStatements.some(statement => 
                commentsData.commentsByStatement?.some(cs => cs.statement === statement)
            )
        )
    ) || [];

    return `
        <div class="report-section">
            <div class="report-header">
                <h3>Comments Analysis Report</h3>
                <p class="report-subtitle">Qualitative feedback analysis and insights from employee comments across ${selectedUnits.length} business unit${selectedUnits.length !== 1 ? 's' : ''}.</p>
                <div class="report-meta">
                    <span class="meta-item">
                        <i class="material-icons">schedule</i>
                        Generated: ${new Date().toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </span>
                    <span class="meta-item">
                        <i class="material-icons">business</i>
                        Units: ${selectedUnits.join(', ')}
                    </span>
                </div>
            </div>
            
            <!-- Executive Summary -->
            <div class="executive-summary">
                <h4>Executive Summary</h4>
                <div class="summary-grid">
                    <div class="summary-card primary">
                        <div class="summary-icon">
                            <i class="material-icons">chat_bubble</i>
                        </div>
                        <div class="summary-content">
                            <div class="summary-value">${totalComments.toLocaleString()}</div>
                            <div class="summary-label">Total Comments</div>
                        </div>
                    </div>
                    <div class="summary-card ${avgSentiment >= 60 ? 'positive' : avgSentiment >= 40 ? 'neutral' : 'negative'}">
                        <div class="summary-icon">
                            <i class="material-icons">sentiment_satisfied</i>
                        </div>
                        <div class="summary-content">
                            <div class="summary-value">${avgSentiment.toFixed(0)}%</div>
                            <div class="summary-label">Average Sentiment</div>
                        </div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-icon">
                            <i class="material-icons">trending_up</i>
                        </div>
                        <div class="summary-content">
                            <div class="summary-value">${relevantTrendingTopics.length}</div>
                            <div class="summary-label">Trending Topics</div>
                        </div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-icon">
                            <i class="material-icons">lightbulb</i>
                        </div>
                        <div class="summary-content">
                            <div class="summary-value">${insights.length}</div>
                            <div class="summary-label">Key Insights</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sentiment Overview -->
            <div class="sentiment-overview">
                <h4>Sentiment Distribution</h4>
                <div class="sentiment-chart-container">
                    <div class="sentiment-donut">
                        <canvas id="reportSentimentChart" width="200" height="200"></canvas>
                        <div class="sentiment-center">
                            <div class="sentiment-total">${totalComments.toLocaleString()}</div>
                            <div class="sentiment-label">Comments</div>
                        </div>
                    </div>
                    <div class="sentiment-breakdown">
                        ${Object.values(filteredCommentsByUnit).map(unit => `
                            <div class="unit-sentiment">
                                <div class="unit-name">${unit.name || 'Unknown'}</div>
                                <div class="sentiment-bars">
                                    <div class="sentiment-bar positive" style="width: ${unit.sentiment?.positive || 0}%">
                                        <span class="bar-label">${unit.sentiment?.positive || 0}%</span>
                                    </div>
                                    <div class="sentiment-bar neutral" style="width: ${unit.sentiment?.neutral || 0}%">
                                        <span class="bar-label">${unit.sentiment?.neutral || 0}%</span>
                                    </div>
                                    <div class="sentiment-bar negative" style="width: ${unit.sentiment?.negative || 0}%">
                                        <span class="bar-label">${unit.sentiment?.negative || 0}%</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Trending Topics -->
            ${relevantTrendingTopics.length > 0 ? `
                <div class="trending-topics">
                    <h4>Trending Topics</h4>
                    <div class="topics-grid">
                        ${relevantTrendingTopics.map(topic => `
                            <div class="topic-card ${topic.sentiment}">
                                <div class="topic-header">
                                    <h5>${topic.topic}</h5>
                                    <span class="topic-trend ${topic.trend.startsWith('+') ? 'positive' : 'negative'}">
                                        ${topic.trend}
                                    </span>
                                </div>
                                <div class="topic-stats">
                                    <span class="topic-mentions">${topic.mentions.toLocaleString()} mentions</span>
                                    <span class="topic-sentiment ${topic.sentiment}">${topic.sentiment}</span>
                                </div>
                                <div class="topic-related">
                                    <small>Related to: ${topic.relatedStatements.slice(0, 2).join(', ')}</small>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <!-- Business Unit Analysis -->
            <div class="unit-analysis">
                <h4>Business Unit Analysis</h4>
                <div class="unit-cards">
                    ${Object.entries(filteredCommentsByUnit).map(([unitName, unitData]) => `
                        <div class="unit-card">
                            <div class="unit-header">
                                <h5>${unitName}</h5>
                                <div class="unit-sentiment-score ${unitData.sentiment?.positive >= 60 ? 'positive' : unitData.sentiment?.positive >= 40 ? 'neutral' : 'negative'}">
                                    ${unitData.sentiment?.positive || 0}%
                                </div>
                            </div>
                            <div class="unit-stats">
                                <div class="stat-item">
                                    <span class="stat-label">Comments:</span>
                                    <span class="stat-value">${unitData.totalComments?.toLocaleString() || 0}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Top Themes:</span>
                                    <span class="stat-value">${unitData.topThemes?.slice(0, 3).join(', ') || 'N/A'}</span>
                                </div>
                            </div>
                            ${unitData.sampleComments ? `
                                <div class="unit-comments">
                                    <h6>Sample Comments</h6>
                                    <div class="comment-list">
                                        ${unitData.sampleComments.slice(0, 2).map(comment => `
                                            <div class="comment-item">
                                                <div class="comment-text">"${comment}"</div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Key Insights -->
            <div class="insights-section">
                <h4>Key Insights</h4>
                <div class="insights-grid">
                    ${insights.map((insight, index) => `
                        <div class="insight-card ${insight.priority || 'medium'}">
                            <div class="insight-header">
                                <div class="insight-number">${index + 1}</div>
                                <h5>${insight.title}</h5>
                                ${insight.priority ? `<span class="insight-priority ${insight.priority}">${insight.priority}</span>` : ''}
                            </div>
                            <p>${insight.description}</p>
                            ${insight.data ? `
                                <div class="insight-data">
                                    <small>${insight.data}</small>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Recommendations -->
            <div class="recommendations-section">
                <h4>Strategic Recommendations</h4>
                <div class="recommendations-grid">
                    ${recommendations.map((rec, index) => `
                        <div class="recommendation-card ${rec.priority}">
                            <div class="recommendation-header">
                                <div class="recommendation-number">${index + 1}</div>
                                <div class="recommendation-meta">
                                    <span class="recommendation-category">${rec.category}</span>
                                    <span class="recommendation-priority ${rec.priority}">${rec.priority}</span>
                                </div>
                            </div>
                            <div class="recommendation-content">
                                <h5>${rec.action}</h5>
                                ${rec.impact ? `<p class="recommendation-impact"><strong>Expected Impact:</strong> ${rec.impact}</p>` : ''}
                                ${rec.timeline ? `<p class="recommendation-timeline"><strong>Timeline:</strong> ${rec.timeline}</p>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Action Items -->
            <div class="action-items">
                <h4>Immediate Action Items</h4>
                <div class="action-list">
                    ${recommendations.filter(rec => rec.priority === 'high').slice(0, 3).map((rec, index) => `
                        <div class="action-item">
                            <div class="action-checkbox">
                                <input type="checkbox" id="action-${index}">
                                <label for="action-${index}"></label>
                            </div>
                            <div class="action-content">
                                <div class="action-text">${rec.action}</div>
                                <div class="action-owner">Owner: ${rec.category} Team</div>
                            </div>
                            <div class="action-priority high">High Priority</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function generateDimensionAnalysisReportContent(filteredData) {
    return `
        <div class="report-section">
            <h3>Dimension Analysis Report</h3>
            <p>Culture dimensions performance across business units.</p>
            
                                ${['Employee Engagement', 'Risk Culture'].map(dimension => `
                <h4>${dimension}</h4>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Business Unit</th>
                            <th>Current Score</th>
                            <th>Previous Score</th>
                            <th>Change</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredData.map(unit => `
                            <tr>
                                <td>${unit.name}</td>
                                <td>${unit.dimensions[dimension].current}</td>
                                <td>${unit.dimensions[dimension].previous}</td>
                                <td class="${getTrendClass(unit.dimensions[dimension].current - unit.dimensions[dimension].previous)}">
                                    ${formatTrend(unit.dimensions[dimension].current - unit.dimensions[dimension].previous)}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `).join('')}
        </div>
    `;
}

function generateStatementPerformanceReportContent() {
    return `
        <div class="report-section">
            <h3>Statement Performance Report</h3>
            <p>Individual question analysis and performance trends.</p>
            
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Statement</th>
                        <th>Dimension</th>
                        <th>Score (1-5)</th>
                        <th>Performance</th>
                    </tr>
                </thead>
                <tbody>
                    ${dashboardData.allStatements.map((statement, index) => `
                        <tr>
                            <td>#${index + 1}</td>
                            <td>${statement.text}</td>
                            <td>${statement.dimension}</td>
                            <td>${statement.score}</td>
                            <td>
                                <div class="progress-bar">
                                    <div class="progress-fill ${getProgressClassFiveScale(statement.score)}" 
                                         style="width: ${(statement.score / 5) * 100}%"></div>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function generateTrendAnalysisReportContent(filteredData) {
    const improvingUnits = filteredData.filter(unit => unit.pulseScore.current > unit.pulseScore.previous).length;
    const decliningUnits = filteredData.filter(unit => unit.pulseScore.current < unit.pulseScore.previous).length;
    const stableUnits = filteredData.filter(unit => unit.pulseScore.current === unit.pulseScore.previous).length;

    return `
        <div class="report-section">
            <h3>Trend Analysis Report</h3>
            <p>Period-over-period comparisons and performance patterns.</p>
            
            <div class="report-metrics">
                <div class="metric-card">
                    <h5>Units Improving</h5>
                    <div class="value">${improvingUnits}</div>
                </div>
                <div class="metric-card">
                    <h5>Units Declining</h5>
                    <div class="value">${decliningUnits}</div>
                </div>
                <div class="metric-card">
                    <h5>Units Stable</h5>
                    <div class="value">${stableUnits}</div>
                </div>
            </div>
            
            <h4>Trend Analysis by Business Unit</h4>
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Business Unit</th>
                        <th>Pulse Score Trend</th>
                        <th>Response Rate Trend</th>
                        <th>Employee Engagement Trend</th>
                        <th>Risk Culture Trend</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredData.map(unit => `
                        <tr>
                            <td><strong>${unit.name}</strong></td>
                            <td class="${getTrendClass(unit.pulseScore.current - unit.pulseScore.previous)}">
                                ${formatTrend(unit.pulseScore.current - unit.pulseScore.previous)}
                            </td>
                            <td class="${getTrendClass(unit.responseRate.current - unit.responseRate.previous)}">
                                ${formatTrend(unit.responseRate.current - unit.responseRate.previous)}%
                            </td>
                            <td class="${getTrendClass(unit.dimensions["Employee Engagement"].current - unit.dimensions["Employee Engagement"].previous)}">
                                ${formatTrend(unit.dimensions["Employee Engagement"].current - unit.dimensions["Employee Engagement"].previous)}
                            </td>
                            <td class="${getTrendClass(unit.dimensions["Risk Culture"].current - unit.dimensions["Risk Culture"].previous)}">
                                ${formatTrend(unit.dimensions["Risk Culture"].current - unit.dimensions["Risk Culture"].previous)}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function generateActionPlanningReportContent(filteredData) {
    const priorityAreas = filteredData
        .map(unit => ({
            unit: unit.name,
            lowestDimension: Object.entries(unit.dimensions)
                .reduce((lowest, [dim, scores]) => 
                    scores.current < lowest.score ? { dimension: dim, score: scores.current } : lowest,
                    { dimension: '', score: 6 }
                )
        }))
        .sort((a, b) => a.lowestDimension.score - b.lowestDimension.score);

    return `
        <div class="report-section">
            <h3>Action Planning Report</h3>
            <p>Priority areas and improvement recommendations.</p>
            
            <h4>Priority Areas for Improvement</h4>
            <div class="insights-grid">
                ${priorityAreas.slice(0, 5).map((item, index) => `
                    <div class="insight-card">
                        <h5>#${index + 1} - ${item.unit}</h5>
                        <p><strong>Focus Area:</strong> ${item.lowestDimension.dimension}</p>
                        <p><strong>Current Score:</strong> ${item.lowestDimension.score}</p>
                    </div>
                `).join('')}
            </div>
            
            <h4>Key Recommendations</h4>
            <ul class="recommendations-list">
                <li>
                    <div class="recommendation-header">
                        <span class="recommendation-category">Employee Engagement</span>
                        <span class="recommendation-priority high">High</span>
                    </div>
                    <div class="recommendation-action">Focus on improving Employee Engagement in Operations and Sales departments</div>
                </li>
                <li>
                    <div class="recommendation-header">
                        <span class="recommendation-category">Employee Engagement</span>
                        <span class="recommendation-priority medium">Medium</span>
                    </div>
                    <div class="recommendation-action">Enhance Employee Engagement initiatives across all business units</div>
                </li>
                <li>
                    <div class="recommendation-header">
                        <span class="recommendation-category">Risk Culture</span>
                        <span class="recommendation-priority medium">Medium</span>
                    </div>
                    <div class="recommendation-action">Strengthen Risk Culture communication and training programs</div>
                </li>
            </ul>
        </div>
    `;
}

function setupModalControls() {
    const modal = document.getElementById('onlineReportModal');
    const closeBtn = document.getElementById('closeReportModal');
    
    // Try to find both old and new button IDs for compatibility
    const downloadBtn = document.getElementById('downloadPPT') || document.getElementById('downloadReport');
    const printBtn = document.getElementById('printReport');

    // Close modal
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    // Close on overlay click (only if modal-overlay exists)
    const modalOverlay = modal?.querySelector('.modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    // Download report
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const reportName = `${reportBuilderState?.selectedReportType || 'pulse'}-report-${new Date().toISOString().split('T')[0]}.pdf`;
            alert(`Downloading ${reportName}...\n\nThis would generate a PDF file with the current report data.`);
        });
    }

    // Print report
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }
}

// Initialize report builder when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // ... existing initialization code ...
    setupReportBuilder();
});

// Helper functions for report generation
function calculateAveragePulseScore(filteredData) {
    if (filteredData.length === 0) return 0;
    const total = filteredData.reduce((sum, unit) => sum + unit.pulseScore.current, 0);
    return total / filteredData.length;
}

function calculateAverageResponseRate(filteredData) {
    if (filteredData.length === 0) return 0;
    const total = filteredData.reduce((sum, unit) => sum + unit.responseRate.current, 0);
    return total / filteredData.length;
}

function formatTrend(value) {
    if (value > 0) {
        return `+${value.toFixed(2)}`;
    } else if (value < 0) {
        return `${value.toFixed(2)}`;
    } else {
        return '0.00';
    }
}

function generateCommentsInsights(filteredCommentsByUnit, commentsByStatement) {
    const insights = [];
    
    // Calculate overall metrics
    const totalComments = Object.values(filteredCommentsByUnit).reduce((sum, unit) => sum + (unit.totalComments || 0), 0);
    const avgSentiment = Object.values(filteredCommentsByUnit).reduce((sum, unit) => {
        return sum + (unit.sentiment?.positive || 0);
    }, 0) / Math.max(Object.keys(filteredCommentsByUnit).length, 1);
    
    // Insight 1: Overall sentiment analysis
    if (totalComments > 0) {
        const sentimentLevel = avgSentiment >= 70 ? 'excellent' : avgSentiment >= 50 ? 'good' : 'needs attention';
        insights.push({
            title: "Overall Sentiment Health",
            description: `The organization shows ${sentimentLevel} sentiment health with ${avgSentiment.toFixed(0)}% positive feedback across ${totalComments.toLocaleString()} comments. This indicates ${sentimentLevel === 'excellent' ? 'strong employee satisfaction' : sentimentLevel === 'good' ? 'moderate satisfaction with room for improvement' : 'significant areas requiring immediate attention'}.`,
            priority: avgSentiment < 50 ? 'high' : avgSentiment < 70 ? 'medium' : 'low',
            data: `${totalComments.toLocaleString()} comments analyzed across ${Object.keys(filteredCommentsByUnit).length} business units`
        });
    }
    
    // Insight 2: Business unit performance variation
    const unitVariations = Object.entries(filteredCommentsByUnit)
        .map(([unit, data]) => ({ 
            unit, 
            sentiment: data.sentiment?.positive || 0,
            comments: data.totalComments || 0
        }))
        .sort((a, b) => b.sentiment - a.sentiment);
    
    if (unitVariations.length > 1) {
        const bestUnit = unitVariations[0];
        const worstUnit = unitVariations[unitVariations.length - 1];
        const variation = bestUnit.sentiment - worstUnit.sentiment;
        
        insights.push({
            title: "Business Unit Performance Gap",
            description: `Significant variation exists between business units. ${bestUnit.unit} leads with ${bestUnit.sentiment.toFixed(0)}% positive sentiment, while ${worstUnit.unit} trails at ${worstUnit.sentiment.toFixed(0)}% (${variation.toFixed(0)}% gap). This suggests inconsistent employee experience across the organization.`,
            priority: variation > 20 ? 'high' : variation > 10 ? 'medium' : 'low',
            data: `${variation.toFixed(0)}% sentiment gap between highest and lowest performing units`
        });
    }
    
    // Insight 3: High-volume discussion areas
    const highVolumeUnits = unitVariations.filter(unit => unit.comments > 1000);
    if (highVolumeUnits.length > 0) {
        const topVolumeUnit = highVolumeUnits[0];
        insights.push({
            title: "High-Engagement Areas",
            description: `${topVolumeUnit.unit} shows the highest comment volume (${topVolumeUnit.comments.toLocaleString()} comments) with ${topVolumeUnit.sentiment.toFixed(0)}% positive sentiment. This indicates ${topVolumeUnit.sentiment >= 60 ? 'strong engagement and satisfaction' : 'high engagement but concerns that need addressing'}.`,
            priority: topVolumeUnit.sentiment < 50 ? 'high' : 'medium',
            data: `${highVolumeUnits.length} units with 1000+ comments each`
        });
    }
    
    // Insight 4: Sentiment trends by theme
    const allThemes = new Set();
    Object.values(filteredCommentsByUnit).forEach(unit => {
        if (unit.topThemes) {
            unit.topThemes.forEach(theme => allThemes.add(theme));
        }
    });
    
    if (allThemes.size > 0) {
        const commonThemes = Array.from(allThemes).slice(0, 3);
        insights.push({
            title: "Common Discussion Themes",
            description: `The most frequently discussed themes across business units are: ${commonThemes.join(', ')}. These represent key areas of employee focus and potential opportunities for targeted improvement initiatives.`,
            priority: 'medium',
            data: `${commonThemes.length} primary themes identified across all units`
        });
    }
    
    // Insight 5: Low sentiment units requiring attention
    const lowSentimentUnits = unitVariations.filter(unit => unit.sentiment < 50);
    if (lowSentimentUnits.length > 0) {
        insights.push({
            title: "Units Requiring Immediate Attention",
            description: `${lowSentimentUnits.length} business unit${lowSentimentUnits.length !== 1 ? 's' : ''} (${lowSentimentUnits.map(u => u.unit).join(', ')}) show concerning sentiment levels below 50%. These units require immediate intervention to prevent further decline in employee satisfaction.`,
            priority: 'high',
            data: `${lowSentimentUnits.length} units with <50% positive sentiment`
        });
    }
    
    // Insight 6: Comment volume vs sentiment correlation
    const volumeSentimentCorrelation = unitVariations.length > 2 ? 
        unitVariations.slice(0, 3).some(unit => unit.comments > 800 && unit.sentiment > 60) : false;
    
    if (volumeSentimentCorrelation) {
        insights.push({
            title: "Engagement-Satisfaction Correlation",
            description: "High comment volume correlates with positive sentiment in several units, suggesting that engaged employees are more likely to provide positive feedback. This validates the importance of maintaining open communication channels.",
            priority: 'low',
            data: "Positive correlation between comment volume and sentiment scores"
        });
    }
    
    return insights;
}

function generateCommentsRecommendations(filteredCommentsByUnit, trendingTopics) {
    const recommendations = [];
    
    // Calculate metrics for recommendations
    const totalComments = Object.values(filteredCommentsByUnit).reduce((sum, unit) => sum + (unit.totalComments || 0), 0);
    const avgSentiment = Object.values(filteredCommentsByUnit).reduce((sum, unit) => {
        return sum + (unit.sentiment?.positive || 0);
    }, 0) / Math.max(Object.keys(filteredCommentsByUnit).length, 1);
    
    // Recommendation 1: Address low sentiment units
    const lowSentimentUnits = Object.entries(filteredCommentsByUnit)
        .filter(([unit, data]) => (data.sentiment?.positive || 0) < 50)
        .map(([unit]) => unit);
    
    if (lowSentimentUnits.length > 0) {
        recommendations.push({
            category: "Employee Experience",
            priority: "high",
            action: `Implement immediate intervention programs for ${lowSentimentUnits.join(', ')} to address employee concerns and improve sentiment scores.`,
            impact: "Expected 15-25% improvement in sentiment scores within 3 months",
            timeline: "Immediate - 3 months"
        });
    }
    
    // Recommendation 2: Standardize best practices
    const highSentimentUnits = Object.entries(filteredCommentsByUnit)
        .filter(([unit, data]) => (data.sentiment?.positive || 0) >= 70)
        .map(([unit]) => unit);
    
    if (highSentimentUnits.length > 0) {
        recommendations.push({
            category: "Best Practice Sharing",
            priority: "medium",
            action: `Document and share best practices from high-performing units (${highSentimentUnits.join(', ')}) to improve overall organizational sentiment.`,
            impact: "Potential 10-15% sentiment improvement across struggling units",
            timeline: "1-2 months"
        });
    }
    
    // Recommendation 3: Address trending topics
    if (trendingTopics && trendingTopics.length > 0) {
        const negativeTopics = trendingTopics.filter(topic => topic.sentiment === 'negative');
        if (negativeTopics.length > 0) {
            recommendations.push({
                category: "Proactive Communication",
                priority: "high",
                action: `Address trending negative topics (${negativeTopics.slice(0, 2).map(t => t.topic).join(', ')}) through proactive communication and policy updates.`,
                impact: "Prevent sentiment decline and demonstrate responsiveness to employee concerns",
                timeline: "2-4 weeks"
            });
        }
    }
    
    // Recommendation 4: Enhance feedback mechanisms
    if (totalComments > 0) {
        recommendations.push({
            category: "Feedback Infrastructure",
            priority: "medium",
            action: "Strengthen feedback collection and response mechanisms to ensure timely addressing of employee concerns and maintain positive sentiment.",
            impact: "Improved employee trust and engagement, reduced sentiment volatility",
            timeline: "Ongoing - 6 months"
        });
    }
    
    // Recommendation 5: Targeted training programs
    const unitsWithCommunicationIssues = Object.entries(filteredCommentsByUnit)
        .filter(([unit, data]) => data.topThemes && data.topThemes.some(theme => 
            theme.toLowerCase().includes('communication') || theme.toLowerCase().includes('collaboration')
        ))
        .map(([unit]) => unit);
    
    if (unitsWithCommunicationIssues.length > 0) {
        recommendations.push({
            category: "Leadership Development",
            priority: "medium",
            action: `Implement communication and collaboration training for leadership teams in ${unitsWithCommunicationIssues.join(', ')}.`,
            impact: "Improved team dynamics and reduced communication-related complaints",
            timeline: "3-6 months"
        });
    }
    
    // Recommendation 6: Recognition and rewards
    if (avgSentiment < 60) {
        recommendations.push({
            category: "Employee Recognition",
            priority: "medium",
            action: "Develop and implement comprehensive employee recognition and rewards programs to boost morale and positive sentiment.",
            impact: "Expected 10-20% improvement in overall sentiment scores",
            timeline: "2-4 months"
        });
    }
    
    // Recommendation 7: Regular sentiment monitoring
    recommendations.push({
        category: "Monitoring & Analytics",
        priority: "low",
        action: "Establish regular sentiment monitoring and reporting cycles to track improvements and identify emerging issues early.",
        impact: "Proactive issue identification and data-driven decision making",
        timeline: "Ongoing"
    });
    
    return recommendations;
}

// Add this function after the generateCommentsRecommendations function
function renderReportSentimentChart(container, filteredCommentsByUnit) {
    const canvas = container.querySelector('#reportSentimentChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    // Calculate total sentiment distribution
    let totalPositive = 0, totalNeutral = 0, totalNegative = 0;
    Object.values(filteredCommentsByUnit).forEach(unit => {
        totalPositive += (unit.sentiment?.positive || 0) * (unit.totalComments || 0) / 100;
        totalNeutral += (unit.sentiment?.neutral || 0) * (unit.totalComments || 0) / 100;
        totalNegative += (unit.sentiment?.negative || 0) * (unit.totalComments || 0) / 100;
    });
    
    const total = totalPositive + totalNeutral + totalNegative;
    if (total === 0) return;
    
    const positiveAngle = (totalPositive / total) * 2 * Math.PI;
    const neutralAngle = (totalNeutral / total) * 2 * Math.PI;
    const negativeAngle = (totalNegative / total) * 2 * Math.PI;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw donut segments
    let currentAngle = -Math.PI / 2; // Start from top
    
    // Positive segment
    if (positiveAngle > 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + positiveAngle);
        ctx.lineTo(centerX, centerY);
        ctx.fillStyle = '#00AE4E';
        ctx.fill();
        currentAngle += positiveAngle;
    }
    
    // Neutral segment
    if (neutralAngle > 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + neutralAngle);
        ctx.lineTo(centerX, centerY);
        ctx.fillStyle = '#FFB800';
        ctx.fill();
        currentAngle += neutralAngle;
    }
    
    // Negative segment
    if (negativeAngle > 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + negativeAngle);
        ctx.lineTo(centerX, centerY);
        ctx.fillStyle = '#FF4B4B';
        ctx.fill();
    }
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
}

// Add this function after the setupReportBuilder function
function setupQuickDemo() {
    const quickDemoBtn = document.getElementById('quickDemo');
    if (quickDemoBtn) {
        quickDemoBtn.addEventListener('click', () => {
            // Auto-select Comments Analysis
            reportBuilderState.selectedReportType = 'comments-analysis';
            
            // Update UI to show Comments Analysis is selected
            document.querySelectorAll('.report-type-card').forEach(card => {
                card.classList.remove('selected');
            });
            document.querySelector('[data-report-type="comments-analysis"]').classList.add('selected');
            
            // Show comments filters
            const commentsFilters = document.getElementById('commentsFilters');
            if (commentsFilters) {
                commentsFilters.style.display = 'block';
            }
            
            // Auto-select all business units
            reportBuilderState.selectedBusinessUnits = dashboardData.businessUnits.map(unit => unit.name);
            
            // Update business unit checkboxes
            document.querySelectorAll('.business-unit-option input').forEach(checkbox => {
                checkbox.checked = true;
            });
            
            // Generate and display the report
            generateReport();
            
            // Scroll to top of reports section
            document.getElementById('reports').scrollIntoView({ behavior: 'smooth' });
        });
    }
}

// Dropdown functionality
function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const toggle = dropdown.previousElementSibling;
    
    // Close all other dropdowns
    document.querySelectorAll('.dropdown-content').forEach(content => {
        if (content.id !== dropdownId) {
            content.classList.remove('active');
            content.previousElementSibling.classList.remove('active');
        }
    });
    
    // Toggle current dropdown
    dropdown.classList.toggle('active');
    toggle.classList.toggle('active');
    
    // Update dropdown text based on selections
    updateDropdownText(dropdownId);
}

function updateDropdownText(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const toggle = dropdown.previousElementSibling;
    const textElement = toggle.querySelector('.dropdown-text');
    
    const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]:not(#selectAllLevels):not(#selectAllSegments):not(#selectAllDivisions):not(#selectAllAges):not(#selectAllJobLevels)');
    const checkedBoxes = Array.from(checkboxes).filter(cb => cb.checked);
    
    let text = '';
    switch(dropdownId) {
        case 'orgLevelDropdown':
            text = checkedBoxes.length > 0 ? `${checkedBoxes.length} level(s) selected` : 'Select Organization Level';
            break;
        case 'segmentDropdown':
            text = checkedBoxes.length > 0 ? `${checkedBoxes.length} segment(s) selected` : 'Select Segments';
            break;
        case 'divisionDropdown':
            text = checkedBoxes.length > 0 ? `${checkedBoxes.length} division(s) selected` : 'Select Divisions';
            break;
        case 'ageDropdown':
            text = checkedBoxes.length > 0 ? `${checkedBoxes.length} age group(s) selected` : 'Select Age Groups';
            break;
        case 'jobLevelDropdown':
            text = checkedBoxes.length > 0 ? `${checkedBoxes.length} job level(s) selected` : 'Select Job Levels';
            break;
    }
    
    textElement.textContent = text;
}

function setupDropdownSelectAll() {
    // Organization Level Select All
    const selectAllLevels = document.getElementById('selectAllLevels');
    if (selectAllLevels) {
        selectAllLevels.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('#orgLevelDropdown input[type="checkbox"]:not(#selectAllLevels)');
            checkboxes.forEach(cb => cb.checked = this.checked);
            updateDropdownText('orgLevelDropdown');
        });
    }
    
    // Segments Select All
    const selectAllSegments = document.getElementById('selectAllSegments');
    if (selectAllSegments) {
        selectAllSegments.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('#segmentDropdown input[type="checkbox"]:not(#selectAllSegments)');
            checkboxes.forEach(cb => cb.checked = this.checked);
            updateDropdownText('segmentDropdown');
        });
    }
    
    // Divisions Select All
    const selectAllDivisions = document.getElementById('selectAllDivisions');
    if (selectAllDivisions) {
        selectAllDivisions.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('#divisionDropdown input[type="checkbox"]:not(#selectAllDivisions)');
            checkboxes.forEach(cb => cb.checked = this.checked);
            updateDropdownText('divisionDropdown');
        });
    }
    
    // Age Groups Select All
    const selectAllAges = document.getElementById('selectAllAges');
    if (selectAllAges) {
        selectAllAges.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('#ageDropdown input[type="checkbox"]:not(#selectAllAges)');
            checkboxes.forEach(cb => cb.checked = this.checked);
            updateDropdownText('ageDropdown');
        });
    }
    
    // Job Levels Select All
    const selectAllJobLevels = document.getElementById('selectAllJobLevels');
    if (selectAllJobLevels) {
        selectAllJobLevels.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('#jobLevelDropdown input[type="checkbox"]:not(#selectAllJobLevels)');
            checkboxes.forEach(cb => cb.checked = this.checked);
            updateDropdownText('jobLevelDropdown');
        });
    }
}

function setupDropdownCheckboxes() {
    // Add change event listeners to all dropdown checkboxes
    const dropdowns = ['orgLevelDropdown', 'segmentDropdown', 'divisionDropdown', 'ageDropdown', 'jobLevelDropdown'];
    
    dropdowns.forEach(dropdownId => {
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) {
            const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]:not([id^="selectAll"])');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    updateDropdownText(dropdownId);
                    updateSelectAllState(dropdownId);
                });
            });
        }
    });
}

function updateSelectAllState(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;
    
    const selectAllCheckbox = dropdown.querySelector('input[type="checkbox"][id^="selectAll"]');
    const regularCheckboxes = dropdown.querySelectorAll('input[type="checkbox"]:not([id^="selectAll"])');
    
    if (selectAllCheckbox && regularCheckboxes.length > 0) {
        const checkedCount = Array.from(regularCheckboxes).filter(cb => cb.checked).length;
        const totalCount = regularCheckboxes.length;
        
        if (checkedCount === 0) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        } else if (checkedCount === totalCount) {
            selectAllCheckbox.checked = true;
            selectAllCheckbox.indeterminate = false;
        } else {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = true;
        }
    }
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
    const dropdowns = document.querySelectorAll('.dropdown-container');
    dropdowns.forEach(container => {
        if (!container.contains(event.target)) {
            const dropdown = container.querySelector('.dropdown-content');
            const toggle = container.querySelector('.dropdown-toggle');
            if (dropdown && dropdown.classList.contains('active')) {
                dropdown.classList.remove('active');
                toggle.classList.remove('active');
            }
        }
    });
});

// Progress Tracker State Management
let progressTrackerState = {
    currentLevel: 'company',  // 'company', 'segments', 'divisions', 'departments', 'teams'
    currentSegment: null,
    currentDivision: null,
    currentDepartment: null,
    breadcrumbs: [{ level: 'company', name: 'OML - Old Mutual Limited' }],
    sortBy: null,
    sortDirection: 'asc'
};

function isProgressTrackerDrillDownEnabled() {
    return typeof FEATURES !== 'undefined' && FEATURES.progressTrackerHierarchyDrillDown === true;
}

// Progress Tracker Functions
function initializeProgressTracker() {
    if (!isProgressTrackerDrillDownEnabled()) {
        progressTrackerState = {
            currentLevel: 'company',
            currentSegment: null,
            currentDivision: null,
            currentDepartment: null,
            breadcrumbs: [{ level: 'company', name: 'Overall' }],
            sortBy: null,
            sortDirection: 'asc'
        };
    }
    renderProgressSummary();
    renderProgressTable();
    setupProgressEventListeners();
}

function setupProgressEventListeners() {
    // Export to Excel button
    const exportBtn = document.getElementById('exportProgressExcel');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportProgressToExcel);
    }
    
    // Back button
    const backBtn = document.getElementById('backToParent');
    if (backBtn) {
        backBtn.addEventListener('click', navigateBackInHierarchy);
    }
    
    // Table sorting
    const sortableHeaders = document.querySelectorAll('.progress-table th.sortable');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const sortKey = header.getAttribute('data-sort');
            handleTableSort(sortKey);
        });
    });
}

function renderProgressSummary() {
    const data = getCurrentProgressData();
    
    const totalPopulation = document.getElementById('totalPopulation');
    const totalCompleted = document.getElementById('totalCompleted');
    const totalInProgress = document.getElementById('totalInProgress');
    const totalNotStarted = document.getElementById('totalNotStarted');
    const overallCompletionRate = document.getElementById('overallCompletionRate');
    
    if (totalPopulation) totalPopulation.textContent = data.population.toLocaleString();
    if (totalCompleted) totalCompleted.textContent = data.completed.toLocaleString();
    if (totalInProgress) totalInProgress.textContent = data.inProgress.toLocaleString();
    if (totalNotStarted) totalNotStarted.textContent = data.notStarted.toLocaleString();
    
    if (overallCompletionRate) {
        overallCompletionRate.textContent = data.completionRate + '%';
        overallCompletionRate.className = 'card-value card-completion-rate';
    }
}

function renderProgressTable() {
    const tableData = getTableData();
    const tableBody = document.getElementById('progressTableBody');
    const tableTitle = document.getElementById('tableTitle');
    const backButton = document.getElementById('backToParent');
    
    if (!tableBody) return;
    
    // Update table title and back button
    if (progressTrackerState.currentLevel === 'company') {
        if (tableTitle) {
            tableTitle.textContent = isProgressTrackerDrillDownEnabled() ? 'Segments Overview' : 'Overall';
        }
        if (backButton) backButton.style.display = 'none';
    } else if (progressTrackerState.currentLevel === 'segments') {
        if (tableTitle) tableTitle.textContent = `${progressTrackerState.currentSegment} - Divisions`;
        if (backButton) backButton.style.display = 'flex';
    } else if (progressTrackerState.currentLevel === 'divisions') {
        if (tableTitle) tableTitle.textContent = `${progressTrackerState.currentDivision} - Departments`;
        if (backButton) backButton.style.display = 'flex';
    } else if (progressTrackerState.currentLevel === 'departments') {
        if (tableTitle) tableTitle.textContent = `${progressTrackerState.currentDepartment} - Teams`;
        if (backButton) backButton.style.display = 'flex';
    } else if (progressTrackerState.currentLevel === 'teams') {
        if (tableTitle) tableTitle.textContent = 'Team Details';
        if (backButton) backButton.style.display = 'flex';
    }
    
    // Update breadcrumbs
    updateBreadcrumbs();
    
    // Render table rows
    tableBody.innerHTML = tableData.map(item => `
        <tr ${item.hasChildren ? `class="clickable-row" onclick="drillDown('${item.name}')" title="Click to view details"` : ''}>
            <td>
                <span class="unit-name ${item.hasChildren ? 'clickable' : ''}">${item.name}</span>
            </td>
            <td>${item.population.toLocaleString()}</td>
            <td>${item.completed.toLocaleString()}</td>
            <td>${item.inProgress.toLocaleString()}</td>
            <td>${item.notStarted.toLocaleString()}</td>
            <td>
                <span class="completion-rate ${getCompletionRateClass(item.completionRate)}">
                    ${item.completionRate}%
                </span>
            </td>
        </tr>
    `).join('');
}

function getCurrentProgressData() {
    if (progressTrackerState.currentLevel === 'company') {
        return dashboardData.progressTracker.company;
    } else if (progressTrackerState.currentLevel === 'segments') {
        const segment = dashboardData.progressTracker.segments.find(s => s.name === progressTrackerState.currentSegment);
        return segment || dashboardData.progressTracker.company;
    } else if (progressTrackerState.currentLevel === 'divisions') {
        const segment = dashboardData.progressTracker.segments.find(s => s.name === progressTrackerState.currentSegment);
        const division = segment ? segment.divisions.find(d => d.name === progressTrackerState.currentDivision) : null;
        return division || dashboardData.progressTracker.company;
    } else if (progressTrackerState.currentLevel === 'departments') {
        const segment = dashboardData.progressTracker.segments.find(s => s.name === progressTrackerState.currentSegment);
        const division = segment ? segment.divisions.find(d => d.name === progressTrackerState.currentDivision) : null;
        const department = division ? division.departments.find(d => d.name === progressTrackerState.currentDepartment) : null;
        return department || dashboardData.progressTracker.company;
    } else if (progressTrackerState.currentLevel === 'teams') {
        const segment = dashboardData.progressTracker.segments.find(s => s.name === progressTrackerState.currentSegment);
        const division = segment ? segment.divisions.find(d => d.name === progressTrackerState.currentDivision) : null;
        const department = division ? division.departments.find(d => d.name === progressTrackerState.currentDepartment) : null;
        return department || dashboardData.progressTracker.company;
    }
    return dashboardData.progressTracker.company;
}

function getTableData() {
    if (progressTrackerState.currentLevel === 'company') {
        if (!isProgressTrackerDrillDownEnabled()) {
            const c = dashboardData.progressTracker.company;
            return [{
                name: 'Overall',
                population: c.population,
                completed: c.completed,
                inProgress: c.inProgress,
                notStarted: c.notStarted,
                completionRate: c.completionRate,
                hasChildren: false
            }];
        }
        return dashboardData.progressTracker.segments.map(segment => ({
            ...segment,
            hasChildren: segment.divisions && segment.divisions.length > 0
        }));
    } else if (progressTrackerState.currentLevel === 'segments') {
        const segment = dashboardData.progressTracker.segments.find(s => s.name === progressTrackerState.currentSegment);
        return segment ? segment.divisions.map(division => ({
            ...division,
            hasChildren: division.departments && division.departments.length > 0
        })) : [];
    } else if (progressTrackerState.currentLevel === 'divisions') {
        const segment = dashboardData.progressTracker.segments.find(s => s.name === progressTrackerState.currentSegment);
        const division = segment ? segment.divisions.find(d => d.name === progressTrackerState.currentDivision) : null;
        return division ? division.departments.map(department => ({
            ...department,
            hasChildren: department.teams && department.teams.length > 0
        })) : [];
    } else if (progressTrackerState.currentLevel === 'departments') {
        const segment = dashboardData.progressTracker.segments.find(s => s.name === progressTrackerState.currentSegment);
        const division = segment ? segment.divisions.find(d => d.name === progressTrackerState.currentDivision) : null;
        const department = division ? division.departments.find(d => d.name === progressTrackerState.currentDepartment) : null;
        return department ? department.teams.map(team => ({
            ...team,
            hasChildren: false
        })) : [];
    }
    return [];
}

function drillDown(itemName) {
    if (!isProgressTrackerDrillDownEnabled()) return;

    if (progressTrackerState.currentLevel === 'company') {
        // Drilling into segments
        progressTrackerState.currentLevel = 'segments';
        progressTrackerState.currentSegment = itemName;
        progressTrackerState.breadcrumbs.push({ level: 'segments', name: itemName });
    } else if (progressTrackerState.currentLevel === 'segments') {
        // Drilling into divisions
        progressTrackerState.currentLevel = 'divisions';
        progressTrackerState.currentDivision = itemName;
        progressTrackerState.breadcrumbs.push({ level: 'divisions', name: itemName });
    } else if (progressTrackerState.currentLevel === 'divisions') {
        // Drilling into departments
        progressTrackerState.currentLevel = 'departments';
        progressTrackerState.currentDepartment = itemName;
        progressTrackerState.breadcrumbs.push({ level: 'departments', name: itemName });
    } else if (progressTrackerState.currentLevel === 'departments') {
        // Drilling into teams
        progressTrackerState.currentLevel = 'teams';
        progressTrackerState.breadcrumbs.push({ level: 'teams', name: itemName });
    }
    
    renderProgressSummary();
    renderProgressTable();
}

function navigateBackInHierarchy() {
    if (!isProgressTrackerDrillDownEnabled()) return;

    if (progressTrackerState.currentLevel === 'segments') {
        progressTrackerState.currentLevel = 'company';
        progressTrackerState.currentSegment = null;
        progressTrackerState.breadcrumbs = progressTrackerState.breadcrumbs.slice(0, 1);
    } else if (progressTrackerState.currentLevel === 'divisions') {
        progressTrackerState.currentLevel = 'segments';
        progressTrackerState.currentDivision = null;
        progressTrackerState.breadcrumbs = progressTrackerState.breadcrumbs.slice(0, 2);
    } else if (progressTrackerState.currentLevel === 'departments') {
        progressTrackerState.currentLevel = 'divisions';
        progressTrackerState.currentDepartment = null;
        progressTrackerState.breadcrumbs = progressTrackerState.breadcrumbs.slice(0, 3);
    } else if (progressTrackerState.currentLevel === 'teams') {
        progressTrackerState.currentLevel = 'departments';
        progressTrackerState.breadcrumbs = progressTrackerState.breadcrumbs.slice(0, 4);
    }
    
    renderProgressSummary();
    renderProgressTable();
}

function updateBreadcrumbs() {
    const breadcrumbPath = document.querySelector('.breadcrumb-path');
    if (!breadcrumbPath) return;
    
    breadcrumbPath.innerHTML = progressTrackerState.breadcrumbs.map((crumb, index) => {
        const isLast = index === progressTrackerState.breadcrumbs.length - 1;
        const separator = index > 0 ? '<span class="breadcrumb-separator">›</span>' : '';
        
        // Add home icon for the top level (company)
        const homeIcon = index === 0 ? '<i class="material-icons">home</i>' : '';
        
        return `${separator}<span class="breadcrumb-item ${isLast ? 'active' : ''}" 
                       onclick="${!isLast ? `navigateToBreadcrumb(${index})` : ''}" 
                       data-level="${crumb.level}">
                    ${homeIcon}${crumb.name}
                </span>`;
    }).join('');
}

function navigateToBreadcrumb(index) {
    if (!isProgressTrackerDrillDownEnabled()) return;

    if (index === 0) {
        // Navigate back to company level
        progressTrackerState.currentLevel = 'company';
        progressTrackerState.currentSegment = null;
        progressTrackerState.currentDivision = null;
        progressTrackerState.currentDepartment = null;
        progressTrackerState.breadcrumbs = progressTrackerState.breadcrumbs.slice(0, 1);
    } else if (index === 1) {
        // Navigate back to segments level
        progressTrackerState.currentLevel = 'segments';
        progressTrackerState.currentDivision = null;
        progressTrackerState.currentDepartment = null;
        progressTrackerState.breadcrumbs = progressTrackerState.breadcrumbs.slice(0, 2);
    } else if (index === 2) {
        // Navigate back to divisions level
        progressTrackerState.currentLevel = 'divisions';
        progressTrackerState.currentDepartment = null;
        progressTrackerState.breadcrumbs = progressTrackerState.breadcrumbs.slice(0, 3);
    } else if (index === 3) {
        // Navigate back to departments level
        progressTrackerState.currentLevel = 'departments';
        progressTrackerState.breadcrumbs = progressTrackerState.breadcrumbs.slice(0, 4);
    }
    
    renderProgressSummary();
    renderProgressTable();
}

function getCompletionRateClass(rate) {
    if (rate >= 75) return 'excellent';
    if (rate >= 60) return 'good';
    if (rate >= 45) return 'fair';
    return 'attention';
}

function handleTableSort(sortKey) {
    if (progressTrackerState.sortBy === sortKey) {
        progressTrackerState.sortDirection = progressTrackerState.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        progressTrackerState.sortBy = sortKey;
        progressTrackerState.sortDirection = 'asc';
    }
    
    renderProgressTable();
    updateSortIcons();
}

function updateSortIcons() {
    // Reset all sort icons
    document.querySelectorAll('.sort-icon').forEach(icon => {
        icon.textContent = 'sort';
    });
    
    // Update the active sort icon
    if (progressTrackerState.sortBy) {
        const activeHeader = document.querySelector(`[data-sort="${progressTrackerState.sortBy}"] .sort-icon`);
        if (activeHeader) {
            activeHeader.textContent = progressTrackerState.sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward';
        }
    }
}

function exportProgressToExcel() {
    // Create CSV content
    const tableData = getTableData();
    const currentData = getCurrentProgressData();
    
    let csvContent = "Survey Progress Report\n";
    csvContent += `Generated: ${new Date().toLocaleDateString()}\n`;
    let levelDescription = !isProgressTrackerDrillDownEnabled() ? 'Overall' : 'Company Overview';
    if (progressTrackerState.currentLevel === 'segments') {
        levelDescription = `${progressTrackerState.currentSegment} - Divisions`;
    } else if (progressTrackerState.currentLevel === 'divisions') {
        levelDescription = `${progressTrackerState.currentDivision} - Departments`;
    } else if (progressTrackerState.currentLevel === 'departments') {
        levelDescription = `${progressTrackerState.currentDepartment} - Teams`;
    } else if (progressTrackerState.currentLevel === 'teams') {
        levelDescription = 'Team Details';
    }
    csvContent += `Level: ${levelDescription}\n\n`;
    
    csvContent += "Summary\n";
    csvContent += `Total Population,${currentData.population}\n`;
    csvContent += `Completed,${currentData.completed}\n`;
    csvContent += `In Progress,${currentData.inProgress}\n`;
    csvContent += `Not Started,${currentData.notStarted}\n`;
    csvContent += `Completion Rate,${currentData.completionRate}%\n\n`;
    
    csvContent += "Detailed Breakdown\n";
    csvContent += "Unit Name,Population,Completed,In Progress,Not Started,Completion Rate\n";
    
    tableData.forEach(item => {
        csvContent += `"${item.name}",${item.population},${item.completed},${item.inProgress},${item.notStarted},${item.completionRate}%\n`;
    });
    
    // Download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const filename = `survey_progress_${progressTrackerState.currentLevel}_${new Date().toISOString().split('T')[0]}.csv`;
    
    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(blob, filename);
    } else {
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Update the main DOMContentLoaded event handler to include dropdown setup
document.addEventListener('DOMContentLoaded', () => {
    renderMetrics();
    renderDimensions();
    renderStatements();
    renderSentiment();
    renderReliabilityIndicator();
    setupModalControls();
    setupQuickDemo();
    setupDropdownSelectAll();
    setupDropdownCheckboxes();
    
    // Initialize Progress Tracker
    initializeProgressTracker();
    
    // Add PDF export event listener
    const exportButton = document.getElementById('exportPdf');
    if (exportButton) {
        exportButton.addEventListener('click', () => {
            alert('Exporting PDF function not implemented yet...');
        });
        // exportButton.addEventListener('click', generatePDF);
    }
}); 

// --- Filter Modal Logic ---
const filterOptions = {
  workerGroup: [
    { value: 'all', label: 'All' },
    { value: 'old-mutual-limited', label: 'Old Mutual Limited' },
    { value: 'old-mutual-life', label: 'Old Mutual Life' },
    { value: 'old-mutual-investment-group', label: 'Old Mutual Investment Group' }
  ],
  cluster: [
    { value: 'all', label: 'All' },
    { value: 'operations', label: 'Operations' },
    { value: 'sales', label: 'Sales' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'mass-foundation-cluster', label: 'Mass and Foundation Cluster' }
  ],
  businessUnit: [
    { value: 'all', label: 'All' },
    { value: 'finance', label: 'Finance' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'technology', label: 'Technology' },
    { value: 'operations', label: 'Operations' },
    { value: 'human-resources', label: 'Human Resources' },
    { value: 'sales', label: 'Sales' }
  ],
  divisions: [
    { value: 'all', label: 'All' },
    { value: 'division-1', label: 'Division 1' },
    { value: 'division-2', label: 'Division 2' },
    { value: 'division-3', label: 'Division 3' },
    { value: 'division-4', label: 'Division 4' },
    { value: 'division-5', label: 'Division 5' },
    { value: 'division-6', label: 'Division 6' },
    { value: 'division-7', label: 'Division 7' },
    { value: 'division-8', label: 'Division 8' },
    { value: 'division-9', label: 'Division 9' },
    { value: 'division-10', label: 'Division 10' }
  ],
  departments: [
    { value: 'all', label: 'All' },
    { value: 'customer-service', label: 'Customer Service' },
    { value: 'product-development', label: 'Product Development' },
    { value: 'quality-assurance', label: 'Quality Assurance' },
    { value: 'business-analysis', label: 'Business Analysis' },
    { value: 'project-management', label: 'Project Management' },
    { value: 'data-analytics', label: 'Data Analytics' },
    { value: 'risk-management', label: 'Risk Management' },
    { value: 'operations-support', label: 'Operations Support' }
  ],
  teams: [
    { value: 'all', label: 'All' },
    { value: 'team-alpha', label: 'Team Alpha' },
    { value: 'team-beta', label: 'Team Beta' },
    { value: 'team-gamma', label: 'Team Gamma' },
    { value: 'team-delta', label: 'Team Delta' },
    { value: 'team-epsilon', label: 'Team Epsilon' },
    { value: 'team-zeta', label: 'Team Zeta' },
    { value: 'team-eta', label: 'Team Eta' },
    { value: 'team-theta', label: 'Team Theta' }
  ],
  jobFamily: [
    { value: 'all', label: 'All' },
    { value: 'administration', label: 'Administration' },
    { value: 'customer-service', label: 'Customer Service' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'finance', label: 'Finance' },
    { value: 'human-resources', label: 'Human Resources' },
    { value: 'information-technology', label: 'Information Technology' },
    { value: 'legal', label: 'Legal' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'operations', label: 'Operations' },
    { value: 'sales', label: 'Sales' }
  ],
  workersManager: [
    { value: 'all', label: 'All' },
    { value: 'manager-1', label: 'Manager 1' },
    { value: 'manager-2', label: 'Manager 2' },
    { value: 'manager-3', label: 'Manager 3' },
    { value: 'manager-4', label: 'Manager 4' },
    { value: 'manager-5', label: 'Manager 5' },
    { value: 'manager-6', label: 'Manager 6' },
    { value: 'manager-7', label: 'Manager 7' },
    { value: 'manager-8', label: 'Manager 8' }
  ],
  race: [
    { value: 'all', label: 'All' },
    { value: 'asian', label: 'Asian' },
    { value: 'black', label: 'Black' },
    { value: 'hispanic', label: 'Hispanic' },
    { value: 'white', label: 'White' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not', label: 'Prefer not to say' }
  ],
  gender: [
    { value: 'all', label: 'All' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not', label: 'Prefer not to say' }
  ],
  ageBand: [
    { value: 'all', label: 'All' },
    { value: '18-35', label: '18 - 35' },
    { value: '36-50', label: '36 - 50' },
    { value: '50+', label: '50+' },
    { value: 'unknown', label: 'Unknown' }
  ],
  tenure: [
    { value: 'all', label: 'All' },
    { value: '0-1', label: '0-1 years' },
    { value: '2-4', label: '2-4 years' },
    { value: '5-9', label: '5-9 years' },
    { value: '10+', label: '10+ years' }
  ],
  managementLevel: [
    { value: 'all', label: 'All' },
    { value: 'executive', label: 'Executive' },
    { value: 'senior-management', label: 'Senior Management' },
    { value: 'middle-management', label: 'Middle Management' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'individual-contributor', label: 'Individual Contributor' },
    { value: 'entry-level', label: 'Entry Level' }
  ],
  company: [
    { value: 'all', label: 'All' },
    { value: 'old-mutual-limited', label: 'Old Mutual Limited' },
    { value: 'old-mutual-life', label: 'Old Mutual Life' },
    { value: 'old-mutual-investment-group', label: 'Old Mutual Investment Group' },
    { value: 'old-mutual-property', label: 'Old Mutual Property' },
    { value: 'old-mutual-short-term-insurance', label: 'Old Mutual Short-term Insurance' }
  ],
  country: [
    { value: 'all', label: 'All' },
    { value: 'south-africa', label: 'South Africa' },
    { value: 'namibia', label: 'Namibia' },
    { value: 'botswana', label: 'Botswana' },
    { value: 'kenya', label: 'Kenya' },
    { value: 'nigeria', label: 'Nigeria' },
    { value: 'ghana', label: 'Ghana' },
    { value: 'malawi', label: 'Malawi' },
    { value: 'tanzania', label: 'Tanzania' },
    { value: 'uganda', label: 'Uganda' },
    { value: 'zimbabwe', label: 'Zimbabwe' }
  ],
  supervisoryOrg: [
    { value: 'all', label: 'All' },
    { value: 'executive-office', label: 'Executive Office' },
    { value: 'finance-operations', label: 'Finance & Operations' },
    { value: 'human-resources', label: 'Human Resources' },
    { value: 'information-technology', label: 'Information Technology' },
    { value: 'legal-compliance', label: 'Legal & Compliance' },
    { value: 'marketing-communications', label: 'Marketing & Communications' },
    { value: 'sales-distribution', label: 'Sales & Distribution' },
    { value: 'strategy-development', label: 'Strategy & Development' }
  ],
  region: [
    { value: 'all', label: 'All' },
    { value: 'south-africa', label: 'South Africa' },
    { value: 'southern-africa', label: 'Southern Africa' },
    { value: 'east-africa', label: 'East Africa' },
    { value: 'west-africa', label: 'West Africa' },
    { value: 'central-africa', label: 'Central Africa' },
    { value: 'international', label: 'International' }
  ]
};

let currentFilterKey = null;
let tempSelected = [];

const filterModal = document.getElementById('filterModal');
const filterModalTitle = document.getElementById('filterModalTitle');
const filterModalBody = document.getElementById('filterModalBody');
const applyFilterModal = document.getElementById('applyFilterModal');
const cancelFilterModal = document.getElementById('cancelFilterModal');

const workerGroupBtn = document.getElementById('openWorkerGroupModal');
const clusterBtn = document.getElementById('openClusterModal');
const businessUnitBtn = document.getElementById('openBusinessUnitModal');
const divisionsBtn = document.getElementById('openDivisionsModal');
const departmentsBtn = document.getElementById('openDepartmentsModal');
const teamsBtn = document.getElementById('openTeamsModal');
const jobFamilyBtn = document.getElementById('openJobFamilyModal');
const workersManagerBtn = document.getElementById('openWorkersManagerModal');
const genderBtn = document.getElementById('openGenderModal');
const raceBtn = document.getElementById('openRaceModal');
const ageBandBtn = document.getElementById('openAgeBandModal');
const managementLevelBtn = document.getElementById('openManagementLevelModal');
const companyBtn = document.getElementById('openCompanyModal');
const countryBtn = document.getElementById('openCountryModal');
const supervisoryOrgBtn = document.getElementById('openSupervisoryOrgModal');
const regionBtn = document.getElementById('openRegionModal');

const workerGroupSummary = document.getElementById('workerGroupSelectedSummary');
const clusterSummary = document.getElementById('clusterSelectedSummary');
const businessUnitSummary = document.getElementById('businessUnitSelectedSummary');
const divisionsSummary = document.getElementById('divisionsSelectedSummary');
const departmentsSummary = document.getElementById('departmentsSelectedSummary');
const teamsSummary = document.getElementById('teamsSelectedSummary');
const jobFamilySummary = document.getElementById('jobFamilySelectedSummary');
const workersManagerSummary = document.getElementById('workersManagerSelectedSummary');
const genderSummary = document.getElementById('genderSelectedSummary');
const raceSummary = document.getElementById('raceSelectedSummary');
const ageBandSummary = document.getElementById('ageBandSelectedSummary');
const managementLevelSummary = document.getElementById('managementLevelSelectedSummary');
const companySummary = document.getElementById('companySelectedSummary');
const countrySummary = document.getElementById('countrySelectedSummary');
const supervisoryOrgSummary = document.getElementById('supervisoryOrgSelectedSummary');
const regionSummary = document.getElementById('regionSelectedSummary');

let selectedWorkerGroup = filterOptions.workerGroup.map(o => o.value);
let selectedCluster = filterOptions.cluster.map(o => o.value);
let selectedBusinessUnit = filterOptions.businessUnit.map(o => o.value);
let selectedDivisions = filterOptions.divisions.map(o => o.value);
let selectedDepartments = filterOptions.departments.map(o => o.value);
let selectedTeams = filterOptions.teams.map(o => o.value);
let selectedJobFamily = filterOptions.jobFamily.map(o => o.value);
let selectedWorkersManager = filterOptions.workersManager.map(o => o.value);
let selectedGender = filterOptions.gender.map(o => o.value);
let selectedRace = filterOptions.race.map(o => o.value);
let selectedAgeBand = filterOptions.ageBand.map(o => o.value);
let selectedManagementLevel = filterOptions.managementLevel.map(o => o.value);
let selectedCompany = filterOptions.company.map(o => o.value);
let selectedCountry = filterOptions.country.map(o => o.value);
let selectedSupervisoryOrg = filterOptions.supervisoryOrg.map(o => o.value);
let selectedRegion = filterOptions.region.map(o => o.value);

function openFilterModal(filterKey, title, selected) {
  currentFilterKey = filterKey;
  tempSelected = [...selected];
  filterModalTitle.textContent = title;
  filterModalBody.innerHTML = '';
  const options = filterOptions[filterKey];
  options.forEach((opt, idx) => {
    const label = document.createElement('label');
    if (opt.value === 'all') label.classList.add('all-option');
    label.style.display = 'flex';
    label.style.alignItems = 'center';
    label.style.gap = '8px';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = opt.value;
    checkbox.checked = tempSelected.includes(opt.value);
    checkbox.addEventListener('change', (e) => {
      if (opt.value === 'all') {
        // Select/deselect all
        if (e.target.checked) {
          tempSelected = options.map(o => o.value);
        } else {
          tempSelected = [];
        }
        // Update all checkboxes
        filterModalBody.querySelectorAll('input[type="checkbox"]').forEach(cb => {
          cb.checked = e.target.checked;
        });
      } else {
        if (e.target.checked) {
          tempSelected.push(opt.value);
        } else {
          tempSelected = tempSelected.filter(v => v !== opt.value && v !== 'all');
        }
        // If all individual are checked, check 'all'
        const allExceptAll = options.filter(o => o.value !== 'all').map(o => o.value);
        const allChecked = allExceptAll.every(v => tempSelected.includes(v));
        filterModalBody.querySelector('input[value="all"]').checked = allChecked;
        if (allChecked) {
          if (!tempSelected.includes('all')) tempSelected.push('all');
        } else {
          tempSelected = tempSelected.filter(v => v !== 'all');
        }
      }
    });
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(opt.label));
    filterModalBody.appendChild(label);
    if (opt.value === 'all') {
      const divider = document.createElement('hr');
      divider.className = 'all-divider';
      filterModalBody.appendChild(divider);
    }
  });
  filterModal.classList.add('active');
}

workerGroupBtn.addEventListener('click', () => {
  openFilterModal('workerGroup', 'Select Worker Group', selectedWorkerGroup);
});

clusterBtn.addEventListener('click', () => {
  openFilterModal('cluster', 'Select Cluster', selectedCluster);
});

businessUnitBtn.addEventListener('click', () => {
  openFilterModal('businessUnit', 'Select Business Unit', selectedBusinessUnit);
});
divisionsBtn.addEventListener('click', () => {
  openFilterModal('divisions', 'Select Divisions', selectedDivisions);
});
departmentsBtn.addEventListener('click', () => {
  openFilterModal('departments', 'Select Departments', selectedDepartments);
});
teamsBtn.addEventListener('click', () => {
  openFilterModal('teams', 'Select Teams', selectedTeams);
});
jobFamilyBtn.addEventListener('click', () => {
  openFilterModal('jobFamily', 'Select Job Family', selectedJobFamily);
});
workersManagerBtn.addEventListener('click', () => {
  openFilterModal('workersManager', 'Select Worker\'s Manager', selectedWorkersManager);
});
genderBtn.addEventListener('click', () => {
  openFilterModal('gender', 'Select Gender', selectedGender);
});
raceBtn.addEventListener('click', () => {
  openFilterModal('race', 'Select Race', selectedRace);
});
ageBandBtn.addEventListener('click', () => {
  openFilterModal('ageBand', 'Select Age Band', selectedAgeBand);
});
managementLevelBtn.addEventListener('click', () => {
  openFilterModal('managementLevel', 'Select Management Level', selectedManagementLevel);
});
companyBtn.addEventListener('click', () => {
  openFilterModal('company', 'Select Company', selectedCompany);
});
countryBtn.addEventListener('click', () => {
  openFilterModal('country', 'Select Country', selectedCountry);
});
supervisoryOrgBtn.addEventListener('click', () => {
  openFilterModal('supervisoryOrg', 'Select Supervisory Organization', selectedSupervisoryOrg);
});
regionBtn.addEventListener('click', () => {
  openFilterModal('region', 'Select Region', selectedRegion);
});

applyFilterModal.addEventListener('click', () => {
  if (currentFilterKey === 'workerGroup') {
    selectedWorkerGroup = [...tempSelected];
    updateWorkerGroupSummary();
  } else if (currentFilterKey === 'cluster') {
    selectedCluster = [...tempSelected];
    updateClusterSummary();
  } else if (currentFilterKey === 'businessUnit') {
    selectedBusinessUnit = [...tempSelected];
    updateBusinessUnitSummary();
  } else if (currentFilterKey === 'divisions') {
    selectedDivisions = [...tempSelected];
    updateDivisionsSummary();
  } else if (currentFilterKey === 'departments') {
    selectedDepartments = [...tempSelected];
    updateDepartmentsSummary();
  } else if (currentFilterKey === 'teams') {
    selectedTeams = [...tempSelected];
    updateTeamsSummary();
  } else if (currentFilterKey === 'jobFamily') {
    selectedJobFamily = [...tempSelected];
    updateJobFamilySummary();
  } else if (currentFilterKey === 'workersManager') {
    selectedWorkersManager = [...tempSelected];
    updateWorkersManagerSummary();
  } else if (currentFilterKey === 'gender') {
    selectedGender = [...tempSelected];
    updateGenderSummary();
  } else if (currentFilterKey === 'race') {
    selectedRace = [...tempSelected];
    updateRaceSummary();
  } else if (currentFilterKey === 'ageBand') {
    selectedAgeBand = [...tempSelected];
    updateAgeBandSummary();
  } else if (currentFilterKey === 'managementLevel') {
    selectedManagementLevel = [...tempSelected];
    updateManagementLevelSummary();
  } else if (currentFilterKey === 'company') {
    selectedCompany = [...tempSelected];
    updateCompanySummary();
  } else if (currentFilterKey === 'country') {
    selectedCountry = [...tempSelected];
    updateCountrySummary();
  } else if (currentFilterKey === 'supervisoryOrg') {
    selectedSupervisoryOrg = [...tempSelected];
    updateSupervisoryOrgSummary();
  } else if (currentFilterKey === 'region') {
    selectedRegion = [...tempSelected];
    updateRegionSummary();
  }
  filterModal.classList.remove('active');
});

cancelFilterModal.addEventListener('click', () => {
  filterModal.classList.remove('active');
});

function updateWorkerGroupSummary() {
  if (selectedWorkerGroup.includes('all') || selectedWorkerGroup.length === filterOptions.workerGroup.length) {
    workerGroupSummary.textContent = 'All';
    workerGroupSummary.className = 'selected-summary';
  } else if (selectedWorkerGroup.length === 0) {
    workerGroupSummary.textContent = 'None';
    workerGroupSummary.className = 'selected-summary';
  } else {
    workerGroupSummary.innerHTML = '';
    workerGroupSummary.className = 'selected-summary multiple';
    const selectedOptions = filterOptions.workerGroup
      .filter(opt => selectedWorkerGroup.includes(opt.value) && opt.value !== 'all');
    selectedOptions.forEach(opt => {
      const tag = document.createElement('span');
      tag.className = 'summary-tag';
      tag.textContent = opt.label;
      workerGroupSummary.appendChild(tag);
    });
  }
}

function updateClusterSummary() {
  if (selectedCluster.includes('all') || selectedCluster.length === filterOptions.cluster.length) {
    clusterSummary.textContent = 'All';
    clusterSummary.className = 'selected-summary';
  } else if (selectedCluster.length === 0) {
    clusterSummary.textContent = 'None';
    clusterSummary.className = 'selected-summary';
  } else {
    clusterSummary.innerHTML = '';
    clusterSummary.className = 'selected-summary multiple';
    const selectedOptions = filterOptions.cluster
      .filter(opt => selectedCluster.includes(opt.value) && opt.value !== 'all');
    selectedOptions.forEach(opt => {
      const tag = document.createElement('span');
      tag.className = 'summary-tag';
      tag.textContent = opt.label;
      clusterSummary.appendChild(tag);
    });
  }
}
function updateDivisionsSummary() {
  if (selectedDivisions.includes('all') || selectedDivisions.length === filterOptions.divisions.length) {
    divisionsSummary.textContent = 'All';
    divisionsSummary.className = 'selected-summary';
  } else if (selectedDivisions.length === 0) {
    divisionsSummary.textContent = 'None';
    divisionsSummary.className = 'selected-summary';
  } else {
    divisionsSummary.innerHTML = '';
    divisionsSummary.className = 'selected-summary multiple';
    const selectedOptions = filterOptions.divisions
      .filter(opt => selectedDivisions.includes(opt.value) && opt.value !== 'all');
    selectedOptions.forEach(opt => {
      const tag = document.createElement('span');
      tag.className = 'summary-tag';
      tag.textContent = opt.label;
      divisionsSummary.appendChild(tag);
    });
  }
}
function updateRaceSummary() {
  if (selectedRace.includes('all') || selectedRace.length === filterOptions.race.length) {
    raceSummary.textContent = 'All';
    raceSummary.className = 'selected-summary';
  } else if (selectedRace.length === 0) {
    raceSummary.textContent = 'None';
    raceSummary.className = 'selected-summary';
  } else {
    raceSummary.innerHTML = '';
    raceSummary.className = 'selected-summary multiple';
    const selectedOptions = filterOptions.race
      .filter(opt => selectedRace.includes(opt.value) && opt.value !== 'all');
    selectedOptions.forEach(opt => {
      const tag = document.createElement('span');
      tag.className = 'summary-tag';
      tag.textContent = opt.label;
      raceSummary.appendChild(tag);
    });
  }
}
function updateGenderSummary() {
  if (selectedGender.includes('all') || selectedGender.length === filterOptions.gender.length) {
    genderSummary.textContent = 'All';
    genderSummary.className = 'selected-summary';
  } else if (selectedGender.length === 0) {
    genderSummary.textContent = 'None';
    genderSummary.className = 'selected-summary';
  } else {
    genderSummary.innerHTML = '';
    genderSummary.className = 'selected-summary multiple';
    const selectedOptions = filterOptions.gender
      .filter(opt => selectedGender.includes(opt.value) && opt.value !== 'all');
    selectedOptions.forEach(opt => {
      const tag = document.createElement('span');
      tag.className = 'summary-tag';
      tag.textContent = opt.label;
      genderSummary.appendChild(tag);
    });
  }
}
function updateAgeBandSummary() {
  if (selectedAgeBand.includes('all') || selectedAgeBand.length === filterOptions.ageBand.length) {
    ageBandSummary.textContent = 'All';
    ageBandSummary.className = 'selected-summary';
  } else if (selectedAgeBand.length === 0) {
    ageBandSummary.textContent = 'None';
    ageBandSummary.className = 'selected-summary';
  } else {
    ageBandSummary.innerHTML = '';
    ageBandSummary.className = 'selected-summary multiple';
    const selectedOptions = filterOptions.ageBand
      .filter(opt => selectedAgeBand.includes(opt.value) && opt.value !== 'all');
    selectedOptions.forEach(opt => {
      const tag = document.createElement('span');
      tag.className = 'summary-tag';
      tag.textContent = opt.label;
      ageBandSummary.appendChild(tag);
    });
  }
}
function updateTenureSummary() {
  if (selectedTenure.includes('all') || selectedTenure.length === filterOptions.tenure.length) {
    tenureSummary.textContent = 'All';
    tenureSummary.className = 'selected-summary';
  } else if (selectedTenure.length === 0) {
    tenureSummary.textContent = 'None';
    tenureSummary.className = 'selected-summary';
  } else {
    tenureSummary.innerHTML = '';
    tenureSummary.className = 'selected-summary multiple';
    const selectedOptions = filterOptions.tenure
      .filter(opt => selectedTenure.includes(opt.value) && opt.value !== 'all');
    selectedOptions.forEach(opt => {
      const tag = document.createElement('span');
      tag.className = 'summary-tag';
      tag.textContent = opt.label;
      tenureSummary.appendChild(tag);
    });
  }
}

function updateDepartmentsSummary() {
  if (selectedDepartments.includes('all') || selectedDepartments.length === filterOptions.departments.length) {
    departmentsSummary.textContent = 'All';
    departmentsSummary.className = 'selected-summary';
  } else if (selectedDepartments.length === 0) {
    departmentsSummary.textContent = 'None';
    departmentsSummary.className = 'selected-summary';
  } else {
    departmentsSummary.innerHTML = '';
    departmentsSummary.className = 'selected-summary multiple';
    const selectedOptions = filterOptions.departments
      .filter(opt => selectedDepartments.includes(opt.value) && opt.value !== 'all');
    selectedOptions.forEach(opt => {
      const tag = document.createElement('span');
      tag.className = 'summary-tag';
      tag.textContent = opt.label;
      departmentsSummary.appendChild(tag);
    });
  }
}

function updateTeamsSummary() {
  if (selectedTeams.includes('all') || selectedTeams.length === filterOptions.teams.length) {
    teamsSummary.textContent = 'All';
    teamsSummary.className = 'selected-summary';
  } else if (selectedTeams.length === 0) {
    teamsSummary.textContent = 'None';
    teamsSummary.className = 'selected-summary';
  } else {
    teamsSummary.innerHTML = '';
    teamsSummary.className = 'selected-summary multiple';
    const selectedOptions = filterOptions.teams
      .filter(opt => selectedTeams.includes(opt.value) && opt.value !== 'all');
    selectedOptions.forEach(opt => {
      const tag = document.createElement('span');
      tag.className = 'summary-tag';
      tag.textContent = opt.label;
      teamsSummary.appendChild(tag);
    });
  }
}

function updateJobFamilySummary() {
  if (selectedJobFamily.includes('all') || selectedJobFamily.length === filterOptions.jobFamily.length) {
    jobFamilySummary.textContent = 'All';
    jobFamilySummary.className = 'selected-summary';
  } else if (selectedJobFamily.length === 0) {
    jobFamilySummary.textContent = 'None';
    jobFamilySummary.className = 'selected-summary';
  } else {
    jobFamilySummary.innerHTML = '';
    jobFamilySummary.className = 'selected-summary multiple';
    const selectedOptions = filterOptions.jobFamily
      .filter(opt => selectedJobFamily.includes(opt.value) && opt.value !== 'all');
    selectedOptions.forEach(opt => {
      const tag = document.createElement('span');
      tag.className = 'summary-tag';
      tag.textContent = opt.label;
      jobFamilySummary.appendChild(tag);
    });
  }
}

function updateWorkersManagerSummary() {
  if (selectedWorkersManager.includes('all') || selectedWorkersManager.length === filterOptions.workersManager.length) {
    workersManagerSummary.textContent = 'All';
    workersManagerSummary.className = 'selected-summary';
  } else if (selectedWorkersManager.length === 0) {
    workersManagerSummary.textContent = 'None';
    workersManagerSummary.className = 'selected-summary';
  } else {
    workersManagerSummary.innerHTML = '';
    workersManagerSummary.className = 'selected-summary multiple';
    const selectedOptions = filterOptions.workersManager
      .filter(opt => selectedWorkersManager.includes(opt.value) && opt.value !== 'all');
    selectedOptions.forEach(opt => {
      const tag = document.createElement('span');
      tag.className = 'summary-tag';
      tag.textContent = opt.label;
      workersManagerSummary.appendChild(tag);
    });
  }
}

function updateManagementLevelSummary() {
  if (selectedManagementLevel.includes('all') || selectedManagementLevel.length === filterOptions.managementLevel.length) {
    managementLevelSummary.textContent = 'All';
    managementLevelSummary.className = 'selected-summary';
  } else if (selectedManagementLevel.length === 0) {
    managementLevelSummary.textContent = 'None';
    managementLevelSummary.className = 'selected-summary';
  } else {
    managementLevelSummary.innerHTML = '';
    managementLevelSummary.className = 'selected-summary multiple';
    const selectedOptions = filterOptions.managementLevel
      .filter(opt => selectedManagementLevel.includes(opt.value) && opt.value !== 'all');
    selectedOptions.forEach(opt => {
      const tag = document.createElement('span');
      tag.className = 'summary-tag';
      tag.textContent = opt.label;
      managementLevelSummary.appendChild(tag);
    });
  }
}

function updateCompanySummary() {
  if (selectedCompany.includes('all') || selectedCompany.length === filterOptions.company.length) {
    companySummary.textContent = 'All';
    companySummary.className = 'selected-summary';
  } else if (selectedCompany.length === 0) {
    companySummary.textContent = 'None';
    companySummary.className = 'selected-summary';
  } else {
    companySummary.innerHTML = '';
    companySummary.className = 'selected-summary multiple';
    const selectedOptions = filterOptions.company
      .filter(opt => selectedCompany.includes(opt.value) && opt.value !== 'all');
    selectedOptions.forEach(opt => {
      const tag = document.createElement('span');
      tag.className = 'summary-tag';
      tag.textContent = opt.label;
      companySummary.appendChild(tag);
    });
  }
}

function updateCountrySummary() {
  if (selectedCountry.includes('all') || selectedCountry.length === filterOptions.country.length) {
    countrySummary.textContent = 'All';
    countrySummary.className = 'selected-summary';
  } else if (selectedCountry.length === 0) {
    countrySummary.textContent = 'None';
    countrySummary.className = 'selected-summary';
  } else {
    countrySummary.innerHTML = '';
    countrySummary.className = 'selected-summary multiple';
    const selectedOptions = filterOptions.country
      .filter(opt => selectedCountry.includes(opt.value) && opt.value !== 'all');
    selectedOptions.forEach(opt => {
      const tag = document.createElement('span');
      tag.className = 'summary-tag';
      tag.textContent = opt.label;
      countrySummary.appendChild(tag);
    });
  }
}

function updateSupervisoryOrgSummary() {
  if (selectedSupervisoryOrg.includes('all') || selectedSupervisoryOrg.length === filterOptions.supervisoryOrg.length) {
    supervisoryOrgSummary.textContent = 'All';
    supervisoryOrgSummary.className = 'selected-summary';
  } else if (selectedSupervisoryOrg.length === 0) {
    supervisoryOrgSummary.textContent = 'None';
    supervisoryOrgSummary.className = 'selected-summary';
  } else {
    supervisoryOrgSummary.innerHTML = '';
    supervisoryOrgSummary.className = 'selected-summary multiple';
    const selectedOptions = filterOptions.supervisoryOrg
      .filter(opt => selectedSupervisoryOrg.includes(opt.value) && opt.value !== 'all');
    selectedOptions.forEach(opt => {
      const tag = document.createElement('span');
      tag.className = 'summary-tag';
      tag.textContent = opt.label;
      supervisoryOrgSummary.appendChild(tag);
    });
  }
}

function updateRegionSummary() {
  if (selectedRegion.includes('all') || selectedRegion.length === filterOptions.region.length) {
    regionSummary.textContent = 'All';
    regionSummary.className = 'selected-summary';
  } else if (selectedRegion.length === 0) {
    regionSummary.textContent = 'None';
    regionSummary.className = 'selected-summary';
  } else {
    regionSummary.innerHTML = '';
    regionSummary.className = 'selected-summary multiple';
    const selectedOptions = filterOptions.region
      .filter(opt => selectedRegion.includes(opt.value) && opt.value !== 'all');
    selectedOptions.forEach(opt => {
      const tag = document.createElement('span');
      tag.className = 'summary-tag';
      tag.textContent = opt.label;
      regionSummary.appendChild(tag);
    });
  }
}
updateWorkerGroupSummary();
updateClusterSummary();
updateBusinessUnitSummary();
updateDivisionsSummary();
updateDepartmentsSummary();
updateTeamsSummary();
updateJobFamilySummary();
updateWorkersManagerSummary();
updateGenderSummary();
updateRaceSummary();
updateAgeBandSummary();
updateManagementLevelSummary();
updateCompanySummary();
updateCountrySummary();
updateSupervisoryOrgSummary();
updateRegionSummary();

// Dimension-specific sentiment data
const dimensionSentimentData = {
    engagement: {
        sentiment: {
            positive: 65,
            neutral: 25,
            negative: 10,
            totalComments: 847
        },
        sentimentAnalysis: {
            positive: [
                { theme: "Work-Life Balance", comments: 156, percentage: 18.4 },
                { theme: "Team Collaboration", comments: 134, percentage: 15.8 },
                { theme: "Career Growth", comments: 98, percentage: 11.6 },
                { theme: "Recognition & Rewards", comments: 87, percentage: 10.3 },
                { theme: "Leadership Support", comments: 76, percentage: 9.0 }
            ],
            negative: [
                { theme: "Workload Management", comments: 45, percentage: 5.3 },
                { theme: "Communication Issues", comments: 38, percentage: 4.5 },
                { theme: "Resource Constraints", comments: 32, percentage: 3.8 },
                { theme: "Process Inefficiencies", comments: 28, percentage: 3.3 },
                { theme: "Technology Challenges", comments: 25, percentage: 3.0 }
            ]
        }
    },
    organisationalCulture: {
        sentiment: {
            positive: 45,
            neutral: 35,
            negative: 20,
            totalComments: 623
        },
        sentimentAnalysis: {
            positive: [
                { theme: "Change Communication", comments: 89, percentage: 14.3 },
                { theme: "Training & Support", comments: 76, percentage: 12.2 },
                { theme: "Leadership Commitment", comments: 67, percentage: 10.8 },
                { theme: "Clear Objectives", comments: 58, percentage: 9.3 },
                { theme: "Employee Involvement", comments: 52, percentage: 8.3 }
            ],
            negative: [
                { theme: "Change Resistance", comments: 78, percentage: 12.5 },
                { theme: "Uncertainty & Fear", comments: 65, percentage: 10.4 },
                { theme: "Lack of Clarity", comments: 54, percentage: 8.7 },
                { theme: "Insufficient Training", comments: 48, percentage: 7.7 },
                { theme: "Poor Communication", comments: 42, percentage: 6.7 }
            ]
        }
    }
};

// Dimension Tab Functionality
function setupDimensionTabs() {
    // Get the active content section
    const activeSection = document.querySelector('.content-section.active');
    if (!activeSection) return;
    
    // Find tabs and panes within the active section only (support both dimension-tab and content-tab)
    const tabs = activeSection.querySelectorAll('.dimension-tab, .content-tab');
    const tabPanes = activeSection.querySelectorAll('.dimension-tab-pane, .content-tab-pane');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and panes in this section only
            tabs.forEach(t => t.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding pane
            this.classList.add('active');
            
            // Try to find the target pane with different ID patterns
            let targetPane = activeSection.querySelector(`#${targetTab}-tab`);
            if (!targetPane) {
                // Try with EE suffix for the overview-ee page
                targetPane = activeSection.querySelector(`#${targetTab}-tab-ee`);
            }
            
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
}

// Render dimension-specific sentiment
function renderDimensionSentiment(dimension) {
    // Get the active content section
    const activeSection = document.querySelector('.content-section.active');
    if (!activeSection) return;
    
    // Find sentiment elements within the active section, trying both ID patterns
    let sentimentChart = activeSection.querySelector(`#${dimension}SentimentChart`);
    let sentimentAnalysis = activeSection.querySelector(`#${dimension}SentimentAnalysis`);
    
    // If not found, try with EE suffix for the overview-ee page
    if (!sentimentChart) {
        sentimentChart = activeSection.querySelector(`#${dimension}SentimentChartEE`);
    }
    if (!sentimentAnalysis) {
        sentimentAnalysis = activeSection.querySelector(`#${dimension}SentimentAnalysisEE`);
    }
    
    if (!sentimentChart || !sentimentAnalysis) return;
    
    // Clear any existing content
    sentimentChart.innerHTML = '';
    sentimentAnalysis.innerHTML = '';
    
    const data = dimensionSentimentData[dimension];
    if (!data) return;
    
    // Create and style the chart container
    const chartContainer = document.createElement('div');
    chartContainer.style.display = 'flex';
    chartContainer.style.alignItems = 'center';
    chartContainer.style.gap = '24px';
    
    // Create tooltip div
    const tooltip = document.createElement('div');
    tooltip.className = 'chart-tooltip';
    tooltip.style.display = 'none';
    chartContainer.appendChild(tooltip);
    
    // Render donut chart
    const canvas = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 300 * dpr;
    canvas.height = 300 * dpr;
    canvas.style.width = '300px';
    canvas.style.height = '300px';
    
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    const centerX = 150;
    const centerY = 150;
    const radius = 140;
    const innerRadius = radius * 0.7;
    
    // Calculate actual comment numbers based on percentages
    const totalComments = data.sentiment.totalComments;
    const positiveComments = Math.round(totalComments * (data.sentiment.positive / 100));
    const neutralComments = Math.round(totalComments * (data.sentiment.neutral / 100));
    const negativeComments = Math.round(totalComments * (data.sentiment.negative / 100));
    
    // Store segment data for hover detection
    const segments = [
        {
            name: 'Positive',
            percentage: data.sentiment.positive,
            comments: positiveComments,
            color: '#00AE4E',
            startAngle: 0,
            endAngle: 0
        },
        {
            name: 'Neutral',
            percentage: data.sentiment.neutral,
            comments: neutralComments,
            color: '#FFB800',
            startAngle: 0,
            endAngle: 0
        },
        {
            name: 'Negative',
            percentage: data.sentiment.negative,
            comments: negativeComments,
            color: '#FF0000',
            startAngle: 0,
            endAngle: 0
        }
    ];
    
    // Calculate and store angles
    let currentAngle = 0;
    segments.forEach(segment => {
        segment.startAngle = currentAngle;
        segment.endAngle = currentAngle + (Math.PI * 2 * (segment.percentage / 100));
        currentAngle = segment.endAngle;
    });
    
    function drawDonutSegment(segment) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, segment.startAngle, segment.endAngle);
        ctx.arc(centerX, centerY, innerRadius, segment.endAngle, segment.startAngle, true);
        ctx.closePath();
        ctx.fillStyle = segment.color;
        ctx.fill();
    }
    
    // Draw all segments
    segments.forEach(drawDonutSegment);
    
    // Wait for font to load before drawing text
    document.fonts.ready.then(() => {
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.font = '600 16px Montserrat';
        ctx.fillText('Total Comments', centerX, centerY - 15);
        
        ctx.font = '600 24px Montserrat';
        ctx.fillText(totalComments.toLocaleString(), centerX, centerY + 15);
    });
    
    chartContainer.appendChild(canvas);
    
    // Add legend with updated format
    const legendEl = document.createElement('div');
    legendEl.className = 'sentiment-legend';
    legendEl.innerHTML = segments.map(segment => `
        <div class="legend-item">
            <div class="legend-dot ${segment.name.toLowerCase()}"></div>
            <span>${segment.name}:<br/>${segment.comments.toLocaleString()} <strong>(${segment.percentage}%)</strong></span>
        </div>
    `).join('');
    
    chartContainer.appendChild(legendEl);
    sentimentChart.appendChild(chartContainer);
    
    // Render sentiment analysis themes
    const maxComments = Math.max(
        ...data.sentimentAnalysis.positive.map(item => item.comments),
        ...data.sentimentAnalysis.negative.map(item => item.comments)
    );

    // Create a row for the two columns
    const themesRow = document.createElement('div');
    themesRow.className = 'sentiment-themes-row';

    // Create positive and negative sections
    const positiveSection = document.createElement('div');
    positiveSection.className = 'analysis-section';
    renderDimensionAnalysisList(
        data.sentimentAnalysis.positive, 
        'Top 5 Positive Themes',
        maxComments,
        'positive',
        positiveSection
    );

    const negativeSection = document.createElement('div');
    negativeSection.className = 'analysis-section';
    renderDimensionAnalysisList(
        data.sentimentAnalysis.negative, 
        'Bottom 5 Negative Themes',
        maxComments,
        'negative',
        negativeSection
    );

    themesRow.appendChild(positiveSection);
    themesRow.appendChild(negativeSection);
    sentimentAnalysis.appendChild(themesRow);
}

// Render dimension-specific analysis list
function renderDimensionAnalysisList(items, titleText, maxComments, type, container) {
    const analysisSection = document.createElement('div');
    analysisSection.className = 'analysis-section';
    
    const title = document.createElement('h4');
    title.textContent = titleText;
    analysisSection.appendChild(title);
    
    const analysisList = document.createElement('div');
    analysisList.className = 'analysis-list';
    
    items.forEach(item => {
        const analysisItem = document.createElement('div');
        analysisItem.className = 'analysis-item';
        
        // Calculate width relative to the theme with the most comments
        const barWidth = (item.comments / maxComments) * 100;
        
        analysisItem.innerHTML = `
            <div class="analysis-header">
                <div class="theme-name">${item.theme}</div>
                <div class="comment-count">${item.comments} comments</div>
            </div>
            <div class="analysis-bar">
                <div class="analysis-bar-fill ${type}" style="width: ${barWidth}%"></div>
            </div>
        `;
        analysisList.appendChild(analysisItem);
    });
    
    analysisSection.appendChild(analysisList);
    container.appendChild(analysisSection);
}

// Function to simulate MFC user filter (Mass and Foundation Cluster only)
function simulateMFCUserFilter() {
    // Set the active filters to only include Mass and Foundation Cluster
    activeFilters = {
        organization: {
            cluster: ['mass-foundation-cluster']
        },
        demographics: {
            age: [],
            gender: [],
            race: [],
            jobLevel: []
        }
    };
    
    // Filter tag is now hardcoded in HTML for EE-only page
    
    // Set up the filter dropdown to show pre-selected Mass and Foundation Cluster
    setupMFCFilterDropdown();
    
    // Simulate data changes to reflect the filter
    simulateDataChanges();
}

// Function to set up MFC filter dropdown (only for EE-only page)
function setupMFCFilterDropdown() {
    // Only apply MFC filter on EE-only page
    const activeSection = document.querySelector('.content-section.active');
    if (!activeSection || activeSection.id !== 'overview-ee') {
        return; // Don't apply MFC filter on other pages
    }
    
    // Find the cluster dropdown and set it to show Mass and Foundation Cluster
    const clusterDropdown = document.querySelector('[data-target="clusterDropdown"]');
    if (clusterDropdown) {
        const dropdownText = clusterDropdown.querySelector('.dropdown-text');
        if (dropdownText) {
            dropdownText.textContent = 'Mass and Foundation Cluster';
        }
        
        // Disable the dropdown to prevent changes
        clusterDropdown.style.pointerEvents = 'none';
        clusterDropdown.style.opacity = '0.6';
        clusterDropdown.title = 'Filter locked to Mass and Foundation Cluster';
    }
    
    // Check the Mass and Foundation Cluster checkbox
    const mfcCheckbox = document.querySelector('input[value="mass-foundation-cluster"]');
    if (mfcCheckbox) {
        mfcCheckbox.checked = true;
        mfcCheckbox.disabled = true;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    renderAllData();
    setupFilters();
    setupModalControls();
    setupReportBuilder();
    initializeProgressTracker();
    setupQuickDemo();
    setupDimensionTabs();
}); 

function updateBusinessUnitSummary() {
  if (selectedBusinessUnit.includes('all') || selectedBusinessUnit.length === filterOptions.businessUnit.length) {
    businessUnitSummary.textContent = 'All';
    businessUnitSummary.className = 'selected-summary';
  } else if (selectedBusinessUnit.length === 0) {
    businessUnitSummary.textContent = 'None';
    businessUnitSummary.className = 'selected-summary';
  } else {
    businessUnitSummary.innerHTML = '';
    businessUnitSummary.className = 'selected-summary multiple';
    const selectedOptions = filterOptions.businessUnit
      .filter(opt => selectedBusinessUnit.includes(opt.value) && opt.value !== 'all');
    selectedOptions.forEach(opt => {
      const tag = document.createElement('span');
      tag.className = 'summary-tag';
      tag.textContent = opt.label;
      businessUnitSummary.appendChild(tag);
    });
  }
}

function updateDivisionsSummary() {
// ... existing code ...
}