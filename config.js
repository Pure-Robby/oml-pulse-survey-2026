// Feature Flags - Easy to toggle features on/off
const FEATURES = {
    showOverallScore: false,        // Hidden due to different rating scales
    showUdemyCourses: false,        // Hidden per client request
    showDimensionComparison: true,  // Show individual dimension results
    showPersonalInsights: true,     // Show personalized insights
    showRecommendations: true       // Show action recommendations
};

// Production Configuration - Controls which features are active
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

// Helper function to check if a feature is enabled
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

// Helper function to get feature configuration
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

// Dimension Configuration System
// This file controls which dimensions are active and their survey order
// To reactivate Employee Sentiment: set sentiment.active = true
// To reactivate Risk Culture: set riskCulture.active = true
// To reorder dimensions: modify dimensionOrder array

const DIMENSION_CONFIG = {
    // Define the order dimensions should appear in the survey
    // Change this array to reorder dimensions or when reintroducing Employee Sentiment or Risk Culture
    dimensionOrder: ['engagement', 'changeResilience'], // sentiment and riskCulture temporarily removed
    
    dimensionDefinitions: {
        sentiment: {
            id: 'sentiment',
            title: "Employee Sentiment",
            description: "Measures overall feelings and attitudes toward the workplace",
            originalQuestions: ['q1', 'q2', 'q3'],
            questionTexts: {
                q1: "I rarely think about looking for a job at a different organisation",
                q2: "I am happy working at our organisation", 
                q3: "I would recommend our organisation as a great place to work"
            },
            icon: 'sentiment_satisfied',
            color: '#E91E63',
            gradientColors: ['#E91E63', '#C2185B'],
            active: false  // Set to true to reactivate this dimension
        },
        engagement: {
            id: 'engagement',
            title: "Employee Engagement",
            description: "Measures commitment, involvement, and enthusiasm toward work and organization",
            originalQuestions: ['q4', 'q5', 'q6', 'q7', 'q8', 'q9'],
            questionTexts: {
                q4: "I feel energised by the work that I do.",
                q5: "I feel excited about the work that I do.",
                q6: "I feel energetic while at work.",
                q7: "I feel enthusiastic about my work.",
                q8: "I feel happy and in good spirits while at work.",
                q9: "I am inspired by my work."
            },
            icon: 'favorite',
            color: '#F37021',
            gradientColors: ['#F37021', '#E55A00'],
            ratingScale: "1-6",
            numberOfQuestions: 6,
            active: true
        },
        changeResilience: {
            id: 'changeResilience',
            title: "Change Resilience",
            description: "Measures organizational adaptability and resilience to change initiatives",
            originalQuestions: ['q10', 'q11', 'q12', 'q13', 'q14', 'q15'],
            questionTexts: {
                q10: "I feel confident in my ability to adapt to ongoing changes within the organisation.",
                q11: "The organisation communicates the purpose and impact of changes clearly.",
                q12: "I understand the impacts of changes to the organisation.",
                q13: "When a change is introduced, my line manager effectively communicates and manages the change.",
                q14: "My feedback and concerns about change are heard and considered by leadership.",
                q15: "My organisation has provided me with sufficient resources to enable me to navigate current changes."
            },
            icon: 'trending_up',
            color: '#E91E63',
            gradientColors: ['#E91E63', '#C2185B'],
            ratingScale: "1-6",
            numberOfQuestions: 6,
            active: true
        },
        riskCulture: {
            id: 'riskCulture',
            title: "Risk Culture",
            description: "Measures organizational attitudes and behaviors toward risk management",
            originalQuestions: ['q16', 'q17', 'q18', 'q19', 'q20', 'q21'],
            questionTexts: {
                q16: "Our organization promotes a culture of risk awareness and responsibility",
                q17: "Employees feel comfortable raising concerns about potential risks",
                q18: "Risk management is integrated into our daily decision-making processes",
                q19: "We have clear processes for identifying and reporting risks",
                q20: "Leaders demonstrate commitment to risk management through their actions",
                q21: "Our organization learns from past risk events to improve future practices"
            },
            icon: 'security',
            color: '#9C27B0',
            gradientColors: ['#9C27B0', '#7B1FA2'],
            active: false  // Set to true to reactivate this dimension
        }
    },
    
    // Helper method to get active dimensions in order
    getActiveDimensions() {
        return this.dimensionOrder
            .map(id => this.dimensionDefinitions[id])
            .filter(dimension => dimension && dimension.active);
    },
    
    // Helper method to get active dimension IDs in order
    getActiveDimensionIds() {
        return this.dimensionOrder.filter(id => 
            this.dimensionDefinitions[id] && this.dimensionDefinitions[id].active
        );
    }
};

// Question Numbering Management System
class QuestionNumberingManager {
    constructor() {
        this.questionMapping = this.buildQuestionMapping();
    }
    
    buildQuestionMapping() {
        const mapping = {
            originalToDisplay: {},
            displayToOriginal: {},
            dimensionRanges: {},
            activeDimensions: []
        };
        
        let displayNumber = 1;
        
        // Process dimensions in configured order
        DIMENSION_CONFIG.dimensionOrder.forEach(dimensionId => {
            const dimension = DIMENSION_CONFIG.dimensionDefinitions[dimensionId];
            
            if (dimension && dimension.active) {
                const startNumber = displayNumber;
                mapping.activeDimensions.push(dimensionId);
                
                dimension.originalQuestions.forEach(originalId => {
                    mapping.originalToDisplay[originalId] = displayNumber;
                    mapping.displayToOriginal[displayNumber] = originalId;
                    displayNumber++;
                });
                
                mapping.dimensionRanges[dimensionId] = {
                    start: startNumber,
                    end: displayNumber - 1,
                    count: dimension.originalQuestions.length,
                    title: dimension.title
                };
            }
        });
        
        return mapping;
    }
    
    // Get display number for an original question ID (e.g., q4 -> 1)
    getDisplayNumber(originalQuestionId) {
        return this.questionMapping.originalToDisplay[originalQuestionId];
    }
    
    // Get original question ID for a display number (e.g., 1 -> q4)
    getOriginalId(displayNumber) {
        return this.questionMapping.displayToOriginal[displayNumber];
    }
    
    // Get question range info for a dimension
    getDimensionRange(dimensionId) {
        return this.questionMapping.dimensionRanges[dimensionId];
    }
    
    // Get total number of active questions
    getTotalActiveQuestions() {
        return Object.keys(this.questionMapping.displayToOriginal).length;
    }
    
    // Get active dimensions in survey order
    getActiveDimensions() {
        return this.questionMapping.activeDimensions;
    }
    
    // Get questions for a specific page/dimension
    getQuestionsForDimension(dimensionId) {
        const dimension = DIMENSION_CONFIG.dimensionDefinitions[dimensionId];
        return dimension ? dimension.originalQuestions : [];
    }
    
    // Rebuild mapping (call after configuration changes)
    rebuild() {
        this.questionMapping = this.buildQuestionMapping();
    }
}

// Global instance
window.questionNumberingManager = new QuestionNumberingManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DIMENSION_CONFIG, QuestionNumberingManager, FEATURES };
} 