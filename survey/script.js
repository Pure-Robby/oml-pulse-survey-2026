// Old Mutual Staff Culture Survey - JavaScript

// Check for access type and update landing page content
function checkAccessTypeAndUpdateContent() {
    const urlParams = new URLSearchParams(window.location.search);
    const accessType = urlParams.get('access');
    const guid = urlParams.get('guid');
    
    // Get the elements to modify
    const gettingStartedText = document.getElementById('gettingStartedText');
    const startButtonText = document.getElementById('startButtonText');
    const startButton = document.getElementById('startSurvey');
    
    if (accessType === 'auth') {
        // Authentication required access
        if (gettingStartedText) {
            gettingStartedText.innerHTML = '<strong>Authentication Required:</strong> Using a generic link will require you to validate your employee details before you can complete the survey.';
        }
        if (startButtonText) {
            startButtonText.textContent = 'Log in';
        }
        if (startButton) {
            // Change the icon to login
            const icon = startButton.querySelector('.material-icons');
            if (icon) {
                icon.textContent = 'login';
            }
            
            // Override the click handler to redirect to login
            // Remove any existing click handlers
            const newButton = startButton.cloneNode(true);
            startButton.parentNode.replaceChild(newButton, startButton);
            
            // Add new click handler for login that prevents default behavior
            newButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = '../landing.html';
            });
            
            // Also prevent any form submission and mark as login mode
            newButton.setAttribute('type', 'button');
            newButton.setAttribute('data-mode', 'login');
        }
    } else if (guid) {
        // GUID/Personalized link access - keep default content
        // Content is already set in HTML, no changes needed
    }
}


document.addEventListener('DOMContentLoaded', function() {
    checkAccessTypeAndUpdateContent();
    
    // Check if we should start on a specific page (e.g., after login)
    const urlParams = new URLSearchParams(window.location.search);
    const startPage = urlParams.get('page');
    
    if (startPage && parseInt(startPage) > 0) {
        // User is coming from login, start directly on the specified page
        // Wait for the survey to initialize before showing the page
        const checkAndShowPage = () => {
            if (window.survey && typeof window.survey.showPage === 'function') {
                window.survey.showPage(parseInt(startPage));
            } else {
                // Survey not ready yet, try again
                setTimeout(checkAndShowPage, 50);
            }
        };
        setTimeout(checkAndShowPage, 200);
    }
});

class PulseCultureSurvey {
    constructor() {
        this.currentPage = 0; // Start at landing page (0)
        this.responses = {};
        this.maxScore = 5;
        
        // Initialize using configuration system
        this.questionManager = new QuestionNumberingManager();
        this.activeDimensions = DIMENSION_CONFIG.getActiveDimensionIds();
        this.totalPages = this.activeDimensions.length; // Dynamic based on active dimensions
        
        // Build dimensions mapping from config (preserves original IDs)
        this.dimensions = {};
        Object.entries(DIMENSION_CONFIG.dimensionDefinitions).forEach(([key, config]) => {
            // Convert original question IDs to numbers for backward compatibility
            this.dimensions[key] = config.originalQuestions.map(id => parseInt(id.replace('q', '')));
        });
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        // Small delay to ensure DOM is fully loaded before loading progress
        setTimeout(() => {
            this.loadSavedProgress();
        }, 100);
        this.updateProgressIndicator();
    }

    setupEventListeners() {
        // Landing page start button
        const startButton = document.getElementById('startSurvey');
        if (startButton && startButton.getAttribute('data-mode') !== 'login') {
            startButton.addEventListener('click', () => this.startSurvey());
        }
        
        // Navigation buttons
        document.getElementById('nextPage1')?.addEventListener('click', () => this.nextPage());
        document.getElementById('nextPage2')?.addEventListener('click', () => this.nextPage());
        document.getElementById('submitSurvey')?.addEventListener('click', () => this.submitSurvey());
        
        document.getElementById('prevPage2')?.addEventListener('click', () => this.prevPage());
        document.getElementById('prevPage3')?.addEventListener('click', () => this.prevPage());
        
        // Dashboard buttons
        document.getElementById('downloadResults')?.addEventListener('click', () => this.downloadResults());
        
        // Optional: Add retake survey functionality (if button exists in HTML)
        document.getElementById('retakeSurvey')?.addEventListener('click', () => this.retakeSurvey());
        
        // Navigation buttons
        document.getElementById('backToOverview')?.addEventListener('click', () => this.backToOverview());
        
        // Form inputs - save progress on change
        const form = document.getElementById('cultureSurvey');
        if (form) {
            form.addEventListener('change', () => {
                this.saveProgress();
                this.updateProgressPercentage(); // Update percentage when questions are answered
            });
        }
    }

    startSurvey() {
        // Check if we're in authentication required mode
        const urlParams = new URLSearchParams(window.location.search);
        const accessType = urlParams.get('access');
        
        if (accessType === 'auth') {
            // Redirect to login instead
            window.location.href = '../landing.html';
            return;
        }
        
        this.showPage(1); // Go to first survey page
    }

    nextPage() {
        if (this.validateCurrentPage()) {
            this.saveProgress();
            
            // If we're on the last page, go directly to results
            if (this.currentPage === this.totalPages) {
                this.submitSurvey();
            } else if (this.currentPage < this.totalPages) {
                this.showPage(this.currentPage + 1);
            }
        }
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.showPage(this.currentPage - 1);
        } else if (this.currentPage === 1) {
            this.showPage(0); // Go back to landing page
        }
    }

    showPage(pageNumber) {
        // Hide current page
        if (this.currentPage === 0) {
            // Hide landing page
            const landingPage = document.getElementById('landingPage');
            if (landingPage) {
                landingPage.classList.remove('active');
            }
        } else {
            // Hide survey page
            const currentPageElement = document.getElementById(`page${this.currentPage}`);
            if (currentPageElement) {
                currentPageElement.classList.remove('active');
            }
        }

        // Show new page
        this.currentPage = pageNumber;
        if (pageNumber === 0) {
            // Show landing page
            const landingPage = document.getElementById('landingPage');
            if (landingPage) {
                landingPage.classList.add('active');
                landingPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else {
            // Show survey page
            const newPageElement = document.getElementById(`page${this.currentPage}`);
            if (newPageElement) {
                newPageElement.classList.add('active');
                newPageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

        this.updateProgressIndicator();
    }

    validateCurrentPage() {
        // Landing page doesn't need validation
        if (this.currentPage === 0) {
            return true;
        }

        const pageQuestions = this.getQuestionsForPage(this.currentPage);
        const missingQuestions = [];

        pageQuestions.forEach(questionNum => {
            const radios = document.querySelectorAll(`input[name="q${questionNum}"]`);
            const isAnswered = Array.from(radios).some(radio => radio.checked);
            
            if (!isAnswered) {
                missingQuestions.push(questionNum);
            }
        });

        if (missingQuestions.length > 0) {
            alert(`Please answer question(s) ${missingQuestions.join(', ')} before proceeding.`);
            return false;
        }

        return true;
    }

    getQuestionsForPage(pageNumber) {
        // Get the dimension for this page (1-based page numbering)
        const dimensionIndex = pageNumber - 1;
        if (dimensionIndex >= 0 && dimensionIndex < this.activeDimensions.length) {
            const dimensionId = this.activeDimensions[dimensionIndex];
            const dimension = DIMENSION_CONFIG.dimensionDefinitions[dimensionId];
            if (dimension) {
                // Get display question numbers using the question numbering manager
                const range = this.questionManager.getDimensionRange(dimensionId);
                if (range) {
                    const questions = [];
                    for (let i = range.start; i <= range.end; i++) {
                        questions.push(i);
                    }
                    return questions;
                }
            }
        }
        return [];
    }

    updateProgressIndicator() {
        const steps = document.querySelectorAll('.progress-step');
        
        // Hide progress for landing page
        const progressContainer = document.querySelector('.progress-container');
        const progressInfoContainer = document.querySelector('.progress-info-container');
        
        if (this.currentPage === 0) {
            if (progressContainer) progressContainer.style.display = 'none';
            if (progressInfoContainer) progressInfoContainer.style.display = 'none';
            return;
        } else {
            if (progressContainer) progressContainer.style.display = 'block';
            if (progressInfoContainer) progressInfoContainer.style.display = 'block';
        }
        
        steps.forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNumber < this.currentPage || (stepNumber <= this.totalPages && this.currentPage === this.totalPages + 1)) {
                step.classList.add('completed');
            } else if (stepNumber === this.currentPage) {
                step.classList.add('active');
            }
        });
        
        // Update progress info
        this.updateProgressInfo();
        
        // Update progress percentage
        this.updateProgressPercentage();
    }

    updateProgressInfo() {
        const progressQuestions = document.getElementById('progressQuestions');
        const progressSection = document.getElementById('progressSection');
        const progressSummary = document.getElementById('progressSummary');
        
        // Skip progress info for landing page
        if (this.currentPage === 0) {
            if (progressSummary) progressSummary.textContent = '';
            return;
        }
        
        if (this.currentPage <= this.totalPages) {
            const dimensionIndex = this.currentPage - 1;
            const dimensionId = this.activeDimensions[dimensionIndex];
            const dimension = DIMENSION_CONFIG.dimensionDefinitions[dimensionId];
            
            if (dimension) {
                // Get the display question range for this dimension
                const range = this.questionManager.getDimensionRange(dimensionId);
                const totalQuestions = this.questionManager.getTotalActiveQuestions();
                
                if (progressQuestions) {
                    progressQuestions.textContent = `Questions ${range.start} - ${range.end} of ${totalQuestions}`;
                }
                if (progressSection) {
                    progressSection.textContent = dimension.title;
                }
                // Count answered questions so far (for this page)
                const pageQuestions = this.getQuestionsForPage(this.currentPage);
                const answered = pageQuestions.filter(questionNum => {
                    const radios = document.querySelectorAll(`input[name="q${questionNum}"]`);
                    return Array.from(radios).some(radio => radio.checked);
                }).length;
                if (progressSummary) {
                    progressSummary.textContent = `${answered} of ${pageQuestions.length} questions answered`;
                }
            }
        } else {
            // On completion/dashboard page
            const totalQuestions = this.questionManager.getTotalActiveQuestions();
            if (progressQuestions) {
                progressQuestions.textContent = `Survey Complete - ${totalQuestions} questions answered`;
            }
            if (progressSection) {
                progressSection.textContent = 'Results';
            }
            if (progressSummary) {
                progressSummary.textContent = `${totalQuestions} of ${totalQuestions} questions answered (100%)`;
            }
        }
    }

    updateProgressPercentage() {
        // Skip progress percentage for landing page
        if (this.currentPage === 0) {
            return;
        }

        const totalPages = this.totalPages + 1; // Dynamic survey pages + 1 dashboard page
        let progressPercentage;
        
        if (this.currentPage <= this.totalPages) {
            // Calculate percentage based on current page and answered questions
            const basePercentage = ((this.currentPage - 1) / totalPages) * 100;
            const currentPageQuestions = this.getQuestionsForPage(this.currentPage);
            const answeredQuestions = currentPageQuestions.filter(questionNum => {
                const radios = document.querySelectorAll(`input[name="q${questionNum}"]`);
                return Array.from(radios).some(radio => radio.checked);
            });
            
            const pageProgressPercentage = (answeredQuestions.length / currentPageQuestions.length) * (100 / totalPages);
            progressPercentage = basePercentage + pageProgressPercentage;
        } else {
            // Dashboard page - 100% complete
            progressPercentage = 100;
        }
        
        // Update the progress bar
        const progressFill = document.getElementById('progressPercentageFill');
        
        if (progressFill) {
            progressFill.style.width = `${progressPercentage}%`;
        }
    }

    submitSurvey() {
        if (!this.validateCurrentPage()) {
            return;
        }

        this.collectResponses();
        
        // Mark survey as completed and save
        this.currentPage = this.totalPages + 1; // Dashboard page (dynamic)
        this.saveProgress(true); // Pass true to indicate completion
        
        this.showDashboard();
    }

    collectResponses() {
        this.responses = {};
        this.comments = {};
        
        // Collect responses for all active dimensions using display question numbers
        this.activeDimensions.forEach(dimensionId => {
            const dimension = DIMENSION_CONFIG.dimensionDefinitions[dimensionId];
            if (dimension) {
                const range = this.questionManager.getDimensionRange(dimensionId);
                if (range) {
                    // Map display numbers to original IDs for storage
                    for (let displayNum = range.start; displayNum <= range.end; displayNum++) {
                        const originalIndex = displayNum - range.start;
                        const originalQuestionId = dimension.originalQuestions[originalIndex];
                        
                        // Check for radio button selection using display number
                        const selectedRadio = document.querySelector(`input[name="q${displayNum}"]:checked`);
                        if (selectedRadio) {
                            this.responses[originalQuestionId] = parseInt(selectedRadio.value);
                        }
                        
                        // Collect comments using display number
                        const commentTextarea = document.querySelector(`textarea[name="q${displayNum}_comment"]`);
                        if (commentTextarea && commentTextarea.value.trim()) {
                            this.comments[`${originalQuestionId}_comment`] = commentTextarea.value.trim();
                        }
                    }
                }
            }
        });

        this.saveProgress();
    }

    collectCurrentResponses() {
        const responses = {};
        
        // Collect current responses for all active dimensions using display question numbers
        this.activeDimensions.forEach(dimensionId => {
            const dimension = DIMENSION_CONFIG.dimensionDefinitions[dimensionId];
            if (dimension) {
                const range = this.questionManager.getDimensionRange(dimensionId);
                if (range) {
                    // Map display numbers to original IDs for storage
                    for (let displayNum = range.start; displayNum <= range.end; displayNum++) {
                        const originalIndex = displayNum - range.start;
                        const originalQuestionId = dimension.originalQuestions[originalIndex];
                        
                        const selectedRadio = document.querySelector(`input[name="q${displayNum}"]:checked`);
                        if (selectedRadio) {
                            responses[originalQuestionId] = parseInt(selectedRadio.value);
                        }
                    }
                }
            }
        });
        
        return responses;
    }

    showDashboard() {
        // Hide survey pages
        document.querySelectorAll('.survey-page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show dashboard
        const dashboard = document.getElementById('dashboard');
        if (dashboard) {
            dashboard.classList.add('active');
            this.currentPage = this.totalPages + 1; // Dashboard page (dynamic)
            this.updateProgressIndicator();
            
            // FEATURE FLAG: Check if advanced dashboard is enabled
            const isAdvancedEnabled = typeof isFeatureEnabled === 'function' && isFeatureEnabled('advanced.surveyResultsDashboard');
            
            if (isAdvancedEnabled) {
                // Show advanced dashboard with full analytics
                this.showAdvancedDashboard();
            } else {
                // Show simple thank you message for production
                this.showSimpleThankYou();
            }
            
            dashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    showSimpleThankYou() {
        // Redirect to complete.html instead of showing simple thank you message
        window.location.href = 'complete.html';
    }

    showAdvancedDashboard() {
        const simpleThankYou = document.getElementById('simpleThankYou');
        const advancedDashboard = document.getElementById('advancedDashboard');
        
        if (simpleThankYou) {
            simpleThankYou.style.display = 'none';
        }
        
        if (advancedDashboard) {
            advancedDashboard.style.display = 'block';
        }
        
        // Generate full results for advanced dashboard
        this.generateResults();
        
        // Set up restart button event listener for advanced dashboard
        const restartButton = document.getElementById('restartSurvey');
        if (restartButton) {
            restartButton.addEventListener('click', () => this.confirmRestartSurvey());
        }
    }

    generateResults() {
        this.calculateScores();
        this.createVisualIndicators();
        this.generateInsights();
    }

    calculateScores() {
        const dimensionScores = {};
        
        console.log('Calculating scores for active dimensions:', this.activeDimensions);
        console.log('All responses:', this.responses);
        
        // Calculate dimension scores for active dimensions only
        this.activeDimensions.forEach(dimensionId => {
            const dimension = DIMENSION_CONFIG.dimensionDefinitions[dimensionId];
            console.log(`Processing dimension: ${dimensionId}`, dimension);
            
            if (dimension) {
                let total = 0;
                let count = 0;
                
                dimension.originalQuestions.forEach(questionId => {
                    const response = this.responses[questionId];
                    console.log(`Question ${questionId}: response = ${response}`);
                    
                    if (response !== undefined) {
                        // Handle reverse-scored questions (convert back to numbers for comparison)
                        const questionNum = parseInt(questionId.replace('q', ''));
                        if ([10, 12, 13].includes(questionNum)) {
                            total += (this.maxScore + 1) - response;
                        } else {
                            total += response;
                        }
                        count++;
                    }
                });
                
                const score = count > 0 ? (total / count) : 0;
                dimensionScores[dimensionId] = score;
                console.log(`${dimensionId} score: ${score} (total: ${total}, count: ${count})`);
            }
        });

        // FEATURE FLAG: Overall score calculation (disabled due to different rating scales)
        // Calculate overall score based on active dimensions
        // const activeDimensionScores = Object.values(dimensionScores);
        // const overallScore = activeDimensionScores.length > 0 ? 
        //     activeDimensionScores.reduce((sum, score) => sum + score, 0) / activeDimensionScores.length : 0;

        console.log('Final dimension scores:', dimensionScores);
        // console.log('Overall score:', overallScore);

        // Update score displays (disabled)
        // const overallScoreElement = document.getElementById('overallScore');
        // if (overallScoreElement) {
        //     overallScoreElement.textContent = overallScore.toFixed(1);
        // }

        this.dimensionScores = dimensionScores;
        // this.overallScore = overallScore; // Disabled due to different scales
    }

    createVisualIndicators() {
        // FEATURE FLAG: Culture gauge disabled due to different rating scales
        // this.createCultureGauge();
        this.createResponseQualityBars();
        this.createDimensionMeters();
        this.createDimensionScoreCards();
    }

    // FEATURE FLAG: Culture gauge function (disabled due to different rating scales)
    // createCultureGauge() {
    //     const percentage = (this.overallScore / this.maxScore) * 100;
    //     const gaugeFill = document.getElementById('gaugeFill');
    //     const gaugeText = document.getElementById('gaugeText');
    //     const gaugeStatus = document.getElementById('gaugeStatus');
    //     
    //     if (gaugeFill && gaugeText && gaugeStatus) {
    //         // Update text to show score out of 6 instead of percentage
    //         gaugeText.textContent = `${this.overallScore.toFixed(1)}/6`;
    //         
    //         // Animate the gauge fill after a short delay
    //         setTimeout(() => {
    //             const degrees = (percentage / 100) * 360;
    //             
    //             // Create the conic gradient based on the score
    //             let fillColor = '#00A651'; // Default primary color
    //             if (percentage >= 80) {
    //                 fillColor = '#4CAF50'; // Green for excellent
    //             } else if (percentage >= 65) {
    //                 fillColor = '#8BC34A'; // Light green for good
    //             } else if (percentage >= 50) {
    //                 fillColor = '#FFC107'; // Yellow for developing
    //             } else if (percentage >= 30) {
    //                 fillColor = '#FF9800'; // Orange for needs work
    //             } else {
    //                 fillColor = '#F44336'; // Red for critical
    //             }
    //             
    //             gaugeFill.style.background = `conic-gradient(
    //                 ${fillColor} 0deg ${degrees}deg,
    //                 #FFF ${degrees}deg 360deg
    //             )`;
    //             
    //             // Update status text based on score
    //             if (percentage >= 80) {
    //                 gaugeStatus.textContent = "Excellent Culture";
    //                 gaugeStatus.style.color = "#4CAF50";
    //             } else if (percentage >= 65) {
    //                 gaugeStatus.textContent = "Strong Culture";
    //                 gaugeStatus.style.color = "#8BC34A";
    //             } else if (percentage >= 50) {
    //                 gaugeStatus.textContent = "Developing Culture";
    //                 gaugeStatus.style.color = "#FFC107";
    //             } else if (percentage >= 30) {
    //                 gaugeStatus.textContent = "Needs Improvement";
    //                 gaugeStatus.style.color = "#FF9800";
    //             } else {
    //                 gaugeStatus.textContent = "Critical - Needs Attention";
    //                 gaugeStatus.style.color = "#F44336";
    //             }
    //         }, 500);
    //     }
    // }

    createDimensionScoreCards() {
        const dimensionScoresGrid = document.getElementById('dimensionScoresGrid');
        if (!dimensionScoresGrid) return;

        dimensionScoresGrid.innerHTML = '';

        this.activeDimensions.forEach(dimensionId => {
            const dimension = DIMENSION_CONFIG.dimensionDefinitions[dimensionId];
            const score = this.dimensionScores[dimensionId];
            
            if (dimension && score !== undefined) {
                const scoreCard = document.createElement('div');
                scoreCard.className = 'dimension-score-card';
                
                // Determine status based on dimension and score
                const status = this.getDimensionStatus(dimensionId, score);
                const maxScore = 5;
                
                scoreCard.innerHTML = `
                    <div class="dimension-score-header">
                        <div class="dimension-score-icon" style="background: ${dimension.color}">
                            <span class="material-icons">${dimension.icon}</span>
                        </div>
                        <div class="dimension-score-info">
                            <div class="dimension-score-title">${dimension.title}</div>
                            <div class="dimension-score-scale">${dimension.ratingScale}</div>
                        </div>
                    </div>
                    <div class="dimension-score-value">
                        <div class="dimension-score-number">${score.toFixed(1)}</div>
                        <div class="dimension-score-out-of">out of ${maxScore}</div>
                    </div>
                    <div class="dimension-score-status ${status.class}">
                        <span class="dimension-score-status-text">${status.text}</span>
                    </div>
                    <div class="dimension-score-description">
                        ${this.getDimensionDescription(dimensionId, score)}
                    </div>
                `;
                
                dimensionScoresGrid.appendChild(scoreCard);
            }
        });
    }

    getDimensionStatus(dimensionId, score) {
        if (dimensionId === 'engagement') {
            if (score >= 4) {
                return { class: 'excellent', text: 'Excellent Engagement' };
            } else if (score >= 3) {
                return { class: 'good', text: 'Good Engagement' };
            } else {
                return { class: 'developing', text: 'Needs Development' };
            }
        } else if (dimensionId === 'organisationalCulture') {
            if (score >= 4) {
                return { class: 'excellent', text: 'Strong Culture' };
            } else if (score >= 3) {
                return { class: 'good', text: 'Good Culture' };
            } else {
                return { class: 'developing', text: 'Needs Development' };
            }
        }
        
        return { class: 'developing', text: 'Developing' };
    }

    getDimensionDescription(dimensionId, score) {
        if (dimensionId === 'engagement') {
            if (score >= 4) {
                return "You show excellent engagement with your work and team. Your enthusiasm and energy contribute positively to the workplace culture.";
            } else if (score >= 3) {
                return "You demonstrate good engagement levels. There's room for growth in finding more excitement and energy in your work.";
            } else {
                return "Your engagement could be improved. Consider exploring ways to find more meaning and excitement in your daily work.";
            }
        } else if (dimensionId === 'organisationalCulture') {
            if (score >= 4) {
                return "You demonstrate a strong sense of organisational culture—you experience our values and ways of working positively.";
            } else if (score >= 3) {
                return "You experience our culture in broadly positive ways. Small shifts in how teams collaborate could lift this further.";
            } else {
                return "Your experience of organisational culture could be strengthened—consider talking with your line manager about support and clearer expectations.";
            }
        }
        
        return "This dimension measures your perspective on workplace culture and organizational dynamics.";
    }

    createResponseQualityBars() {
        const responseCounts = Array(3).fill(0); // Negative, Neutral, Positive
        
        Object.values(this.responses).forEach(response => {
            if (response <= 2) {
                responseCounts[0]++; // Negative (1-2)
            } else if (response <= 3) {
                responseCounts[1]++; // Neutral (3)
            } else {
                responseCounts[2]++; // Positive (4-5)
            }
        });
        
        const totalResponses = Object.keys(this.responses).length;
        const maxCount = Math.max(...responseCounts);
        
        // Animate bars and update counts
        setTimeout(() => {
            responseCounts.forEach((count, index) => {
                const barFill = document.getElementById(`bar${index + 1}`);
                const barCount = document.getElementById(`barCount${index + 1}`);
                
                if (barFill) {
                    const height = maxCount > 0 ? (count / maxCount) * 95 : 8;
                    barFill.style.height = `${Math.max(height, 8)}px`;
                }
                
                if (barCount) {
                    barCount.textContent = count;
                }
            });
        }, 800);
    }

    createDimensionMeters() {
        // Hide all dimension items first
        const allDimensions = ['sentiment', 'engagement', 'organisationalCulture'];
        allDimensions.forEach(dimension => {
            const dimensionItem = document.querySelector(`.dimension-item[data-dimension="${dimension}"]`);
            if (dimensionItem) {
                dimensionItem.style.display = 'none';
            }
        });
        
        setTimeout(() => {
            // Only show and update active dimensions
            this.activeDimensions.forEach(dimension => {
                const dimensionItem = document.querySelector(`.dimension-item[data-dimension="${dimension}"]`);
                const meter = document.getElementById(`${dimension}Meter`);
                const display = document.getElementById(`${dimension}Display`);
                
                console.log(`Processing dimension meter for: ${dimension}`, {
                    dimensionItem,
                    meter,
                    display,
                    score: this.dimensionScores[dimension]
                });
                
                // Show the dimension item and ensure icon is displayed
                if (dimensionItem) {
                    dimensionItem.style.display = 'flex';
                    
                    // Ensure the icon is properly set
                    const iconElement = dimensionItem.querySelector('.dimension-icon .material-icons');
                    if (iconElement) {
                        const dimensionInfo = this.getDimensionInfo(dimension);
                        if (dimensionInfo && dimensionInfo.icon) {
                            iconElement.textContent = dimensionInfo.icon;
                        }
                    }
                }
                
                if (meter && display && this.dimensionScores[dimension] !== undefined) {
                    const score = this.dimensionScores[dimension];
                    const percentage = (score / this.maxScore) * 100;
                    
                    meter.style.width = `${percentage}%`;
                    display.textContent = score.toFixed(1);
                    
                    // Color coding based on dimension and score
                    if (dimension === 'engagement') {
                        // Orange gradient for Employee Engagement
                        if (score >= 4.5) {
                            meter.style.background = "linear-gradient(90deg, #F37021 0%, #E55A00 100%)";
                        } else if (score >= 3.5) {
                            meter.style.background = "linear-gradient(90deg, #F37021 0%, #FF8A50 100%)";
                        } else if (score >= 2.5) {
                            meter.style.background = "linear-gradient(90deg, #FF8A50 0%, #FFB366 100%)";
                        } else {
                            meter.style.background = "linear-gradient(90deg, #FFB366 0%, #FFCC99 100%)";
                        }
                    } else if (dimension === 'organisationalCulture') {
                        // Pink gradient for Organisational Culture
                        if (score >= 4.5) {
                            meter.style.background = "linear-gradient(90deg, #E91E63 0%, #C2185B 100%)";
                        } else if (score >= 3.5) {
                            meter.style.background = "linear-gradient(90deg, #E91E63 0%, #F06292 100%)";
                        } else if (score >= 2.5) {
                            meter.style.background = "linear-gradient(90deg, #F06292 0%, #F8BBD9 100%)";
                        } else {
                            meter.style.background = "linear-gradient(90deg, #F8BBD9 0%, #FCE4EC 100%)";
                        }
                    } else {
                        // Default green gradient for other dimensions
                        if (score >= 4.5) {
                            meter.style.background = "linear-gradient(90deg, #00A651 0%, #16a34a 100%)";
                        } else if (score >= 3.5) {
                            meter.style.background = "linear-gradient(90deg, #65a30d 0%, #16a34a 100%)";
                        } else if (score >= 2.5) {
                            meter.style.background = "linear-gradient(90deg, #d97706 0%, #f59e0b 100%)";
                        } else {
                            meter.style.background = "linear-gradient(90deg, #dc2626 0%, #ef4444 100%)";
                        }
                    }
                    
                    console.log(`Updated meter for ${dimension}: score=${score}, percentage=${percentage}%`);
                } else {
                    console.warn(`Missing elements for dimension ${dimension}:`, {
                        meter: !!meter,
                        display: !!display,
                        score: this.dimensionScores[dimension]
                    });
                }
            });
        }, 1000);
    }

    generateInsights() {
        this.generatePersonalInsights();
        this.generateRecommendations();
        this.generateLearningResources();
    }

    generatePersonalInsights() {
        const insights = [];
        
        // Overall response pattern analysis
        const responseValues = Object.values(this.responses);
        const averageResponse = responseValues.reduce((sum, val) => sum + val, 0) / responseValues.length;
        const responseVariance = this.calculateVariance(responseValues);
        
        // Insight 1: Response consistency
        if (responseVariance < 0.5) {
            insights.push({
                title: "Consistent Response Pattern",
                icon: "psychology",
                message: "Your responses show high consistency across all dimensions, indicating clear and stable perceptions of your organizational culture. This suggests you have well-formed opinions about your workplace."
            });
        } else if (responseVariance > 2.0) {
            insights.push({
                title: "Varied Experience",
                icon: "insights",
                message: "Your responses vary significantly across different areas, suggesting you experience different aspects of organizational culture quite differently. This is valuable feedback showing nuanced perceptions."
            });
        } else {
            insights.push({
                title: "Balanced Perspective",
                icon: "balance",
                message: "Your responses show a balanced view across different cultural dimensions, indicating you experience both positive and challenging aspects of your workplace culture."
            });
        }

        // Insight 2: Overall optimism level
        if (averageResponse >= 4.5) {
            insights.push({
                title: "Positive Workplace Perspective",
                icon: "sentiment_very_satisfied",
                message: "You maintain a predominantly positive view of your workplace culture. Your responses indicate strong satisfaction with most organizational aspects, which contributes to a healthy work environment."
            });
        } else if (averageResponse <= 2.5) {
            insights.push({
                title: "Critical Culture Assessment",
                icon: "sentiment_dissatisfied",
                message: "Your responses indicate significant concerns about various aspects of organizational culture. Your critical perspective highlights important areas that may need attention and improvement."
            });
        } else {
            insights.push({
                title: "Realistic Culture Assessment",
                icon: "sentiment_neutral",
                message: "Your responses reflect a realistic view of your workplace culture, recognizing both strengths and areas for improvement. This balanced perspective is valuable for constructive change."
            });
        }

        // Insight 3: Strongest or weakest dimension (only for active dimensions)
        const activeDimensionScores = {};
        this.activeDimensions.forEach(dim => {
            activeDimensionScores[dim] = this.dimensionScores[dim];
        });
        const sortedDimensions = Object.entries(activeDimensionScores).sort((a, b) => b[1] - a[1]);
        const strongestDimension = sortedDimensions[0];
        const weakestDimension = sortedDimensions[sortedDimensions.length - 1];
        
        if (strongestDimension[1] >= 4.5) {
            const dimensionInfo = this.getDimensionInfo(strongestDimension[0]);
            insights.push({
                title: `${dimensionInfo.name} Champion`,
                icon: dimensionInfo.icon,
                message: `You rate ${dimensionInfo.name.toLowerCase()} very highly (${strongestDimension[1].toFixed(1)}/5). This suggests you're experiencing the best of what your organization offers in this area and could be a positive influence on others.`
            });
        } else if (weakestDimension[1] <= 2.5) {
            const dimensionInfo = this.getDimensionInfo(weakestDimension[0]);
            insights.push({
                title: `${dimensionInfo.name} Growth Area`,
                icon: "trending_up",
                message: `Your ${dimensionInfo.name.toLowerCase()} score indicates room for improvement (${weakestDimension[1].toFixed(1)}/5). This area represents your biggest opportunity for enhanced workplace experience.`
            });
        } else {
            // Response pattern insight as fallback
            const stronglyPositive = responseValues.filter(r => r >= 5).length;
            const stronglyNegative = responseValues.filter(r => r <= 2).length;
            
            if (stronglyPositive > stronglyNegative) {
                insights.push({
                    title: "Culture Advocate",
                    icon: "volunteer_activism",
                    message: "You tend to strongly agree with positive culture statements, suggesting you could be a valuable culture advocate within your organization. Your positive energy likely influences team dynamics."
                });
            } else if (stronglyNegative > stronglyPositive) {
                insights.push({
                    title: "Change Catalyst",
                    icon: "auto_fix_high",
                    message: "Your critical assessment of current culture could position you as a catalyst for positive change. Your insights can help leadership understand areas needing improvement."
                });
            } else {
                insights.push({
                    title: "Thoughtful Observer",
                    icon: "visibility",
                    message: "Your measured responses suggest you're a thoughtful observer of workplace culture, carefully considering each aspect rather than making sweeping judgments."
                });
            }
        }

        this.displayPersonalInsights(insights);
    }

    generateRecommendations() {
        const recommendations = [];
        
        // Get sorted dimensions (lowest to highest scores) - only active dimensions
        const activeDimensionScores = {};
        this.activeDimensions.forEach(dim => {
            activeDimensionScores[dim] = this.dimensionScores[dim];
        });
        const sortedDimensions = Object.entries(activeDimensionScores).sort((a, b) => a[1] - b[1]);
        
        // Recommendation 1: Focus on lowest scoring dimension
        const lowestDimension = sortedDimensions[0];
        const dimensionInfo = this.getDimensionInfo(lowestDimension[0]);
        const recommendation = this.getDimensionRecommendation(lowestDimension[0], lowestDimension[1]);
        
        if (recommendation) {
            recommendations.push({
                ...recommendation,
                priority: lowestDimension[1] < 2.5 ? 'high-priority' : lowestDimension[1] < 3.5 ? 'medium' : 'low',
                dimension: dimensionInfo.name
            });
        }

        // Recommendation 2: Overall culture improvement or leadership
        if (this.overallScore < 3.0) {
            recommendations.push({
                title: "Comprehensive Culture Assessment",
                icon: "assessment",
                message: "Consider having an open conversation with your manager or HR about your culture experience. Your feedback could help identify systemic issues and improvement opportunities.",
                priority: 'high-priority',
                actions: ["Schedule a 1:1 with your manager", "Share specific examples of concerns", "Suggest concrete improvements"]
            });
        } else if (this.overallScore >= 4.5) {
            recommendations.push({
                title: "Culture Leadership Opportunity",
                icon: "groups",
                message: "Your positive culture experience positions you well to mentor others and contribute to culture initiatives. Consider taking on leadership roles in culture-building activities.",
                priority: 'success',
                actions: ["Volunteer for culture committees", "Mentor new team members", "Share best practices"]
            });
        } else {
            recommendations.push({
                title: "Selective Culture Improvement",
                icon: "tune",
                message: "Focus on specific areas where you see potential for improvement while leveraging the positive aspects of your current culture experience.",
                priority: 'medium',
                actions: ["Identify 2-3 priority areas", "Engage with colleagues on solutions", "Participate in culture surveys"]
            });
        }

        // Recommendation 3: Personal development based on response patterns
        const responseValues = Object.values(this.responses);
        const responseVariance = this.calculateVariance(responseValues);
        
        if (responseVariance > 2.0) {
            recommendations.push({
                title: "Targeted Improvement Focus",
                icon: "track_changes",
                message: "Your varied responses suggest focusing on specific areas rather than broad changes. Identify your top 2-3 concerns and work on targeted improvements.",
                priority: 'medium',
                actions: ["Prioritize your main concerns", "Create specific action plans", "Track progress over time"]
            });
        } else if (this.overallScore >= 4.0) {
            recommendations.push({
                title: "Peer Support & Mentoring",
                icon: "people",
                message: "Your positive culture experience makes you well-positioned to support colleagues who may be struggling. Consider becoming a culture ambassador.",
                priority: 'success',
                actions: ["Offer support to new team members", "Share positive experiences", "Be a culture role model"]
            });
        } else {
            // Get second lowest dimension for additional focus
            const secondLowestDimension = sortedDimensions[1];
            const secondDimensionInfo = this.getDimensionInfo(secondLowestDimension[0]);
            const secondRecommendation = this.getDimensionRecommendation(secondLowestDimension[0], secondLowestDimension[1]);
            
            if (secondRecommendation) {
                recommendations.push({
                    ...secondRecommendation,
                    title: `Secondary Focus: ${secondRecommendation.title}`,
                    priority: secondLowestDimension[1] < 3.0 ? 'medium' : 'low',
                    dimension: secondDimensionInfo.name
                });
            } else {
                recommendations.push({
                    title: "Professional Development",
                    icon: "school",
                    message: "Invest in your professional growth to improve your overall workplace experience and build resilience in challenging cultural environments.",
                    priority: 'medium',
                    actions: ["Seek learning opportunities", "Build new skills", "Expand your network"]
                });
            }
        }

        this.displayRecommendations(recommendations);
    }

    generateLearningResources() {
        const resources = [];
        
        // Analyze dimension scores to determine learning needs
        const dimensionScores = this.dimensionScores;
        const overallScore = this.overallScore;
        

        
        // Employee Engagement courses (if score is low)
        if (dimensionScores.engagement < 3.5) {
            resources.push({
                title: "Professional Development & Career Growth",
                instructor: "Lisa Rodriguez",
                description: "Discover how to take ownership of your career development, set meaningful goals, and find purpose in your work. Learn to align personal aspirations with organizational objectives.",
                duration: "5.8 hours",
                rating: "4.8",
                students: "15,230",
                icon: "trending_up",
                relevance: "high",
                url: "https://www.udemy.com/course/professional-development-career-growth/",
                category: "engagement"
            });
            
            resources.push({
                title: "Team Leadership & Collaboration",
                instructor: "David Thompson",
                description: "Enhance your ability to work effectively in teams and develop leadership skills. Learn about team dynamics, motivation techniques, and collaborative problem-solving.",
                duration: "7.1 hours",
                rating: "4.7",
                students: "11,340",
                icon: "group",
                relevance: "medium",
                url: "https://www.udemy.com/course/team-leadership-collaboration/",
                category: "engagement"
            });
        }
        
        // Organisational Culture courses (if score is low)
        if (dimensionScores.organisationalCulture < 3) {
            resources.push({
                title: "Change Management Fundamentals",
                instructor: "Dr. Sarah Johnson",
                description: "Learn the fundamentals of change management, including communication strategies, stakeholder engagement, and overcoming resistance to change.",
                duration: "7.5 hours",
                rating: "4.7",
                students: "12,450",
                icon: "trending_up",
                relevance: "high",
                url: "https://www.udemy.com/course/change-management-fundamentals/",
                category: "organisationalCulture"
            });
            
            resources.push({
                title: "Leading Organizational Change",
                instructor: "Michael Chen",
                description: "Develop leadership skills for driving successful organizational change. Learn how to inspire teams, manage transitions, and create sustainable change.",
                duration: "6.8 hours",
                rating: "4.6",
                students: "8,920",
                icon: "leaderboard",
                relevance: "medium",
                url: "https://www.udemy.com/course/leading-organizational-change/",
                category: "organisationalCulture"
            });
        }
        
        // Risk Culture courses (if score is low and dimension is active)
        if (dimensionScores.riskCulture && dimensionScores.riskCulture < 3.5 && DIMENSION_CONFIG.dimensionDefinitions.riskCulture.active) {
            resources.push({
                title: "Risk Management Fundamentals",
                instructor: "Dr. Robert Wilson",
                description: "Learn the basics of risk management, including risk identification, assessment, and mitigation strategies for organizational success.",
                duration: "6.2 hours",
                rating: "4.6",
                students: "9,340",
                icon: "security",
                relevance: "high",
                url: "https://www.udemy.com/course/risk-management-fundamentals/",
                category: "riskCulture"
            });
            
            resources.push({
                title: "Building a Risk-Aware Culture",
                instructor: "Jennifer Martinez",
                description: "Develop skills to promote risk awareness and responsibility in your organization. Learn to create a culture that values risk management.",
                duration: "5.9 hours",
                rating: "4.5",
                students: "7,120",
                icon: "shield",
                relevance: "medium",
                url: "https://www.udemy.com/course/building-risk-aware-culture/",
                category: "riskCulture"
            });
        }
        
        // General workplace skills (always include some)
        if (overallScore < 4.0) {
            resources.push({
                title: "Effective Communication in the Workplace",
                instructor: "Amanda Foster",
                description: "Master essential communication skills for professional success. Learn to express ideas clearly, handle difficult conversations, and build rapport with colleagues.",
                duration: "5.5 hours",
                rating: "4.7",
                students: "18,560",
                icon: "chat",
                relevance: "high",
                url: "https://www.udemy.com/course/effective-workplace-communication/",
                category: "general"
            });
        }
        
        // Personal development (for all users)
        resources.push({
            title: "Stress Management & Work-Life Balance",
            instructor: "Dr. Emily Watson",
            description: "Learn techniques to manage workplace stress, maintain work-life balance, and build resilience. Develop healthy coping mechanisms and boundary-setting skills.",
            duration: "4.8 hours",
            rating: "4.8",
            students: "22,340",
            icon: "self_improvement",
            relevance: "medium",
            url: "https://www.udemy.com/course/stress-management-work-life-balance/",
            category: "wellness"
        });
        
        // Limit to top 6 most relevant courses
        const sortedResources = resources.sort((a, b) => {
            const relevanceOrder = { high: 3, medium: 2, low: 1 };
            return relevanceOrder[b.relevance] - relevanceOrder[a.relevance];
        }).slice(0, 6);
        
        this.displayLearningResources(sortedResources);
    }

    displayLearningResources(resources) {
        const container = document.getElementById('learningResourcesContainer');
        if (!container) return;
        
        if (resources.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: var(--spacing-xl); color: var(--on-surface-variant);">
                    <span class="material-icons" style="font-size: 48px; margin-bottom: var(--spacing-md); opacity: 0.5;">school</span>
                    <p>No specific learning resources identified at this time. Consider exploring general professional development courses on Udemy.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = resources.map(resource => `
            <div class="learning-resource-card">
                <div class="resource-header">
                    <div class="resource-icon">
                        <span class="material-icons">${resource.icon}</span>
                    </div>
                    <div class="resource-content">
                        <div class="resource-title">${resource.title}</div>
                        <div class="resource-instructor">by ${resource.instructor}</div>
                        <div class="resource-description">${resource.description}</div>
                    </div>
                </div>
                
                <div class="resource-meta">
                    <div class="resource-meta-item">
                        <span class="material-icons">schedule</span>
                        ${resource.duration}
                    </div>
                    <div class="resource-meta-item">
                        <span class="material-icons">star</span>
                        ${resource.rating} (${resource.students} students)
                    </div>
                </div>
                
                <div class="resource-relevance">
                    <span class="relevance-badge ${resource.relevance}">
                        ${resource.relevance === 'high' ? 'Highly Relevant' : resource.relevance === 'medium' ? 'Moderately Relevant' : 'Generally Relevant'}
                    </span>
                </div>
                
                <a href="${resource.url}" target="_blank" rel="noopener noreferrer" class="resource-link">
                    <span class="material-icons">open_in_new</span>
                    View Course on Udemy
                </a>
            </div>
        `).join('');
    }

    getDimensionInfo(dimension) {
        const dimensionMap = {
            engagement: { name: "Employee Engagement", icon: "favorite" },
            organisationalCulture: { name: "Organisational Culture", icon: "trending_up" },
            riskCulture: { name: "Risk Culture", icon: "security" }
        };
        return dimensionMap[dimension];
    }

    getDimensionRecommendation(dimension, score) {
        const recommendations = {
            engagement: {
                title: "Build Stronger Connections",
                icon: "connect_without_contact",
                message: "Work on building stronger emotional connections to your work and organization. Find meaningful projects and develop relationships with colleagues.",
                actions: ["Join team social activities", "Find a mentor or sponsor", "Identify purpose in your daily work"]
            },
            organisationalCulture: {
                title: "Strengthen Organisational Culture",
                icon: "trending_up",
                message: "Focus on how teams live our values day to day—seek clarity on expectations, recognise helpful behaviours, and take part in dialogue that shapes our culture.",
                actions: ["Discuss team norms with your line manager", "Join initiatives that reinforce our values", "Share feedback on collaboration and inclusion", "Celebrate examples of culture in action"]
            },
            riskCulture: {
                title: "Strengthen Risk Awareness",
                icon: "security",
                message: "Focus on developing a stronger understanding of risk management and contributing to a risk-aware organizational culture.",
                actions: ["Participate in risk management training", "Report potential risks promptly", "Support risk awareness initiatives", "Learn from past risk events"]
            }
        };
        
        return recommendations[dimension];
    }

    calculateVariance(values) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    }

    displayPersonalInsights(insights) {
        const container = document.getElementById('personalInsightsContainer');
        if (!container) return;

        container.innerHTML = insights.map(insight => `
            <div class="insight-item">
                <h4>
                    <span class="material-icons">${insight.icon}</span>
                    ${insight.title}
                </h4>
                <p>${insight.message}</p>
            </div>
        `).join('');
    }

    displayRecommendations(recommendations) {
        const container = document.getElementById('recommendationsContainer');
        if (!container) return;

        container.innerHTML = recommendations.map(rec => `
            <div class="recommendation-item ${rec.priority}">
                <h4>
                    <span class="material-icons">${rec.icon}</span>
                    ${rec.title}
                </h4>
                <p>${rec.message}</p>
                ${rec.actions ? `
                    <ul style="margin-top: 12px; padding-left: 20px; color: var(--on-surface-variant);">
                        ${rec.actions.map(action => `<li>${action}</li>`).join('')}
                    </ul>
                ` : ''}
            </div>
        `).join('');
    }

    async downloadResults() {
        try {
            // Get the dashboard element
            const dashboard = document.getElementById('dashboard');
            if (!dashboard) {
                console.error('Dashboard element not found');
                return;
            }

            // Show loading state
            const downloadBtn = document.getElementById('downloadResults');
            const originalText = downloadBtn.innerHTML;
            downloadBtn.innerHTML = '<span class="material-icons">hourglass_empty</span>Generating PDF...';
            downloadBtn.disabled = true;

            // Create a temporary container with enhanced styles for PDF
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'absolute';
            tempContainer.style.left = '-9999px';
            tempContainer.style.top = '0';
            tempContainer.style.width = dashboard.offsetWidth + 'px';
            tempContainer.style.backgroundColor = '#FFFFFF';
            tempContainer.style.fontFamily = 'Arial, sans-serif';
            
            // Clone dashboard content
            tempContainer.innerHTML = dashboard.innerHTML;
            document.body.appendChild(tempContainer);

            // Enhance colors and contrast for PDF
            this.enhanceColorsForPDF(tempContainer);

            // Create canvas from enhanced container
            const canvas = await html2canvas(tempContainer, {
                scale: 3, // Increased scale for better quality
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#FFFFFF', // Pure white background
                logging: false,
                width: tempContainer.scrollWidth,
                height: tempContainer.scrollHeight,
                onclone: (clonedDoc) => {
                    // Additional color enhancements in cloned document
                    const clonedContainer = clonedDoc.querySelector('div');
                    if (clonedContainer) {
                        this.enhanceColorsForPDF(clonedContainer);
                    }
                }
            });

            // Remove temporary container
            document.body.removeChild(tempContainer);

            // Enhance canvas colors further
            const enhancedCanvas = this.enhanceCanvasColors(canvas);

            // Create PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: false // Disable compression for better color quality
            });

            // Calculate dimensions
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 295; // A4 height in mm
            const imgHeight = (enhancedCanvas.height * imgWidth) / enhancedCanvas.width;
            let heightLeft = imgHeight;

            let position = 0;

            // Add first page with high quality
            pdf.addImage(enhancedCanvas.toDataURL('image/png', 1.0), 'PNG', 0, position, imgWidth, imgHeight, 
                        undefined, 'FAST'); // Use FAST compression for better colors
            heightLeft -= pageHeight;

            // Add additional pages if needed
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(enhancedCanvas.toDataURL('image/png', 1.0), 'PNG', 0, position, imgWidth, imgHeight,
                            undefined, 'FAST');
                heightLeft -= pageHeight;
            }

            // Download the PDF
            const timestamp = new Date().toISOString().split('T')[0];
            pdf.save(`old-mutual-culture-survey-results-${timestamp}.pdf`);

            // Reset button
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('There was an error generating the PDF. Please try again.');
            
            // Reset button
            const downloadBtn = document.getElementById('downloadResults');
            downloadBtn.innerHTML = '<span class="material-icons">download</span>Download Results';
            downloadBtn.disabled = false;
        }
    }

    enhanceColorsForPDF(container) {
        // Color mappings for enhanced visibility in PDF
        const colorMappings = {
            'var(--primary-color)': '#00A651',
            'var(--fresh-green)': '#007A3D',
            'var(--future-green)': '#4CAF50',
            'var(--color-pink)': '#D81B60',
            'var(--color-cyan)': '#00ACC1',
            'var(--color-teal)': '#00695C',
            'var(--color-green)': '#388E3C',
            'var(--color-orange)': '#E55A00',
            'var(--color-engagement)': '#E55A00',
            'var(--color-risk-culture)': '#D1006B',
            'var(--on-surface)': '#1A1A1A',
            'var(--on-surface-variant)': '#424242',
            'rgba(0,0,0,0.6)': '#424242',
            'rgba(0,0,0,0.54)': '#525252',
            'rgba(0,0,0,0.38)': '#757575'
        };

        // Apply enhanced styles to all elements
        const allElements = container.querySelectorAll('*');
        allElements.forEach(element => {
            const computedStyle = window.getComputedStyle(element);
            
            // Enhance text colors
            if (computedStyle.color && computedStyle.color.includes('rgba')) {
                element.style.color = '#1A1A1A';
            }
            
            // Enhance background colors
            if (element.style.backgroundColor || computedStyle.backgroundColor) {
                const bgColor = element.style.backgroundColor || computedStyle.backgroundColor;
                Object.keys(colorMappings).forEach(cssVar => {
                    if (bgColor.includes(cssVar)) {
                        element.style.backgroundColor = colorMappings[cssVar];
                    }
                });
            }

            // Enhance specific dashboard elements
            if (element.classList.contains('score-value')) {
                element.style.color = '#00A651';
                element.style.fontWeight = 'bold';
            }
            
            if (element.classList.contains('gauge-fill')) {
                element.style.backgroundColor = '#00A651';
            }
            
            if (element.classList.contains('meter-fill')) {
                element.style.backgroundColor = '#00A651';
            }
            
            if (element.classList.contains('bar-fill')) {
                element.style.backgroundColor = '#00A651';
            }

            // Enhance dimension-specific colors
            if (element.hasAttribute('data-dimension')) {
                const dimension = element.getAttribute('data-dimension');
                const dimColors = {
                    'sentiment': '#E91E63',
                    'talent': '#00BCD4', 
                    'engagement': '#F37021',
                    'organisationalCulture': '#ED0080'
                };
                
                const meterFill = element.querySelector('.meter-fill');
                if (meterFill && dimColors[dimension]) {
                    meterFill.style.backgroundColor = dimColors[dimension];
                }
                
                const icon = element.querySelector('.dimension-icon');
                if (icon && dimColors[dimension]) {
                    icon.style.backgroundColor = dimColors[dimension];
                }
            }
        });
    }

    enhanceCanvasColors(canvas) {
        // Create a new canvas for color enhancement
        const enhancedCanvas = document.createElement('canvas');
        enhancedCanvas.width = canvas.width;
        enhancedCanvas.height = canvas.height;
        
        const ctx = enhancedCanvas.getContext('2d');
        
        // Draw original canvas
        ctx.drawImage(canvas, 0, 0);
        
        // Get image data for color enhancement
        const imageData = ctx.getImageData(0, 0, enhancedCanvas.width, enhancedCanvas.height);
        const data = imageData.data;
        
        // Enhance colors by increasing contrast and saturation
        for (let i = 0; i < data.length; i += 4) {
            // Skip if pixel is white or near-white background
            if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) {
                continue;
            }
            
            // Increase contrast
            data[i] = Math.min(255, data[i] * 1.3);     // Red
            data[i + 1] = Math.min(255, data[i + 1] * 1.3); // Green  
            data[i + 2] = Math.min(255, data[i + 2] * 1.3); // Blue
            
            // Ensure minimum opacity for visibility
            if (data[i + 3] < 200) {
                data[i + 3] = Math.min(255, data[i + 3] * 1.5);
            }
        }
        
        // Put enhanced image data back
        ctx.putImageData(imageData, 0, 0);
        
        return enhancedCanvas;
    }

    generateResultsText() {
        const timestamp = new Date().toLocaleString();
        
        let results = `OLD MUTUAL CULTURE SURVEY RESULTS\n`;
        results += `Generated: ${timestamp}\n`;
        results += `${'='.repeat(50)}\n\n`;
        
        results += `OVERALL CULTURE SCORE: ${this.overallScore.toFixed(1)}/5.0\n\n`;
        
        results += `DIMENSION SCORES:\n`;
        this.activeDimensions.forEach(dimensionId => {
            const dimension = DIMENSION_CONFIG.dimensionDefinitions[dimensionId];
            const score = this.dimensionScores[dimensionId] || 0;
            results += `• ${dimension.title}: ${score.toFixed(1)}/5.0\n`;
        });
        results += `\n`;
        
        results += `RESPONSE ANALYSIS:\n`;
        const responseCounts = { low: 0, medium: 0, high: 0 };
        Object.values(this.responses).forEach(response => {
            if (response <= 2) responseCounts.low++;
            else if (response <= 4) responseCounts.medium++;
            else responseCounts.high++;
        });
        results += `• Low scores (1-2): ${responseCounts.low} responses\n`;
        results += `• Medium scores (3-4): ${responseCounts.medium} responses\n`;
        results += `• High scores (4-5): ${responseCounts.high} responses\n\n`;
        
        results += `LEARNING RESOURCES RECOMMENDED:\n`;
        const learningContainer = document.getElementById('learningResourcesContainer');
        if (learningContainer) {
            const resourceCards = learningContainer.querySelectorAll('.learning-resource-card');
            resourceCards.forEach((card, index) => {
                const title = card.querySelector('.resource-title')?.textContent || 'Course Title';
                const instructor = card.querySelector('.resource-instructor')?.textContent || 'Instructor';
                const relevance = card.querySelector('.relevance-badge')?.textContent || 'Relevance';
                results += `${index + 1}. ${title}\n`;
                results += `   Instructor: ${instructor}\n`;
                results += `   Relevance: ${relevance}\n\n`;
            });
        }
        
        results += `NOTES:\n`;
        results += `• This report is based on your individual survey responses\n`;
        results += `• Learning resources are personalized based on your scores\n`;
        results += `• Consider discussing results with your manager or HR representative\n`;
        results += `• For additional support, contact your People Data Analytics team\n\n`;
        
        results += `Generated by Old Mutual Pulse Culture Survey\n`;
        results += `Powered by Pure Survey (www.puresurvey.co.za)\n`;
        
        return results;
    }

    saveProgress(completed = false) {
        // Collect current comments for all active questions
        const currentComments = {};
        const totalQuestions = this.questionManager.getTotalActiveQuestions();
        for (let i = 1; i <= totalQuestions; i++) {
            const commentTextarea = document.querySelector(`textarea[name="q${i}_comment"]`);
            if (commentTextarea && commentTextarea.value.trim()) {
                currentComments[`q${i}_comment`] = commentTextarea.value.trim();
            }
        }
        
        const progressData = {
            currentPage: this.currentPage,
            responses: this.collectCurrentResponses(),
            comments: currentComments,
            completed: completed,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('oldMutualCultureSurveyProgress', JSON.stringify(progressData));
    }

    retakeSurvey() {
        // Clear all saved progress
        localStorage.removeItem('oldMutualCultureSurveyProgress');
        
        // Reset form and go back to start
        this.responses = {};
        this.comments = {};
        this.currentPage = 0;
        
        // Clear all radio buttons and textareas
        document.querySelectorAll('input[type="radio"]').forEach(radio => radio.checked = false);
        document.querySelectorAll('textarea').forEach(textarea => textarea.value = '');
        
        // Hide dashboard and show landing page
        const dashboard = document.getElementById('dashboard');
        if (dashboard) {
            dashboard.classList.remove('active');
        }
        
        this.showPage(0); // Go to landing page
    }

    backToOverview() {
        // Navigate back to the main dashboard (parent window)
        try {
            if (window.opener && !window.opener.closed) {
                // If opened from another window, focus the parent and close this window
                window.opener.focus();
                window.close();
            } else {
                // If opened directly or parent is closed, navigate to the overview page
                window.location.href = '../index.html#overview';
            }
        } catch (error) {
            // Fallback: navigate to overview page
            window.location.href = '../index.html#overview';
        }
    }

    confirmRestartSurvey() {
        // Show confirmation dialog before restarting
        const hasProgress = Object.keys(this.responses).length > 0;
        
        let message = 'Are you sure you want to restart the survey?';
        if (hasProgress) {
            message += '\n\nThis will clear all your current responses and cannot be undone.';
        }
        
        if (confirm(message)) {
            this.retakeSurvey();
        }
    }

    loadSavedProgress() {
        // Check for regular saved progress
        const savedData = localStorage.getItem('oldMutualCultureSurveyProgress');
        
        if (savedData) {
            try {
                const progressData = JSON.parse(savedData);
                
                // Restore responses
                Object.keys(progressData.responses || {}).forEach(questionKey => {
                    const questionNum = questionKey.replace('q', '');
                    const value = progressData.responses[questionKey];
                    const radio = document.querySelector(`input[name="q${questionNum}"][value="${value}"]`);
                    if (radio) {
                        radio.checked = true;
                    }
                });
                
                // Restore comments
                Object.keys(progressData.comments || {}).forEach(commentKey => {
                    const textarea = document.querySelector(`textarea[name="${commentKey}"]`);
                    if (textarea) {
                        textarea.value = progressData.comments[commentKey];
                    }
                });
                
                this.responses = progressData.responses || {};
                this.comments = progressData.comments || {};
                
                // If survey is completed, always show dashboard regardless of saved page
                if (progressData.completed) {
                    this.currentPage = this.totalPages + 1; // Dashboard page (dynamic)
                    this.showDashboard();
                } else if (progressData.currentPage && progressData.currentPage > 0 && Object.keys(progressData.responses || {}).length > 0) {
                    // If we're on the results page (dashboard), show the dashboard
                    if (progressData.currentPage === this.totalPages + 1) {
                        this.showDashboard();
                    } else {
                        // Otherwise show the saved page
                        this.showPage(progressData.currentPage);
                    }
                }
            } catch (error) {
                console.warn('Failed to load saved progress:', error);
            }
        }
    }
}

// Initialize the survey when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.survey = new PulseCultureSurvey();
}); 