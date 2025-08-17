/**
 * PersonalitySpark - API Service
 * Handles all API communications with graceful fallbacks
 */

class APIService {
    constructor() {
        this.baseURL = this.getBaseURL();
        this.timeout = 10000; // 10 seconds
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 second
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Get base URL for API calls
     */
    getBaseURL() {
        // In production, this would be your actual API endpoint
        // For this demo, we'll use mock responses
        return window.location.origin + '/api/v1';
    }

    /**
     * Make HTTP request with retry logic
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            timeout: this.timeout,
            ...options
        };

        // Check cache for GET requests
        if (config.method === 'GET') {
            const cached = this.getFromCache(url);
            if (cached) {
                return cached;
            }
        }

        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                console.log(`🌐 API Request (attempt ${attempt}):`, config.method, endpoint);
                
                const response = await this.fetchWithTimeout(url, config);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                
                // Cache successful GET requests
                if (config.method === 'GET') {
                    this.setCache(url, data);
                }

                console.log('✅ API Response:', data);
                return data;

            } catch (error) {
                console.warn(`⚠️ API Request failed (attempt ${attempt}):`, error.message);
                
                if (attempt === this.retryAttempts) {
                    // Final attempt failed, try fallback
                    return this.handleAPIError(endpoint, options, error);
                }
                
                // Wait before retry
                await this.sleep(this.retryDelay * attempt);
            }
        }
    }

    /**
     * Fetch with timeout
     */
    fetchWithTimeout(url, config) {
        return Promise.race([
            fetch(url, config),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), config.timeout)
            )
        ]);
    }

    /**
     * Handle API errors with fallbacks
     */
    async handleAPIError(endpoint, options, error) {
        console.log('🔄 Using fallback for:', endpoint);
        
        // Try to return cached data first
        if (options.method === 'GET' || !options.method) {
            const cached = this.getFromCache(`${this.baseURL}${endpoint}`, true); // Allow expired cache
            if (cached) {
                console.log('📦 Returning expired cached data');
                return cached;
            }
        }

        // Return mock data based on endpoint
        return this.getMockResponse(endpoint, options);
    }

    /**
     * Get mock response for offline/error scenarios
     */
    getMockResponse(endpoint, options) {
        const mockResponses = {
            '/quizzes/generate/big5': this.getMockBig5Quiz(),
            '/quizzes/generate/daily': this.getMockDailyQuiz(),
            '/quizzes/generate/quick': this.getMockQuickQuiz(),
            '/quizzes/generate/thisorthat': this.getMockThisOrThatQuiz(),
            '/quizzes/generate/mood': this.getMockMoodQuiz(),
            '/quizzes/generate/career': this.getMockCareerQuiz(),
            '/quizzes/categories': this.getMockQuizCategories(),
            '/ai/analyze-personality': this.getMockPersonalityAnalysis(options.body),
            '/share/create-card': this.getMockShareCard(options.body),
            '/analytics/track': this.getMockAnalyticsResponse(),
            '/user/profile': this.getMockUserProfile()
        };

        // Handle dynamic endpoints
        if (endpoint.startsWith('/quizzes/result/')) {
            return this.getMockQuizResult();
        }

        if (endpoint.startsWith('/share/preview/')) {
            return this.getMockSharePreview();
        }

        const response = mockResponses[endpoint];
        if (response) {
            console.log('🎭 Returning mock response for:', endpoint);
            return Promise.resolve(response);
        }

        // Default error response
        console.error('❌ No mock response available for:', endpoint);
        return Promise.reject(new Error(`API endpoint not available: ${endpoint}`));
    }

    /**
     * Cache management
     */
    setCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    getFromCache(key, allowExpired = false) {
        const cached = this.cache.get(key);
        if (!cached) return null;

        const isExpired = Date.now() - cached.timestamp > this.cacheExpiry;
        if (isExpired && !allowExpired) {
            this.cache.delete(key);
            return null;
        }

        console.log(`📦 Cache ${isExpired ? '(expired)' : 'hit'} for:`, key);
        return cached.data;
    }

    clearCache() {
        this.cache.clear();
    }

    /**
     * Utility functions
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Public API methods
     */

    /**
     * Generate a new quiz
     */
    async generateQuiz(quizType, options = {}) {
        return this.request(`/quizzes/generate/${quizType}`, {
            method: 'POST',
            body: JSON.stringify(options)
        });
    }

    /**
     * Submit quiz answers
     */
    async submitQuiz(quizId, answers) {
        return this.request('/quizzes/submit', {
            method: 'POST',
            body: JSON.stringify({ quizId, answers })
        });
    }

    /**
     * Get quiz result
     */
    async getQuizResult(resultId) {
        return this.request(`/quizzes/result/${resultId}`);
    }

    /**
     * Get quiz categories
     */
    async getQuizCategories() {
        return this.request('/quizzes/categories');
    }

    /**
     * Analyze personality with AI
     */
    async analyzePersonality(answers, quizType) {
        return this.request('/ai/analyze-personality', {
            method: 'POST',
            body: JSON.stringify({ answers, quizType })
        });
    }

    /**
     * Generate insights
     */
    async generateInsights(personalityData) {
        return this.request('/ai/generate-insights', {
            method: 'POST',
            body: JSON.stringify(personalityData)
        });
    }

    /**
     * Create share card
     */
    async createShareCard(resultData) {
        return this.request('/share/create-card', {
            method: 'POST',
            body: JSON.stringify(resultData)
        });
    }

    /**
     * Get share preview
     */
    async getSharePreview(shareId) {
        return this.request(`/share/preview/${shareId}`);
    }

    /**
     * Track analytics event
     */
    async trackEvent(event, data = {}) {
        // Don't wait for analytics calls
        this.request('/analytics/track', {
            method: 'POST',
            body: JSON.stringify({ event, data, timestamp: Date.now() })
        }).catch(error => {
            // Store analytics events locally if API fails
            if (window.PSStorage) {
                window.PSStorage.saveAnalyticsEvent({ event, data });
            }
        });
    }

    /**
     * Mock response generators
     */

    getMockBig5Quiz() {
        return {
            id: 'quiz-' + Date.now(),
            type: 'big5',
            title: 'Big 5 Personality Assessment',
            description: 'Discover your personality across five major dimensions',
            questions: [
                {
                    id: 1,
                    text: "I see myself as someone who is talkative",
                    options: [
                        { text: "Disagree strongly", value: { extraversion: 1 } },
                        { text: "Disagree a little", value: { extraversion: 2 } },
                        { text: "Neither agree nor disagree", value: { extraversion: 3 } },
                        { text: "Agree a little", value: { extraversion: 4 } },
                        { text: "Agree strongly", value: { extraversion: 5 } }
                    ]
                },
                {
                    id: 2,
                    text: "I see myself as someone who tends to find fault with others",
                    options: [
                        { text: "Disagree strongly", value: { agreeableness: 5 } },
                        { text: "Disagree a little", value: { agreeableness: 4 } },
                        { text: "Neither agree nor disagree", value: { agreeableness: 3 } },
                        { text: "Agree a little", value: { agreeableness: 2 } },
                        { text: "Agree strongly", value: { agreeableness: 1 } }
                    ]
                },
                // Add more questions as needed...
                {
                    id: 3,
                    text: "I see myself as someone who does a thorough job",
                    options: [
                        { text: "Disagree strongly", value: { conscientiousness: 1 } },
                        { text: "Disagree a little", value: { conscientiousness: 2 } },
                        { text: "Neither agree nor disagree", value: { conscientiousness: 3 } },
                        { text: "Agree a little", value: { conscientiousness: 4 } },
                        { text: "Agree strongly", value: { conscientiousness: 5 } }
                    ]
                }
            ],
            estimatedTime: 900, // 15 minutes in seconds
            totalQuestions: 3 // Reduced for demo
        };
    }

    getMockDailyQuiz() {
        const dailyQuestions = [
            "How do you prefer to start your day?",
            "When facing a challenge, you typically:",
            "Your ideal weekend activity would be:",
            "When making decisions, you rely most on:",
            "You feel most energized when:"
        ];

        const question = dailyQuestions[new Date().getDay() % dailyQuestions.length];

        return {
            id: 'daily-' + new Date().toISOString().split('T')[0],
            type: 'daily',
            title: 'Daily Personality Challenge',
            description: "Today's quick personality insight",
            questions: [
                {
                    id: 1,
                    text: question,
                    options: [
                        { text: "Option A", value: { trait1: 5 } },
                        { text: "Option B", value: { trait2: 5 } },
                        { text: "Option C", value: { trait3: 5 } },
                        { text: "Option D", value: { trait4: 5 } }
                    ]
                }
            ],
            estimatedTime: 180, // 3 minutes
            totalQuestions: 1
        };
    }

    getMockQuickQuiz() {
        return {
            id: 'quick-' + Date.now(),
            type: 'quick',
            title: 'Quick Personality Assessment',
            description: 'Fast insights about your personality',
            questions: [
                {
                    id: 1,
                    text: "In social situations, you tend to be:",
                    options: [
                        { text: "The center of attention", value: { extraversion: 5 } },
                        { text: "Actively engaged but not dominant", value: { extraversion: 4 } },
                        { text: "A careful observer", value: { extraversion: 2 } },
                        { text: "Preferring one-on-one conversations", value: { extraversion: 1 } }
                    ]
                },
                {
                    id: 2,
                    text: "When stressed, you prefer to:",
                    options: [
                        { text: "Talk it out with someone", value: { social_coping: 5 } },
                        { text: "Exercise or do physical activity", value: { active_coping: 5 } },
                        { text: "Spend time alone to recharge", value: { solitary_coping: 5 } },
                        { text: "Distract yourself with entertainment", value: { avoidant_coping: 5 } }
                    ]
                }
            ],
            estimatedTime: 120, // 2 minutes
            totalQuestions: 2
        };
    }

    getMockThisOrThatQuiz() {
        return {
            id: 'thisorthat-' + Date.now(),
            type: 'thisorthat',
            title: 'This or That Personality Test',
            description: 'Choose your preferences to reveal your personality',
            questions: [
                {
                    id: 1,
                    text: "Coffee or Tea?",
                    options: [
                        { text: "Coffee ☕", value: { energy: 5, practical: 3 } },
                        { text: "Tea 🍵", value: { calm: 5, mindful: 3 } }
                    ]
                },
                {
                    id: 2,
                    text: "Beach or Mountains?",
                    options: [
                        { text: "Beach 🏖️", value: { relaxed: 5, social: 3 } },
                        { text: "Mountains 🏔️", value: { adventurous: 5, introspective: 3 } }
                    ]
                }
            ],
            estimatedTime: 300, // 5 minutes
            totalQuestions: 2
        };
    }

    getMockMoodQuiz() {
        return {
            id: 'mood-' + Date.now(),
            type: 'mood',
            title: 'Mood-Based Personality Test',
            description: 'How your mood influences your personality',
            questions: [
                {
                    id: 1,
                    text: "How would you describe your current mood?",
                    options: [
                        { text: "Energetic and optimistic", value: { positive_mood: 5, high_energy: 5 } },
                        { text: "Calm and content", value: { peaceful_mood: 5, balanced_energy: 3 } },
                        { text: "Focused and determined", value: { goal_oriented: 5, medium_energy: 4 } },
                        { text: "Reflective and contemplative", value: { introspective_mood: 5, low_energy: 2 } }
                    ]
                }
            ],
            estimatedTime: 420, // 7 minutes
            totalQuestions: 1
        };
    }

    getMockCareerQuiz() {
        return {
            id: 'career-' + Date.now(),
            type: 'career',
            title: 'Career Match Personality Test',
            description: 'Find careers that match your personality',
            questions: [
                {
                    id: 1,
                    text: "In your ideal work day, you would spend most time:",
                    options: [
                        { text: "Collaborating with team members", value: { teamwork: 5, social: 4 } },
                        { text: "Analyzing data and solving problems", value: { analytical: 5, detail_oriented: 4 } },
                        { text: "Creating and designing new things", value: { creative: 5, innovative: 4 } },
                        { text: "Leading and making decisions", value: { leadership: 5, decisive: 4 } }
                    ]
                }
            ],
            estimatedTime: 720, // 12 minutes
            totalQuestions: 1
        };
    }

    getMockQuizCategories() {
        return {
            categories: [
                {
                    id: 'personality',
                    name: 'Personality',
                    description: 'Core personality assessments',
                    quizCount: 3
                },
                {
                    id: 'career',
                    name: 'Career',
                    description: 'Career-focused personality tests',
                    quizCount: 2
                },
                {
                    id: 'quick',
                    name: 'Quick Tests',
                    description: 'Fast personality insights',
                    quizCount: 4
                },
                {
                    id: 'daily',
                    name: 'Daily Challenges',
                    description: 'Daily personality exploration',
                    quizCount: 1
                }
            ]
        };
    }

    getMockPersonalityAnalysis(requestBody) {
        const analysis = {
            traits: {
                extraversion: { score: 4, percentage: 80 },
                agreeableness: { score: 3, percentage: 60 },
                conscientiousness: { score: 5, percentage: 100 },
                neuroticism: { score: 2, percentage: 40 },
                openness: { score: 4, percentage: 80 }
            },
            insights: {
                summary: "You demonstrate strong leadership qualities with high conscientiousness and extraversion. You're naturally organized and socially confident.",
                strengths: [
                    "Excellent organizational skills and reliability",
                    "Strong social confidence and leadership abilities",
                    "Open to new experiences and ideas"
                ],
                growthAreas: [
                    "Consider developing stress management techniques",
                    "Practice active listening in social situations"
                ],
                recommendations: [
                    "Seek roles that combine leadership with creativity",
                    "Consider mentoring others to leverage your strengths",
                    "Explore new challenges to satisfy your openness to experience"
                ]
            }
        };

        return Promise.resolve(analysis);
    }

    getMockShareCard(requestBody) {
        return {
            shareId: 'share-' + Date.now(),
            imageUrl: '/assets/images/share-card-placeholder.png',
            shareUrl: window.location.origin + '/share/' + Date.now(),
            socialText: "I just discovered fascinating insights about my personality! Check out PersonalitySpark for AI-powered personality quizzes.",
            expires: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
        };
    }

    getMockQuizResult() {
        return {
            id: 'result-' + Date.now(),
            quizType: 'big5',
            completedAt: new Date().toISOString(),
            traits: {
                extraversion: { score: 4, percentage: 80 },
                agreeableness: { score: 3, percentage: 60 },
                conscientiousness: { score: 5, percentage: 100 }
            },
            insights: {
                summary: "Your personality profile shows strong organizational skills combined with social confidence.",
                strengths: ["Leadership", "Organization", "Social skills"],
                recommendations: ["Seek leadership roles", "Mentor others", "Embrace new challenges"]
            }
        };
    }

    getMockSharePreview() {
        return {
            title: "Personality Results - PersonalitySpark",
            description: "Check out these fascinating personality insights!",
            imageUrl: '/assets/images/share-preview.png',
            traits: ["Leadership", "Creativity", "Organization"]
        };
    }

    getMockAnalyticsResponse() {
        return { success: true, tracked: true };
    }

    getMockUserProfile() {
        return {
            id: 'user-' + Date.now(),
            preferences: {
                theme: 'light',
                notifications: true,
                shareResults: true
            },
            stats: {
                totalQuizzes: 5,
                favoriteQuizType: 'big5',
                joinDate: '2024-01-01'
            }
        };
    }
}

// Create global instance
const apiService = new APIService();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.PSAPI = apiService;
}

// Export class for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIService;
}