/**
 * PersonalitySpark - Quiz Component
 * Handles quiz taking functionality and state management
 */

class QuizManager {
    constructor() {
        this.currentQuiz = null;
        this.currentQuestion = 0;
        this.answers = [];
        this.startTime = null;
        this.questionStartTime = null;
        this.timeSpent = [];
        this.isActive = false;
        this.autoSaveInterval = null;
        this.questionHistory = [];
        
        this.init();
    }

    /**
     * Initialize quiz manager
     */
    init() {
        this.setupEventListeners();
        console.log('🧠 Quiz manager initialized');
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Handle quiz navigation buttons
        document.addEventListener('click', (event) => {
            if (event.target.id === 'quiz-prev-btn') {
                this.previousQuestion();
            } else if (event.target.id === 'quiz-next-btn') {
                this.nextQuestion();
            } else if (event.target.id === 'quiz-exit-btn') {
                this.exitQuiz();
            }
        });

        // Handle keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            if (!this.isActive) return;

            // Arrow keys for navigation
            if (event.key === 'ArrowRight' && this.canGoNext()) {
                event.preventDefault();
                this.nextQuestion();
            } else if (event.key === 'ArrowLeft' && this.canGoPrevious()) {
                event.preventDefault();
                this.previousQuestion();
            }
            
            // Number keys for option selection
            if (event.key >= '1' && event.key <= '9') {
                const optionIndex = parseInt(event.key) - 1;
                this.selectOptionByIndex(optionIndex);
            }
            
            // Enter to proceed
            if (event.key === 'Enter' && this.canGoNext()) {
                event.preventDefault();
                this.nextQuestion();
            }
        });

        // Auto-save on page unload
        window.addEventListener('beforeunload', () => {
            if (this.isActive) {
                this.saveProgress();
            }
        });

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (this.isActive) {
                if (document.hidden) {
                    this.pauseTimer();
                } else {
                    this.resumeTimer();
                }
            }
        });
    }

    /**
     * Start a new quiz
     */
    async startQuiz(quizType, quizData = null) {
        try {
            // Load quiz data if not provided
            if (!quizData) {
                quizData = await this.loadQuizData(quizType);
            }

            this.currentQuiz = {
                id: this.generateQuizId(),
                type: quizType,
                data: quizData,
                startedAt: new Date().toISOString()
            };

            this.currentQuestion = 0;
            this.answers = [];
            this.timeSpent = [];
            this.questionHistory = [];
            this.startTime = Date.now();
            this.questionStartTime = Date.now();
            this.isActive = true;

            // Start auto-save
            this.startAutoSave();

            // Render first question
            this.renderCurrentQuestion();

            // Track quiz start
            if (window.PSAnalytics) {
                window.PSAnalytics.trackQuizStart(quizType, this.currentQuiz.id);
            }

            console.log(`🧠 Started quiz: ${quizType}`);
            return true;

        } catch (error) {
            console.error('Failed to start quiz:', error);
            this.showError('Failed to load quiz. Please try again.');
            return false;
        }
    }

    /**
     * Load quiz data from API or cache
     */
    async loadQuizData(quizType) {
        // Check cache first
        const cached = window.PSStorage?.getCachedQuiz(quizType);
        if (cached) {
            console.log('📦 Using cached quiz data');
            return cached;
        }

        // Load from API
        if (window.PSAPI) {
            const quizData = await window.PSAPI.generateQuiz(quizType);
            
            // Cache the quiz data
            if (window.PSStorage) {
                window.PSStorage.saveCachedQuiz(quizType, quizData);
            }
            
            return quizData;
        }

        throw new Error('No API service available');
    }

    /**
     * Render current question
     */
    renderCurrentQuestion() {
        if (!this.currentQuiz || !this.isActive) {
            return;
        }

        const question = this.getCurrentQuestion();
        if (!question) {
            console.error('No current question found');
            return;
        }

        const quizContent = document.getElementById('quiz-content');
        if (!quizContent) {
            console.error('Quiz content element not found');
            return;
        }

        // Update progress
        this.updateProgress();

        // Record question start time
        this.questionStartTime = Date.now();

        // Render question
        quizContent.innerHTML = `
            <div class="quiz-question" data-question-id="${question.id}">
                <div class="question-header">
                    <div class="question-number">
                        Question ${this.currentQuestion + 1} of ${this.getTotalQuestions()}
                    </div>
                    ${this.getQuestionTimer()}
                </div>
                <h2 class="question-text">${this.sanitizeHTML(question.text)}</h2>
                ${this.renderQuestionOptions(question)}
                ${this.renderQuestionHint(question)}
            </div>
        `;

        // Add event listeners to options
        this.setupOptionEventListeners();

        // Restore previous answer if exists
        this.restoreAnswer();

        // Update navigation buttons
        this.updateNavigationButtons();

        // Animate question entrance
        this.animateQuestionEntrance();

        // Track question view
        if (window.PSAnalytics) {
            window.PSAnalytics.trackQuizQuestion(
                this.currentQuiz.type,
                question.id,
                this.currentQuestion + 1,
                this.getTotalQuestions()
            );
        }
    }

    /**
     * Render question options based on type
     */
    renderQuestionOptions(question) {
        const optionsHtml = question.options.map((option, index) => `
            <button 
                class="option-button" 
                data-option-index="${index}"
                data-option-value="${JSON.stringify(option.value)}"
                aria-label="Option ${index + 1}: ${this.sanitizeHTML(option.text)}"
                ${this.getOptionAttributes(option)}
            >
                <div class="option-content">
                    <div class="option-number">${index + 1}</div>
                    <div class="option-text">${this.sanitizeHTML(option.text)}</div>
                    ${this.getOptionIcon(option)}
                </div>
            </button>
        `).join('');

        return `
            <div class="question-options" role="radiogroup" aria-labelledby="question-text">
                ${optionsHtml}
            </div>
        `;
    }

    /**
     * Get option attributes for accessibility and styling
     */
    getOptionAttributes(option) {
        let attributes = 'role="radio" tabindex="0"';
        
        if (option.icon) {
            attributes += ` data-icon="${option.icon}"`;
        }
        
        if (option.color) {
            attributes += ` style="--option-color: ${option.color}"`;
        }
        
        return attributes;
    }

    /**
     * Get option icon if present
     */
    getOptionIcon(option) {
        if (option.icon) {
            return `<div class="option-icon">${option.icon}</div>`;
        }
        return '';
    }

    /**
     * Render question hint if available
     */
    renderQuestionHint(question) {
        if (question.hint) {
            return `
                <div class="question-hint">
                    <button class="hint-toggle" type="button" aria-expanded="false">
                        💡 Need a hint?
                    </button>
                    <div class="hint-content" hidden>
                        ${this.sanitizeHTML(question.hint)}
                    </div>
                </div>
            `;
        }
        return '';
    }

    /**
     * Get question timer HTML
     */
    getQuestionTimer() {
        if (this.currentQuiz.data.timeLimit) {
            return `
                <div class="question-timer">
                    <div class="timer-icon">⏱️</div>
                    <div class="timer-display" id="question-timer">--:--</div>
                </div>
            `;
        }
        return '';
    }

    /**
     * Set up option event listeners
     */
    setupOptionEventListeners() {
        const options = document.querySelectorAll('.option-button');
        options.forEach((option, index) => {
            option.addEventListener('click', () => {
                this.selectOption(index);
            });

            option.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this.selectOption(index);
                }
            });
        });

        // Set up hint toggle
        const hintToggle = document.querySelector('.hint-toggle');
        if (hintToggle) {
            hintToggle.addEventListener('click', () => {
                this.toggleHint();
            });
        }
    }

    /**
     * Select an option
     */
    selectOption(optionIndex) {
        const question = this.getCurrentQuestion();
        if (!question || optionIndex >= question.options.length) {
            return;
        }

        const selectedOption = question.options[optionIndex];
        const questionTime = Date.now() - this.questionStartTime;

        // Store answer
        this.answers[this.currentQuestion] = {
            questionId: question.id,
            optionIndex: optionIndex,
            optionText: selectedOption.text,
            value: selectedOption.value,
            timeSpent: questionTime,
            timestamp: Date.now()
        };

        // Store time spent on this question
        this.timeSpent[this.currentQuestion] = questionTime;

        // Update UI
        this.updateOptionSelection(optionIndex);

        // Enable next button
        this.updateNavigationButtons();

        // Auto-advance for certain quiz types
        if (this.shouldAutoAdvance()) {
            setTimeout(() => {
                this.nextQuestion();
            }, 500);
        }

        // Track option selection
        if (window.PSAnalytics) {
            window.PSAnalytics.trackEvent('quiz_option_selected', {
                quizType: this.currentQuiz.type,
                questionId: question.id,
                optionIndex: optionIndex,
                timeSpent: questionTime
            });
        }
    }

    /**
     * Select option by index (for keyboard navigation)
     */
    selectOptionByIndex(index) {
        const options = document.querySelectorAll('.option-button');
        if (index < options.length) {
            this.selectOption(index);
        }
    }

    /**
     * Update option selection UI
     */
    updateOptionSelection(selectedIndex) {
        const options = document.querySelectorAll('.option-button');
        options.forEach((option, index) => {
            option.classList.remove('selected');
            option.setAttribute('aria-checked', 'false');
            
            if (index === selectedIndex) {
                option.classList.add('selected');
                option.setAttribute('aria-checked', 'true');
                option.focus();
            }
        });
    }

    /**
     * Go to next question or complete quiz
     */
    nextQuestion() {
        if (!this.canGoNext()) {
            return;
        }

        // Add current question to history
        this.questionHistory.push(this.currentQuestion);

        if (this.currentQuestion < this.getTotalQuestions() - 1) {
            this.currentQuestion++;
            this.renderCurrentQuestion();
        } else {
            this.completeQuiz();
        }
    }

    /**
     * Go to previous question
     */
    previousQuestion() {
        if (!this.canGoPrevious()) {
            return;
        }

        if (this.questionHistory.length > 0) {
            this.currentQuestion = this.questionHistory.pop();
        } else if (this.currentQuestion > 0) {
            this.currentQuestion--;
        }

        this.renderCurrentQuestion();
    }

    /**
     * Complete the quiz
     */
    async completeQuiz() {
        if (!this.isActive) {
            return;
        }

        try {
            this.isActive = false;
            this.stopAutoSave();

            const totalTime = Date.now() - this.startTime;
            
            // Calculate results
            const results = await this.calculateResults();

            // Save results
            this.saveResults(results);

            // Track completion
            if (window.PSAnalytics) {
                window.PSAnalytics.trackQuizComplete(
                    this.currentQuiz.type,
                    this.currentQuiz.id,
                    totalTime,
                    this.answers
                );
            }

            // Navigate to results
            if (window.PSNavigation) {
                window.PSNavigation.navigateToResults(results);
            }

            console.log('🎉 Quiz completed!');

        } catch (error) {
            console.error('Failed to complete quiz:', error);
            this.showError('Failed to process quiz results. Please try again.');
        }
    }

    /**
     * Calculate quiz results
     */
    async calculateResults() {
        const scores = {};
        const traits = {};

        // Aggregate scores from all answers
        this.answers.forEach(answer => {
            if (answer && answer.value) {
                Object.keys(answer.value).forEach(trait => {
                    if (!scores[trait]) {
                        scores[trait] = [];
                    }
                    scores[trait].push(answer.value[trait]);
                });
            }
        });

        // Calculate average scores for each trait
        Object.keys(scores).forEach(trait => {
            const values = scores[trait];
            const average = values.reduce((sum, val) => sum + val, 0) / values.length;
            traits[trait] = {
                score: Math.round(average),
                percentage: Math.round((average / 5) * 100),
                values: values
            };
        });

        // Generate insights using AI or local algorithm
        const insights = await this.generateInsights(traits);

        return {
            id: this.generateResultId(),
            quizId: this.currentQuiz.id,
            quizType: this.currentQuiz.type,
            quizTitle: this.currentQuiz.data.title,
            traits: traits,
            insights: insights,
            completedAt: new Date().toISOString(),
            totalTime: Date.now() - this.startTime,
            answers: this.answers,
            timeSpent: this.timeSpent,
            metadata: {
                questionsCount: this.getTotalQuestions(),
                averageTimePerQuestion: this.getAverageTimePerQuestion()
            }
        };
    }

    /**
     * Generate insights from traits
     */
    async generateInsights(traits) {
        try {
            // Try AI-powered insights first
            if (window.PSAPI) {
                return await window.PSAPI.analyzePersonality(this.answers, this.currentQuiz.type);
            }
        } catch (error) {
            console.warn('AI insights failed, using fallback:', error);
        }

        // Fallback to local insights generation
        return this.generateLocalInsights(traits);
    }

    /**
     * Generate local insights (fallback)
     */
    generateLocalInsights(traits) {
        const sortedTraits = Object.entries(traits)
            .sort(([,a], [,b]) => b.score - a.score)
            .slice(0, 3);

        const insights = {
            summary: this.generateSummary(sortedTraits),
            strengths: this.generateStrengths(traits),
            growthAreas: this.generateGrowthAreas(traits),
            recommendations: this.generateRecommendations(traits)
        };

        return insights;
    }

    /**
     * Generate personality summary
     */
    generateSummary(topTraits) {
        const traitNames = topTraits.map(([trait]) => this.formatTraitName(trait));
        return `Based on your responses, you show strong tendencies toward ${traitNames.join(', ')}. Your personality profile suggests a unique blend of characteristics that influence how you interact with the world.`;
    }

    /**
     * Generate strengths list
     */
    generateStrengths(traits) {
        const strengths = [];
        
        Object.entries(traits).forEach(([trait, data]) => {
            if (data.score >= 4) {
                const strengthText = this.getStrengthText(trait, data.percentage);
                if (strengthText) {
                    strengths.push(strengthText);
                }
            }
        });

        return strengths.length > 0 ? strengths : ['Your balanced personality allows you to adapt to various situations effectively'];
    }

    /**
     * Generate growth areas
     */
    generateGrowthAreas(traits) {
        const growthAreas = [];
        
        Object.entries(traits).forEach(([trait, data]) => {
            if (data.score <= 2) {
                const growthText = this.getGrowthText(trait);
                if (growthText) {
                    growthAreas.push(growthText);
                }
            }
        });

        return growthAreas;
    }

    /**
     * Generate recommendations
     */
    generateRecommendations(traits) {
        const recommendations = [
            'Use your personality insights to choose environments that align with your natural tendencies',
            'Consider how your traits affect your relationships and communication style',
            'Leverage your strengths while being mindful of potential blind spots'
        ];

        return recommendations;
    }

    /**
     * Exit quiz with confirmation
     */
    exitQuiz() {
        if (!this.isActive) {
            return;
        }

        const hasAnswers = this.answers.some(answer => answer !== undefined);
        
        if (hasAnswers) {
            const confirmExit = confirm('Are you sure you want to exit? Your progress will be saved.');
            if (!confirmExit) {
                return;
            }
            
            // Save progress before exiting
            this.saveProgress();
        }

        // Track abandonment
        if (window.PSAnalytics) {
            window.PSAnalytics.trackQuizAbandon(
                this.currentQuiz.type,
                this.currentQuiz.id,
                this.currentQuestion + 1,
                this.getTotalQuestions()
            );
        }

        this.isActive = false;
        this.stopAutoSave();
        
        // Navigate back to quizzes
        if (window.PSNavigation) {
            window.PSNavigation.navigateToPage('quizzes');
        }
    }

    /**
     * Update progress indicators
     */
    updateProgress() {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');

        if (progressFill && progressText) {
            const progress = ((this.currentQuestion + 1) / this.getTotalQuestions()) * 100;
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `Question ${this.currentQuestion + 1} of ${this.getTotalQuestions()}`;
        }
    }

    /**
     * Update navigation buttons
     */
    updateNavigationButtons() {
        const prevBtn = document.getElementById('quiz-prev-btn');
        const nextBtn = document.getElementById('quiz-next-btn');

        if (prevBtn) {
            prevBtn.disabled = !this.canGoPrevious();
        }

        if (nextBtn) {
            const hasAnswer = this.answers[this.currentQuestion] !== undefined;
            nextBtn.disabled = !hasAnswer;
            
            if (this.currentQuestion === this.getTotalQuestions() - 1) {
                nextBtn.textContent = 'Finish Quiz';
                nextBtn.classList.add('btn-success');
            } else {
                nextBtn.textContent = 'Next';
                nextBtn.classList.remove('btn-success');
            }
        }
    }

    /**
     * Check if can go to next question
     */
    canGoNext() {
        return this.answers[this.currentQuestion] !== undefined;
    }

    /**
     * Check if can go to previous question
     */
    canGoPrevious() {
        return this.currentQuestion > 0 || this.questionHistory.length > 0;
    }

    /**
     * Get current question object
     */
    getCurrentQuestion() {
        if (!this.currentQuiz || !this.currentQuiz.data.questions) {
            return null;
        }
        return this.currentQuiz.data.questions[this.currentQuestion];
    }

    /**
     * Get total number of questions
     */
    getTotalQuestions() {
        if (!this.currentQuiz || !this.currentQuiz.data.questions) {
            return 0;
        }
        return this.currentQuiz.data.questions.length;
    }

    /**
     * Utility methods
     */
    generateQuizId() {
        return 'quiz_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateResultId() {
        return 'result_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    formatTraitName(trait) {
        return trait.charAt(0).toUpperCase() + trait.slice(1).replace(/_/g, ' ');
    }

    shouldAutoAdvance() {
        return this.currentQuiz?.data?.autoAdvance || false;
    }

    getAverageTimePerQuestion() {
        if (this.timeSpent.length === 0) return 0;
        return this.timeSpent.reduce((sum, time) => sum + time, 0) / this.timeSpent.length;
    }

    // Additional helper methods for UI and functionality...
    
    /**
     * Auto-save functionality
     */
    startAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            this.saveProgress();
        }, 30000); // Save every 30 seconds
    }

    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }

    saveProgress() {
        if (window.PSStorage && this.currentQuiz) {
            const progress = {
                quizId: this.currentQuiz.id,
                currentQuestion: this.currentQuestion,
                answers: this.answers,
                startTime: this.startTime,
                lastSaved: Date.now()
            };
            
            window.PSStorage.setItem('quiz-progress', progress);
        }
    }

    restoreProgress() {
        if (window.PSStorage) {
            const progress = window.PSStorage.getItem('quiz-progress');
            if (progress && progress.quizId === this.currentQuiz?.id) {
                this.currentQuestion = progress.currentQuestion;
                this.answers = progress.answers || [];
                this.startTime = progress.startTime;
                return true;
            }
        }
        return false;
    }

    restoreAnswer() {
        const answer = this.answers[this.currentQuestion];
        if (answer) {
            this.updateOptionSelection(answer.optionIndex);
        }
    }

    animateQuestionEntrance() {
        const questionElement = document.querySelector('.quiz-question');
        if (questionElement) {
            questionElement.style.opacity = '0';
            questionElement.style.transform = 'translateX(30px)';
            
            requestAnimationFrame(() => {
                questionElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                questionElement.style.opacity = '1';
                questionElement.style.transform = 'translateX(0)';
            });
        }
    }

    toggleHint() {
        const hintToggle = document.querySelector('.hint-toggle');
        const hintContent = document.querySelector('.hint-content');
        
        if (hintToggle && hintContent) {
            const isExpanded = hintToggle.getAttribute('aria-expanded') === 'true';
            hintToggle.setAttribute('aria-expanded', !isExpanded);
            hintContent.hidden = isExpanded;
            
            // Track hint usage
            if (window.PSAnalytics && !isExpanded) {
                window.PSAnalytics.trackEvent('quiz_hint_used', {
                    quizType: this.currentQuiz.type,
                    questionId: this.getCurrentQuestion()?.id
                });
            }
        }
    }

    pauseTimer() {
        // Pause any active timers
        this.isPaused = true;
    }

    resumeTimer() {
        // Resume timers
        this.isPaused = false;
        this.questionStartTime = Date.now(); // Reset question timer
    }

    showError(message) {
        if (window.app && window.app.showToast) {
            window.app.showToast(message, 'error');
        } else {
            alert(message);
        }
    }

    saveResults(results) {
        if (window.PSStorage) {
            window.PSStorage.saveQuizResult(results);
        }
    }

    getStrengthText(trait, percentage) {
        const strengthTexts = {
            extraversion: `Strong social skills and ability to energize groups (${percentage}%)`,
            agreeableness: `Excellent at building relationships and working collaboratively (${percentage}%)`,
            conscientiousness: `Reliable, organized, and excellent at achieving goals (${percentage}%)`,
            openness: `Creative, curious, and adaptable to new situations (${percentage}%)`,
            leadership: `Natural leadership abilities and decision-making skills (${percentage}%)`,
            creativity: `Strong creative thinking and innovative problem-solving (${percentage}%)`
        };
        
        return strengthTexts[trait];
    }

    getGrowthText(trait) {
        const growthTexts = {
            extraversion: 'Consider stepping out of your comfort zone in social situations',
            agreeableness: 'Practice empathy and collaborative approaches in relationships',
            conscientiousness: 'Develop better organizational systems and goal-setting practices',
            openness: 'Try new experiences and be more open to different perspectives',
            leadership: 'Look for opportunities to take on leadership roles and responsibilities',
            creativity: 'Engage in creative activities to develop your innovative thinking'
        };
        
        return growthTexts[trait];
    }
}

// Create global instance
const quizManager = new QuizManager();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.PSQuiz = quizManager;
}

// Export class for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuizManager;
}