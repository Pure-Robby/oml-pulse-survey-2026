// Static Dashboard JavaScript - No Dynamic Data Loading
// Handles UI interactions, progress circles, donut charts, and filter functionality

document.addEventListener('DOMContentLoaded', function() {
    
    // --- Filter Menu Off-Canvas Functionality ---
    const filterToggle = document.getElementById('filterToggle');
    const filterMenu = document.getElementById('filterMenu');
    const closeFilters = document.getElementById('closeFilters');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const applyFilters = document.getElementById('applyFilters');
    const clearFilters = document.getElementById('clearFilters');

    // Open filter menu
    if (filterToggle) {
        filterToggle.addEventListener('click', function() {
            filterMenu.classList.add('open');
            document.body.classList.add('filter-menu-open');
        });
    }

    // Close filter menu
    if (closeFilters) {
        closeFilters.addEventListener('click', function() {
            filterMenu.classList.remove('open');
            document.body.classList.remove('filter-menu-open');
        });
    }

    // Apply filters (just close menu and show loading briefly)
    if (applyFilters) {
        applyFilters.addEventListener('click', function() {
            if (loadingOverlay) {
                loadingOverlay.style.display = 'flex';
                setTimeout(() => {
                    loadingOverlay.style.display = 'none';
                }, 1500);
            }
            filterMenu.classList.remove('open');
            document.body.classList.remove('filter-menu-open');
        });
    }

    // Clear all filters
    if (clearFilters) {
        clearFilters.addEventListener('click', function() {
            // Reset all checkboxes
            const checkboxes = filterMenu.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            
            // Update dropdown texts
            updateDropdownTexts();
        });
    }

    // --- Filter Dropdown Functionality ---
    const filterDropdowns = document.querySelectorAll('.filter-dropdown-btn');
    
    filterDropdowns.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const targetId = this.getAttribute('data-target');
            const dropdown = document.getElementById(targetId);
            
            // Close other dropdowns
            document.querySelectorAll('.filter-dropdown-content').forEach(d => {
                if (d !== dropdown) {
                    d.classList.remove('show');
                }
            });
            
            // Toggle current dropdown
            dropdown.classList.toggle('show');
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function() {
        document.querySelectorAll('.filter-dropdown-content').forEach(dropdown => {
            dropdown.classList.remove('show');
        });
    });

    // Handle select all functionality
    const selectAllCheckboxes = document.querySelectorAll('.select-all');
    selectAllCheckboxes.forEach(selectAll => {
        selectAll.addEventListener('change', function() {
            const target = this.getAttribute('data-target');
            const targetCheckboxes = document.querySelectorAll(`input[name="${target}"]`);
            
            targetCheckboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
            
            updateDropdownTexts();
        });
    });

    // Handle individual checkbox changes
    const filterCheckboxes = document.querySelectorAll('.filter-dropdown-content input[type="checkbox"]:not(.select-all)');
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateDropdownTexts();
            updateSelectAllStates();
        });
    });

    function updateDropdownTexts() {
        const dropdowns = document.querySelectorAll('.filter-dropdown');
        
        dropdowns.forEach(dropdown => {
            const button = dropdown.querySelector('.filter-dropdown-btn');
            const dropdownText = button.querySelector('.dropdown-text');
            const content = dropdown.querySelector('.filter-dropdown-content');
            const checkboxes = content.querySelectorAll('input[type="checkbox"]:not(.select-all)');
            const checkedBoxes = content.querySelectorAll('input[type="checkbox"]:not(.select-all):checked');
            
            if (checkedBoxes.length === 0) {
                dropdownText.textContent = 'None selected';
            } else if (checkedBoxes.length === checkboxes.length) {
                dropdownText.textContent = 'All';
            } else if (checkedBoxes.length === 1) {
                dropdownText.textContent = checkedBoxes[0].parentElement.textContent.trim();
            } else {
                dropdownText.textContent = `${checkedBoxes.length} selected`;
            }
        });
    }

    function updateSelectAllStates() {
        const selectAllCheckboxes = document.querySelectorAll('.select-all');
        
        selectAllCheckboxes.forEach(selectAll => {
            const target = selectAll.getAttribute('data-target');
            const targetCheckboxes = document.querySelectorAll(`input[name="${target}"]`);
            const checkedTargets = document.querySelectorAll(`input[name="${target}"]:checked`);
            
            if (checkedTargets.length === 0) {
                selectAll.checked = false;
                selectAll.indeterminate = false;
            } else if (checkedTargets.length === targetCheckboxes.length) {
                selectAll.checked = true;
                selectAll.indeterminate = false;
            } else {
                selectAll.checked = false;
                selectAll.indeterminate = true;
            }
        });
    }

    // --- Progress Circle Rendering ---
    function createProgressCircle(element, value, color) {
        const size = 120;
        const strokeWidth = 8;
        const radius = (size - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const progress = (value / 100) * circumference;
        
        element.innerHTML = `
            <svg width="${size}" height="${size}" class="progress-circle">
                <circle 
                    cx="${size/2}" 
                    cy="${size/2}" 
                    r="${radius}"
                    stroke="#e0e0e0"
                    stroke-width="${strokeWidth}"
                    fill="none">
                </circle>
                <circle 
                    cx="${size/2}" 
                    cy="${size/2}" 
                    r="${radius}"
                    stroke="${color}"
                    stroke-width="${strokeWidth}"
                    fill="none"
                    stroke-dasharray="${circumference}"
                    stroke-dashoffset="${circumference - progress}"
                    stroke-linecap="round"
                    transform="rotate(-90 ${size/2} ${size/2})"
                    class="progress-circle-fill">
                </circle>
            </svg>
            <div class="progress-text">
                <div class="progress-value">${value}%</div>
            </div>
        `;
    }

    // Initialize all progress circles
    const progressCircles = document.querySelectorAll('.circular-progress[data-value]');
    progressCircles.forEach(circle => {
        const value = parseInt(circle.getAttribute('data-value'));
        const color = circle.getAttribute('data-color') || getProgressColor(value);
        createProgressCircle(circle, value, color);
    });

    // --- Donut Chart Rendering (Matching Original Implementation) ---
    function createDonutChart(canvas, data) {
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
        const totalComments = data.totalComments;
        const positiveComments = Math.round(totalComments * (data.positive / 100));
        const neutralComments = Math.round(totalComments * (data.neutral / 100));
        const negativeComments = Math.round(totalComments * (data.negative / 100));
        
        // Store segment data for drawing
        const segments = [
            {
                name: 'Positive',
                percentage: data.positive,
                comments: positiveComments,
                color: '#00AE4E',
                startAngle: 0,
                endAngle: 0
            },
            {
                name: 'Neutral',
                percentage: data.neutral,
                comments: neutralComments,
                color: '#FFB800',
                startAngle: 0,
                endAngle: 0
            },
            {
                name: 'Negative',
                percentage: data.negative,
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
        
        return segments; // Return for legend creation
    }

    // Initialize donut charts
    const sentimentCharts = document.querySelectorAll('.sentiment-chart[data-sentiment]');
    sentimentCharts.forEach(chartContainer => {
        const data = JSON.parse(chartContainer.getAttribute('data-sentiment'));
        
        // Create and style the chart container
        const chartDiv = document.createElement('div');
        chartDiv.style.display = 'flex';
        chartDiv.style.alignItems = 'center';
        chartDiv.style.gap = '24px';
        
        // Create canvas
        const canvas = document.createElement('canvas');
        const segments = createDonutChart(canvas, data);
        chartDiv.appendChild(canvas);
        
        // Add legend with updated format matching original
        const legendEl = document.createElement('div');
        legendEl.className = 'sentiment-legend';
        legendEl.innerHTML = segments.map(segment => `
            <div class="legend-item">
                <div class="legend-dot ${segment.name.toLowerCase()}"></div>
                <span>${segment.name}:<br/>${segment.comments.toLocaleString()} <strong>(${segment.percentage}%)</strong></span>
            </div>
        `).join('');
        
        chartDiv.appendChild(legendEl);
        
        // Replace the container content
        chartContainer.innerHTML = '';
        chartContainer.appendChild(chartDiv);
    });

    // --- Dimension Tab Functionality ---
    const dimensionTabs = document.querySelectorAll('.dimension-tab');
    const dimensionTabPanes = document.querySelectorAll('.dimension-tab-pane');

    dimensionTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and panes
            dimensionTabs.forEach(t => t.classList.remove('active'));
            dimensionTabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding pane
            this.classList.add('active');
            const targetPane = document.getElementById(targetTab + '-tab');
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });

    // --- Utility Functions ---
    function getProgressColor(value) {
        if (value >= 85) return '#00AE4E';  // Dark Green
        if (value >= 65) return '#92D051';  // Light Green  
        if (value >= 51) return '#FFB800';  // Yellow/Orange
        return '#FF0000';                   // Red
    }

    // --- Survey Access Modal (if present) ---
    const openSurveyBtn = document.getElementById('openSurvey');
    if (openSurveyBtn) {
        openSurveyBtn.addEventListener('click', function() {
            // Open survey in new tab
            window.open('survey/index.html', '_blank');
        });
    }

    // Initialize dropdown texts on page load
    updateDropdownTexts();
    updateSelectAllStates();
});

// Export for potential external use
window.StaticDashboard = {
    getProgressColor: function(value) {
        if (value >= 85) return '#00AE4E';
        if (value >= 65) return '#92D051';
        if (value >= 51) return '#FFB800';
        return '#FF0000';
    }
}; 