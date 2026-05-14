// Generate statements from config
function generateStatementsFromConfig() {
    const statements = [];
    
    // Check if config is available
    if (typeof DIMENSION_CONFIG === 'undefined') {
        console.warn('DIMENSION_CONFIG not available, using fallback statements');
        return getFallbackStatements();
    }
    
    // Get active dimensions from config
    const activeDimensions = DIMENSION_CONFIG.getActiveDimensions();
    
    activeDimensions.forEach(dimension => {
        // Generate statements for each question in the dimension
        Object.entries(dimension.questionTexts).forEach(([questionId, questionText], index) => {
            // Use deterministic scores based on question index and dimension
            let baseScore, previousScore;
            
            if (dimension.id === 'engagement') {
                // Employee Engagement (1-6 scale) - predefined realistic scores
                const engagementScores = [
                    { current: 2.8, previous: 3.1 }, // "feels energised"
                    { current: 3.1, previous: 2.9 }, // "feels excited"
                    { current: 4.2, previous: 4.0 }, // "feels energetic"
                    { current: 3.6, previous: 3.6 }, // "feels enthusiastic"
                    { current: 4.5, previous: 4.3 }, // "feels happy"
                    { current: 2.9, previous: 3.2 }  // "is inspired"
                ];
                const scoreData = engagementScores[index] || { current: 3.5, previous: 3.4 };
                baseScore = scoreData.current;
                previousScore = scoreData.previous;
            } else if (dimension.id === 'changeReadiness') {
                // Change Resilience (1-6 scale) - predefined realistic scores
                const changeReadinessScores = [
                    { current: 3.4, previous: 3.7 }, // "heard about changes"
                    { current: 4.8, previous: 4.6 }, // "aware of scope"
                    { current: 4.6, previous: 4.4 }, // "understand why"
                    { current: 2.6, previous: 2.8 }, // "understand impacts"
                    { current: 4.3, previous: 4.3 }, // "believe change is right"
                    { current: 4.1, previous: 4.0 }  // "understand benefits"
                ];
                const scoreData = changeReadinessScores[index] || { current: 3.5, previous: 3.4 };
                baseScore = scoreData.current;
                previousScore = scoreData.previous;
            } else {
                // Default for other dimensions
                baseScore = 3.5 + (index * 0.2);
                previousScore = baseScore + (index % 2 === 0 ? 0.1 : -0.1);
            }
            
            // Ensure scores are within valid ranges
            const maxScore = 6; // Both dimensions now use 6-point scale
            baseScore = Math.max(1, Math.min(maxScore, baseScore));
            previousScore = Math.max(1, Math.min(maxScore, previousScore));
            
            // Calculate trend
            const trend = baseScore > previousScore ? "up" : 
                         baseScore < previousScore ? "down" : "level";
            
            statements.push({
                text: questionText,
                score: Math.round(baseScore * 10) / 10, // Round to 1 decimal
                previousScore: Math.round(previousScore * 10) / 10,
                trend: trend,
                dimension: dimension.title
            });
        });
    });
    
    return statements;
}

// Fallback statements in case config is not available
function getFallbackStatements() {
    return [
        {
            text: "In this team nearly everyone feels energised by the work that they do",
            score: 2.8,
            previousScore: 3.1,
            trend: "down",
            dimension: "Employee Engagement"
        },
        {
            text: "In this team nearly everyone feels excited about the work that they do",
            score: 3.1,
            previousScore: 2.9,
            trend: "up",
            dimension: "Employee Engagement"
        },
        {
            text: "In this team nearly everyone feels energetic while at work",
            score: 4.2,
            previousScore: 4.0,
            trend: "up",
            dimension: "Employee Engagement"
        },
        {
            text: "In this team nearly everyone feels enthusiastic about their work",
            score: 3.6,
            previousScore: 3.6,
            trend: "level",
            dimension: "Employee Engagement"
        },
        {
            text: "In this team nearly everyone feels happy and in good spirits while at work",
            score: 4.5,
            previousScore: 4.3,
            trend: "up",
            dimension: "Employee Engagement"
        },
        {
            text: "In this team nearly everyone is inspired by their work",
            score: 2.9,
            previousScore: 3.2,
            trend: "down",
            dimension: "Employee Engagement"
        },
        {
            text: "I feel confident in my ability to adapt to ongoing changes within the organisation.",
            score: 3.4,
            previousScore: 3.7,
            trend: "down",
            dimension: "Change Resilience"
        },
        {
            text: "The organisation communicates the purpose and impact of changes clearly.",
            score: 4.8,
            previousScore: 4.6,
            trend: "up",
            dimension: "Change Resilience"
        },
        {
            text: "I understand the impacts of changes to the organisation.",
            score: 4.6,
            previousScore: 4.4,
            trend: "up",
            dimension: "Change Resilience"
        },
        {
            text: "When a change is introduced, my line manager effectively communicates and manages the change.",
            score: 2.6,
            previousScore: 2.8,
            trend: "down",
            dimension: "Change Resilience"
        },
        {
            text: "My feedback and concerns about change are heard and considered by leadership.",
            score: 4.3,
            previousScore: 4.3,
            trend: "level",
            dimension: "Change Resilience"
        },
        {
            text: "My organisation has provided me with sufficient resources to enable me to navigate current changes.",
            score: 4.1,
            previousScore: 4.0,
            trend: "up",
            dimension: "Change Resilience"
        }
    ];
}

// Function to regenerate statements (useful for testing or when config changes)
// Note: Scores are deterministic and will be consistent across page loads
function regenerateStatements() {
    dashboardData.allStatements = generateStatementsFromConfig();
    return dashboardData.allStatements;
}

const dashboardData = {
    responseRate: {
        total: 8540,
        responses: 4750,
        previous: {
            total: 8500,
            responses: 5100
        }
    },
    pulseScore: {
        current: 4.38,
        previous: 4.26
    },
    flightRisk: {
        current: 4.08,
        previous: 4.32
    },
    reliability: {
        status: "Moderately Reliable",
        remaining: 42
    },
    businessUnits: [
        {
            name: "Finance",
            pulseScore: { current: 4.52, previous: 4.18 },
            responseRate: { current: 78, previous: 72 },
            dimensions: {
                "Employee Sentiment": { current: 4.15, previous: 3.95 },
                "Employee Engagement": { current: 4.68, previous: 4.45 },
                "Change Resilience": { current: 4.72, previous: 4.82 },
                "Risk Culture": { current: 4.25, previous: 4.15 }
            }
        },
        {
            name: "Marketing",
            pulseScore: { current: 4.28, previous: 4.35 },
            responseRate: { current: 65, previous: 68 },
            dimensions: {
                "Employee Sentiment": { current: 3.85, previous: 4.10 },
                "Employee Engagement": { current: 4.25, previous: 4.30 },
                "Change Readiness": { current: 4.75, previous: 4.90 },
                "Risk Culture": { current: 4.15, previous: 4.05 }
            }
        },
        {
            name: "Technology",
            pulseScore: { current: 4.45, previous: 4.22 },
            responseRate: { current: 82, previous: 75 },
            dimensions: {
                "Employee Sentiment": { current: 4.05, previous: 3.85 },
                "Employee Engagement": { current: 4.55, previous: 4.25 },
                "Change Readiness": { current: 4.75, previous: 4.65 },
                "Risk Culture": { current: 4.35, previous: 4.25 }
            }
        },
        {
            name: "Operations",
            pulseScore: { current: 4.15, previous: 4.28 },
            responseRate: { current: 71, previous: 74 },
            dimensions: {
                "Employee Sentiment": { current: 3.75, previous: 4.05 },
                "Employee Engagement": { current: 4.15, previous: 4.35 },
                "Change Readiness": { current: 4.55, previous: 4.75 },
                "Risk Culture": { current: 4.05, previous: 3.95 }
            }
        },
        {
            name: "Human Resources",
            pulseScore: { current: 4.62, previous: 4.45 },
            responseRate: { current: 85, previous: 80 },
            dimensions: {
                "Employee Sentiment": { current: 4.25, previous: 4.15 },
                "Employee Engagement": { current: 4.75, previous: 4.55 },
                "Change Readiness": { current: 4.85, previous: 4.75 },
                "Risk Culture": { current: 4.45, previous: 4.35 }
            }
        },
        {
            name: "Sales",
            pulseScore: { current: 4.18, previous: 4.32 },
            responseRate: { current: 68, previous: 71 },
            dimensions: {
                "Employee Sentiment": { current: 3.95, previous: 4.15 },
                "Employee Engagement": { current: 4.25, previous: 4.40 },
                "Change Readiness": { current: 4.35, previous: 4.55 },
                "Risk Culture": { current: 3.95, previous: 3.85 }
            }
        }
    ],
    dimensions: [
        {
            title: "Employee Sentiment",
            score: 3.90,
            previous: {
                score: 4.20
            },
            trend: -0.30,
            hasWarning: true,
            questions: 3,
            description: "Measures overall feelings and attitudes toward the workplace"
        },
        {
            title: "Employee Engagement",
            score: 4.32,
            previous: {
                score: 4.32
            },
            trend: 0.00,
            hasWarning: false,
            questions: 6,
            description: "Measures commitment, involvement, and enthusiasm toward work and organization"
        },
        {
            title: "Change Resilience",
            score: 4.86,
            previous: {
                score: 4.92
            },
            trend: -0.06,
            hasWarning: false,
            questions: 6,
            description: "Measures organizational readiness and adaptability to change initiatives"
        },
        {
            title: "Risk Culture",
            score: 4.15,
            previous: {
                score: 4.08
            },
            trend: 0.07,
            hasWarning: false,
            questions: 6,
            description: "Measures organizational attitudes and behaviors toward risk management"
        }
    ],
    allStatements: generateStatementsFromConfig(),
    sentiment: {
        positive: 57,
        neutral: 16,
        negative: 27,
        totalComments: 35894
    },
    sentimentAnalysis: {
        positive: [
            { theme: "Team Collaboration", comments: 215 },
            { theme: "Supportive Management", comments: 189 },
            { theme: "Career Growth", comments: 154 },
            { theme: "Work-Life Balance", comments: 121 },
            { theme: "Company Mission", comments: 98 }
        ],
        negative: [
            { theme: "Communication Issues", comments: 198 },
            { theme: "High Workload", comments: 176 },
            { theme: "Lack of Recognition", comments: 145 },
            { theme: "Outdated Tools", comments: 112 },
            { theme: "Siloed Departments", comments: 89 }
        ]
    },
    comments: {
        totalComments: 35894,
        commentsByStatement: [
            {
                statement: "I would recommend our organisation as a great place to work",
                dimension: "Employee Sentiment",
                totalComments: 3247,
                sentiment: {
                    positive: 68,
                    neutral: 12,
                    negative: 20
                },
                sampleComments: [
                    {
                        text: "Great company culture and supportive environment. I feel valued here.",
                        sentiment: "positive",
                        businessUnit: "Technology",
                        jobLevel: "senior",
                        timestamp: "2024-01-15T10:30:00Z"
                    },
                    {
                        text: "The work-life balance is excellent and management really cares about employees.",
                        sentiment: "positive",
                        businessUnit: "Human Resources",
                        jobLevel: "manager",
                        timestamp: "2024-01-15T11:45:00Z"
                    },
                    {
                        text: "Some departments could improve their communication and collaboration.",
                        sentiment: "negative",
                        businessUnit: "Operations",
                        jobLevel: "intermediate",
                        timestamp: "2024-01-15T14:20:00Z"
                    }
                ]
            },
            {
                statement: "I am proud to be associated with our organisation",
                dimension: "Employee Engagement",
                totalComments: 2987,
                sentiment: {
                    positive: 72,
                    neutral: 15,
                    negative: 13
                },
                sampleComments: [
                    {
                        text: "Proud to work for a company that makes a real difference in people's lives.",
                        sentiment: "positive",
                        businessUnit: "Finance",
                        jobLevel: "director",
                        timestamp: "2024-01-15T09:15:00Z"
                    },
                    {
                        text: "The company's values align with my personal beliefs.",
                        sentiment: "positive",
                        businessUnit: "Marketing",
                        jobLevel: "senior",
                        timestamp: "2024-01-15T13:30:00Z"
                    }
                ]
            },
            {
                statement: "I rarely think about looking for a job at a different organisation",
                dimension: "Employee Sentiment",
                totalComments: 2156,
                sentiment: {
                    positive: 35,
                    neutral: 25,
                    negative: 40
                },
                sampleComments: [
                    {
                        text: "Sometimes I wonder if there are better opportunities elsewhere.",
                        sentiment: "negative",
                        businessUnit: "Sales",
                        jobLevel: "intermediate",
                        timestamp: "2024-01-15T16:45:00Z"
                    },
                    {
                        text: "The compensation could be more competitive in the market.",
                        sentiment: "negative",
                        businessUnit: "Operations",
                        jobLevel: "senior",
                        timestamp: "2024-01-15T17:20:00Z"
                    }
                ]
            }
        ],
        commentsByBusinessUnit: {
            "Finance": {
                totalComments: 5234,
                sentiment: { positive: 65, neutral: 18, negative: 17 },
                topThemes: ["Career Growth", "Work-Life Balance", "Compensation"],
                sampleComments: [
                    "Great opportunities for advancement in the finance department.",
                    "The workload can be overwhelming during quarter-end periods.",
                    "Management is very supportive of professional development."
                ]
            },
            "Technology": {
                totalComments: 6123,
                sentiment: { positive: 58, neutral: 20, negative: 22 },
                topThemes: ["Innovation", "Technical Challenges", "Remote Work"],
                sampleComments: [
                    "Exciting projects and cutting-edge technology to work with.",
                    "Sometimes the technical debt slows down development.",
                    "Flexible remote work options are appreciated."
                ]
            },
            "Operations": {
                totalComments: 4876,
                sentiment: { positive: 52, neutral: 23, negative: 25 },
                topThemes: ["Process Efficiency", "Communication", "Workload"],
                sampleComments: [
                    "Processes could be more streamlined and efficient.",
                    "Communication between departments needs improvement.",
                    "The workload is manageable but could be better distributed."
                ]
            }
        },
        trendingTopics: [
            {
                topic: "Remote Work",
                mentions: 1247,
                trend: "+15%",
                sentiment: "positive",
                relatedStatements: ["I am happy working at our organisation", "I feel motivated to contribute"]
            },
            {
                topic: "Career Development",
                mentions: 987,
                trend: "+8%",
                sentiment: "positive",
                relatedStatements: ["I am proud to be associated with our organisation"]
            },
            {
                topic: "Communication",
                mentions: 1456,
                trend: "-5%",
                sentiment: "negative",
                relatedStatements: ["In this team nearly everyone feels energised by the work"]
            },
            {
                topic: "Workload",
                mentions: 1123,
                trend: "-12%",
                sentiment: "negative",
                relatedStatements: ["I rarely think about looking for a job at a different organisation"]
            }
        ],
        sentimentTrends: {
            monthly: [
                { month: "Oct 2023", positive: 52, neutral: 18, negative: 30 },
                { month: "Nov 2023", positive: 54, neutral: 17, negative: 29 },
                { month: "Dec 2023", positive: 56, neutral: 16, negative: 28 },
                { month: "Jan 2024", positive: 57, neutral: 16, negative: 27 }
            ]
        }
    },
    organizationLevels: {
        levels: [
            {
                name: "Company",
                options: ["Global Corp"]
            },
            {
                name: "Division",
                options: ["Technology", "Sales", "Operations", "Finance"]
            },
            {
                name: "Department",
                options: ["Software Development", "Infrastructure", "Data Science", "Product Management"]
            },
            {
                name: "Team",
                options: ["Frontend", "Backend", "DevOps", "QA", "UX"]
            },
            {
                name: "Sub-Team",
                options: ["Team A", "Team B", "Team C"]
            },
            {
                name: "Project",
                options: ["Project X", "Project Y", "Project Z"]
            }
        ]
    },
    progressTracker: {
        company: {
            name: "OML - Old Mutual Limited",
            population: 27518,
            completed: 19917,
            inProgress: 4283,
            notStarted: 3318,
            completionRate: 72,
            children: "segments"
        },
        segments: [
            {
                name: "Corporate",
                population: 2856,
                completed: 2642,
                inProgress: 128,
                notStarted: 86,
                completionRate: 93,
                divisions: [
                    {
                        name: "Group Finance",
                        population: 1205,
                        completed: 1156,
                        inProgress: 32,
                        notStarted: 17,
                        completionRate: 96,
                        departments: [
                            {
                                name: "Customer Service",
                                population: 456,
                                completed: 432,
                                inProgress: 12,
                                notStarted: 12,
                                completionRate: 95,
                                teams: [
                                    {
                                        name: "Team Alpha",
                                        population: 156,
                                        completed: 148,
                                        inProgress: 4,
                                        notStarted: 4,
                                        completionRate: 95
                                    },
                                    {
                                        name: "Team Beta",
                                        population: 200,
                                        completed: 189,
                                        inProgress: 6,
                                        notStarted: 5,
                                        completionRate: 95
                                    },
                                    {
                                        name: "Team Gamma",
                                        population: 100,
                                        completed: 95,
                                        inProgress: 2,
                                        notStarted: 3,
                                        completionRate: 95
                                    }
                                ]
                            },
                            {
                                name: "Product Development",
                                population: 349,
                                completed: 324,
                                inProgress: 15,
                                notStarted: 10,
                                completionRate: 93,
                                teams: [
                                    {
                                        name: "Team Delta",
                                        population: 180,
                                        completed: 167,
                                        inProgress: 8,
                                        notStarted: 5,
                                        completionRate: 93
                                    },
                                    {
                                        name: "Team Epsilon",
                                        population: 169,
                                        completed: 157,
                                        inProgress: 7,
                                        notStarted: 5,
                                        completionRate: 93
                                    }
                                ]
                            },
                            {
                                name: "Quality Assurance",
                                population: 200,
                                completed: 200,
                                inProgress: 0,
                                notStarted: 0,
                                completionRate: 100,
                                teams: [
                                    {
                                        name: "Team Zeta",
                                        population: 200,
                                        completed: 200,
                                        inProgress: 0,
                                        notStarted: 0,
                                        completionRate: 100
                                    }
                                ]
                            },
                            {
                                name: "Business Analysis",
                                population: 200,
                                completed: 200,
                                inProgress: 0,
                                notStarted: 0,
                                completionRate: 100,
                                teams: [
                                    {
                                        name: "Team Eta",
                                        population: 200,
                                        completed: 200,
                                        inProgress: 0,
                                        notStarted: 0,
                                        completionRate: 100
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: "Group Internal Audit",
                        population: 267,
                        completed: 248,
                        inProgress: 12,
                        notStarted: 7,
                        completionRate: 93,
                        departments: [
                            {
                                name: "Risk Management",
                                population: 267,
                                completed: 248,
                                inProgress: 12,
                                notStarted: 7,
                                completionRate: 93,
                                teams: [
                                    {
                                        name: "Team Theta",
                                        population: 267,
                                        completed: 248,
                                        inProgress: 12,
                                        notStarted: 7,
                                        completionRate: 93
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: "Group Risk, Compliance & Actuarial",
                        population: 892,
                        completed: 821,
                        inProgress: 45,
                        notStarted: 26,
                        completionRate: 92,
                        departments: [
                            {
                                name: "Data Analytics",
                                population: 446,
                                completed: 410,
                                inProgress: 23,
                                notStarted: 13,
                                completionRate: 92,
                                teams: [
                                    {
                                        name: "Team Alpha",
                                        population: 223,
                                        completed: 205,
                                        inProgress: 12,
                                        notStarted: 6,
                                        completionRate: 92
                                    },
                                    {
                                        name: "Team Beta",
                                        population: 223,
                                        completed: 205,
                                        inProgress: 11,
                                        notStarted: 7,
                                        completionRate: 92
                                    }
                                ]
                            },
                            {
                                name: "Operations Support",
                                population: 446,
                                completed: 411,
                                inProgress: 22,
                                notStarted: 13,
                                completionRate: 92,
                                teams: [
                                    {
                                        name: "Team Gamma",
                                        population: 223,
                                        completed: 205,
                                        inProgress: 11,
                                        notStarted: 7,
                                        completionRate: 92
                                    },
                                    {
                                        name: "Team Delta",
                                        population: 223,
                                        completed: 206,
                                        inProgress: 11,
                                        notStarted: 6,
                                        completionRate: 92
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: "Group Strategy | Sustainability | People | Public Affairs",
                        population: 492,
                        completed: 417,
                        inProgress: 39,
                        notStarted: 36,
                        completionRate: 85,
                        departments: [
                            {
                                name: "Project Management",
                                population: 246,
                                completed: 208,
                                inProgress: 20,
                                notStarted: 18,
                                completionRate: 85,
                                teams: [
                                    {
                                        name: "Team Epsilon",
                                        population: 123,
                                        completed: 104,
                                        inProgress: 10,
                                        notStarted: 9,
                                        completionRate: 85
                                    },
                                    {
                                        name: "Team Zeta",
                                        population: 123,
                                        completed: 104,
                                        inProgress: 10,
                                        notStarted: 9,
                                        completionRate: 85
                                    }
                                ]
                            },
                            {
                                name: "Operations Support",
                                population: 246,
                                completed: 209,
                                inProgress: 19,
                                notStarted: 18,
                                completionRate: 85,
                                teams: [
                                    {
                                        name: "Team Eta",
                                        population: 123,
                                        completed: 104,
                                        inProgress: 10,
                                        notStarted: 9,
                                        completionRate: 85
                                    },
                                    {
                                        name: "Team Theta",
                                        population: 123,
                                        completed: 105,
                                        inProgress: 9,
                                        notStarted: 9,
                                        completionRate: 85
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                name: "Mass and Foundation Cluster",
                population: 8956,
                completed: 6042,
                inProgress: 1425,
                notStarted: 1489,
                completionRate: 67,
                divisions: [
                    {
                        name: "Mass Market",
                        population: 4521,
                        completed: 3987,
                        inProgress: 312,
                        notStarted: 222,
                        completionRate: 88,
                        departments: [
                            {
                                name: "Customer Service",
                                population: 2261,
                                completed: 1994,
                                inProgress: 156,
                                notStarted: 111,
                                completionRate: 88,
                                teams: [
                                    {
                                        name: "Team Alpha",
                                        population: 1131,
                                        completed: 997,
                                        inProgress: 78,
                                        notStarted: 56,
                                        completionRate: 88
                                    },
                                    {
                                        name: "Team Beta",
                                        population: 1130,
                                        completed: 997,
                                        inProgress: 78,
                                        notStarted: 55,
                                        completionRate: 88
                                    }
                                ]
                            },
                            {
                                name: "Product Development",
                                population: 2260,
                                completed: 1993,
                                inProgress: 156,
                                notStarted: 111,
                                completionRate: 88,
                                teams: [
                                    {
                                        name: "Team Gamma",
                                        population: 1130,
                                        completed: 997,
                                        inProgress: 78,
                                        notStarted: 55,
                                        completionRate: 88
                                    },
                                    {
                                        name: "Team Delta",
                                        population: 1130,
                                        completed: 996,
                                        inProgress: 78,
                                        notStarted: 56,
                                        completionRate: 88
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: "Foundation Services",
                        population: 2156,
                        completed: 1943,
                        inProgress: 147,
                        notStarted: 66,
                        completionRate: 90,
                        departments: [
                            {
                                name: "Quality Assurance",
                                population: 1078,
                                completed: 972,
                                inProgress: 74,
                                notStarted: 32,
                                completionRate: 90,
                                teams: [
                                    {
                                        name: "Team Epsilon",
                                        population: 539,
                                        completed: 486,
                                        inProgress: 37,
                                        notStarted: 16,
                                        completionRate: 90
                                    },
                                    {
                                        name: "Team Zeta",
                                        population: 539,
                                        completed: 486,
                                        inProgress: 37,
                                        notStarted: 16,
                                        completionRate: 90
                                    }
                                ]
                            },
                            {
                                name: "Business Analysis",
                                population: 1078,
                                completed: 971,
                                inProgress: 73,
                                notStarted: 34,
                                completionRate: 90,
                                teams: [
                                    {
                                        name: "Team Eta",
                                        population: 539,
                                        completed: 485,
                                        inProgress: 37,
                                        notStarted: 17,
                                        completionRate: 90
                                    },
                                    {
                                        name: "Team Theta",
                                        population: 539,
                                        completed: 486,
                                        inProgress: 36,
                                        notStarted: 17,
                                        completionRate: 90
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: "Customer Experience",
                        population: 1234,
                        completed: 1076,
                        inProgress: 89,
                        notStarted: 69,
                        completionRate: 87,
                        departments: [
                            {
                                name: "Data Analytics",
                                population: 617,
                                completed: 538,
                                inProgress: 45,
                                notStarted: 34,
                                completionRate: 87,
                                teams: [
                                    {
                                        name: "Team Alpha",
                                        population: 309,
                                        completed: 269,
                                        inProgress: 23,
                                        notStarted: 17,
                                        completionRate: 87
                                    },
                                    {
                                        name: "Team Beta",
                                        population: 308,
                                        completed: 269,
                                        inProgress: 22,
                                        notStarted: 17,
                                        completionRate: 87
                                    }
                                ]
                            },
                            {
                                name: "Operations Support",
                                population: 617,
                                completed: 538,
                                inProgress: 44,
                                notStarted: 35,
                                completionRate: 87,
                                teams: [
                                    {
                                        name: "Team Gamma",
                                        population: 309,
                                        completed: 269,
                                        inProgress: 22,
                                        notStarted: 18,
                                        completionRate: 87
                                    },
                                    {
                                        name: "Team Delta",
                                        population: 308,
                                        completed: 269,
                                        inProgress: 22,
                                        notStarted: 17,
                                        completionRate: 87
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: "Operations Support",
                        population: 1045,
                        completed: 429,
                        inProgress: 251,
                        notStarted: 365,
                        completionRate: 41,
                        departments: [
                            {
                                name: "Project Management",
                                population: 523,
                                completed: 215,
                                inProgress: 126,
                                notStarted: 182,
                                completionRate: 41,
                                teams: [
                                    {
                                        name: "Team Epsilon",
                                        population: 262,
                                        completed: 108,
                                        inProgress: 63,
                                        notStarted: 91,
                                        completionRate: 41
                                    },
                                    {
                                        name: "Team Zeta",
                                        population: 261,
                                        completed: 107,
                                        inProgress: 63,
                                        notStarted: 91,
                                        completionRate: 41
                                    }
                                ]
                            },
                            {
                                name: "Operations Support",
                                population: 522,
                                completed: 214,
                                inProgress: 125,
                                notStarted: 183,
                                completionRate: 41,
                                teams: [
                                    {
                                        name: "Team Eta",
                                        population: 261,
                                        completed: 107,
                                        inProgress: 63,
                                        notStarted: 91,
                                        completionRate: 41
                                    },
                                    {
                                        name: "Team Theta",
                                        population: 261,
                                        completed: 107,
                                        inProgress: 62,
                                        notStarted: 92,
                                        completionRate: 41
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
}; 