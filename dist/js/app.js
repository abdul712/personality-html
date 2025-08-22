/**
 * PersonalitySpark - Main Application
 * Handles app initialization, routing, and core functionality
 */

class PersonalitySparkApp {
    constructor() {
        this.currentPage = 'home';
        this.currentQuiz = null;
        this.quizData = null;
        this.currentQuestion = 0;
        this.answers = [];
        this.isInitialized = false;
        
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('🚀 Initializing PersonalitySpark...');
            
            // Show loading screen
            this.showLoadingScreen();
            
            // Initialize components in order
            await this.initializeTheme();
            await this.initializeNavigation();
            await this.initializeEventListeners();
            await this.initializeServiceWorker();
            await this.loadInitialData();
            
            // Hide loading screen
            setTimeout(() => {
                this.hideLoadingScreen();
                this.isInitialized = true;
                console.log('✅ PersonalitySpark initialized successfully!');
            }, 1500);
            
        } catch (error) {
            console.error('❌ Failed to initialize PersonalitySpark:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Show loading screen
     */
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
    }

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            // Remove from DOM after animation
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 300);
        }
    }

    /**
     * Initialize theme system
     */
    async initializeTheme() {
        // Check for saved theme preference or default to light
        const savedTheme = localStorage.getItem('personality-spark-theme') || 'light';
        this.setTheme(savedTheme);
        
        // Theme toggle button
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                this.setTheme(newTheme);
            });
        }
    }

    /**
     * Set theme
     */
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('personality-spark-theme', theme);
        
        // Update theme toggle icon
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
        }
    }

    /**
     * Initialize navigation system
     */
    async initializeNavigation() {
        // Navigation links
        const navLinks = document.querySelectorAll('.nav-link[data-page]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.navigateToPage(page);
            });
        });

        // Footer links
        const footerLinks = document.querySelectorAll('.footer-links a[data-page]');
        footerLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.navigateToPage(page);
            });
        });

        // Mobile navigation toggle
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.navigateToPage(e.state.page, false);
            }
        });

        // Set initial page from URL hash
        const hash = window.location.hash.substring(1);
        if (hash && this.isValidPage(hash)) {
            this.currentPage = hash;
        }
    }

    /**
     * Initialize event listeners
     */
    async initializeEventListeners() {
        // Quiz start buttons
        const startQuizButtons = document.querySelectorAll('#start-quiz-btn, #hero-start-quiz, #cta-start-quiz');
        startQuizButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.navigateToPage('quizzes');
            });
        });

        // Daily quiz button
        const dailyQuizBtn = document.getElementById('hero-daily-quiz');
        if (dailyQuizBtn) {
            dailyQuizBtn.addEventListener('click', () => {
                this.startQuiz('daily');
            });
        }

        // Quiz type buttons
        const quizTypeButtons = document.querySelectorAll('.quiz-type-btn');
        quizTypeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.quiz-type-card');
                if (card) {
                    const quizType = card.getAttribute('data-quiz-type');
                    this.startQuiz(quizType);
                }
            });
        });

        // Quiz navigation
        const quizPrevBtn = document.getElementById('quiz-prev-btn');
        const quizNextBtn = document.getElementById('quiz-next-btn');
        const quizExitBtn = document.getElementById('quiz-exit-btn');

        if (quizPrevBtn) {
            quizPrevBtn.addEventListener('click', () => this.previousQuestion());
        }
        if (quizNextBtn) {
            quizNextBtn.addEventListener('click', () => this.nextQuestion());
        }
        if (quizExitBtn) {
            quizExitBtn.addEventListener('click', () => this.exitQuiz());
        }

        // Results actions
        const shareResultsBtn = document.getElementById('share-results-btn');
        const retakeQuizBtn = document.getElementById('retake-quiz-btn');
        const downloadResultsBtn = document.getElementById('download-results-btn');

        if (shareResultsBtn) {
            shareResultsBtn.addEventListener('click', () => this.shareResults());
        }
        if (retakeQuizBtn) {
            retakeQuizBtn.addEventListener('click', () => this.navigateToPage('quizzes'));
        }
        if (downloadResultsBtn) {
            downloadResultsBtn.addEventListener('click', () => this.downloadResults());
        }

        // Contact form
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactForm(e));
        }

        // Quiz search
        const quizSearchBtn = document.getElementById('quiz-search-btn');
        const quizSearchInput = document.getElementById('quiz-search-input');
        
        if (quizSearchBtn && quizSearchInput) {
            quizSearchBtn.addEventListener('click', () => this.searchQuizzes());
            quizSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchQuizzes();
                }
            });
        }

        // Quiz filters
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const category = e.target.getAttribute('data-category');
                this.filterQuizzes(category);
            });
        });

        // Modal handlers
        this.initializeModals();

        // Animate stats on hero section
        this.animateStats();

        // Scroll effects
        this.initializeScrollEffects();
    }

    /**
     * Initialize Service Worker
     */
    async initializeServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker registered:', registration.scope);
            } catch (error) {
                console.warn('⚠️ Service Worker registration failed:', error);
            }
        }
    }

    /**
     * Load initial data
     */
    async loadInitialData() {
        try {
            // Load quiz categories and populate quiz grid
            await this.loadQuizCategories();
            
            // Load any saved user data
            this.loadUserData();
            
        } catch (error) {
            console.warn('⚠️ Failed to load initial data:', error);
        }
    }

    /**
     * Navigate to a specific page
     */
    navigateToPage(page, updateHistory = true) {
        if (!this.isValidPage(page)) {
            console.warn(`Invalid page: ${page}`);
            return;
        }

        // Hide all pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(p => p.classList.remove('active'));

        // Show target page
        const targetPage = document.getElementById(`${page}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            
            // Update navigation
            this.updateNavigation(page);
            
            // Update current page
            this.currentPage = page;
            
            // Update browser history
            if (updateHistory) {
                const title = this.getPageTitle(page);
                const url = `#${page}`;
                history.pushState({ page }, title, url);
                document.title = title;
            }

            // Page-specific initialization
            this.initializePage(page);

            // Close mobile menu if open
            const navMenu = document.getElementById('nav-menu');
            const navToggle = document.getElementById('nav-toggle');
            if (navMenu && navToggle) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    /**
     * Check if page is valid
     */
    isValidPage(page) {
        const validPages = ['home', 'quizzes', 'quiz', 'results', 'about', 'contact'];
        return validPages.includes(page);
    }

    /**
     * Get page title
     */
    getPageTitle(page) {
        const titles = {
            home: 'PersonalitySpark - Discover Your True Personality',
            quizzes: 'Personality Quizzes - PersonalitySpark',
            quiz: 'Take Quiz - PersonalitySpark',
            results: 'Your Results - PersonalitySpark',
            about: 'About Us - PersonalitySpark',
            contact: 'Contact - PersonalitySpark'
        };
        return titles[page] || 'PersonalitySpark';
    }

    /**
     * Update navigation active states
     */
    updateNavigation(page) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === page) {
                link.classList.add('active');
            }
        });
    }

    /**
     * Initialize page-specific functionality
     */
    initializePage(page) {
        switch (page) {
            case 'quizzes':
                this.initializeQuizzesPage();
                break;
            case 'quiz':
                this.initializeQuizPage();
                break;
            case 'results':
                this.initializeResultsPage();
                break;
            case 'about':
                this.initializeAboutPage();
                break;
            case 'contact':
                this.initializeContactPage();
                break;
        }
    }

    /**
     * Initialize quizzes page
     */
    initializeQuizzesPage() {
        this.populateQuizGrid();
    }

    /**
     * Initialize quiz page
     */
    initializeQuizPage() {
        if (this.quizData) {
            this.renderCurrentQuestion();
        }
    }

    /**
     * Initialize results page
     */
    initializeResultsPage() {
        // Results will be rendered when quiz is completed
    }

    /**
     * Initialize about page
     */
    initializeAboutPage() {
        // Add any about page specific functionality
    }

    /**
     * Initialize contact page
     */
    initializeContactPage() {
        // Contact form is already initialized in event listeners
    }

    /**
     * Start a quiz
     */
    async startQuiz(quizType) {
        try {
            this.showToast('Loading quiz...', 'info');
            
            // Generate quiz data
            this.quizData = await this.generateQuizData(quizType);
            this.currentQuiz = quizType;
            this.currentQuestion = 0;
            this.answers = [];
            
            // Navigate to quiz page
            this.navigateToPage('quiz');
            
        } catch (error) {
            console.error('Failed to start quiz:', error);
            this.showToast('Failed to load quiz. Please try again.', 'error');
        }
    }

    /**
     * Generate quiz data (mock implementation)
     */
    async generateQuizData(quizType) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const quizTemplates = {
            big5: {
                title: 'Big 5 Personality Assessment',
                description: 'Discover your personality across five major dimensions',
                questions: this.generateBig5Questions()
            },
            daily: {
                title: 'Daily Personality Challenge',
                description: 'Today\'s quick personality insight',
                questions: this.generateDailyQuestions()
            },
            quick: {
                title: 'Quick Personality Assessment',
                description: 'Fast insights about your personality',
                questions: this.generateQuickQuestions()
            },
            thisorthat: {
                title: 'This or That Personality Test',
                description: 'Choose your preferences to reveal your personality',
                questions: this.generateThisOrThatQuestions()
            },
            mood: {
                title: 'Mood-Based Personality Test',
                description: 'How your mood influences your personality',
                questions: this.generateMoodQuestions()
            },
            career: {
                title: 'Career Match Personality Test',
                description: 'Find careers that match your personality',
                questions: this.generateCareerQuestions()
            }
        };

        return quizTemplates[quizType] || quizTemplates.quick;
    }

    /**
     * Generate Big 5 questions
     */
    generateBig5Questions() {
        return [
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
            },
            {
                id: 4,
                text: "I see myself as someone who is depressed, blue",
                options: [
                    { text: "Disagree strongly", value: { neuroticism: 1 } },
                    { text: "Disagree a little", value: { neuroticism: 2 } },
                    { text: "Neither agree nor disagree", value: { neuroticism: 3 } },
                    { text: "Agree a little", value: { neuroticism: 4 } },
                    { text: "Agree strongly", value: { neuroticism: 5 } }
                ]
            },
            {
                id: 5,
                text: "I see myself as someone who is original, comes up with new ideas",
                options: [
                    { text: "Disagree strongly", value: { openness: 1 } },
                    { text: "Disagree a little", value: { openness: 2 } },
                    { text: "Neither agree nor disagree", value: { openness: 3 } },
                    { text: "Agree a little", value: { openness: 4 } },
                    { text: "Agree strongly", value: { openness: 5 } }
                ]
            },
            {
                id: 6,
                text: "I see myself as someone who is reserved",
                options: [
                    { text: "Disagree strongly", value: { extraversion: 5 } },
                    { text: "Disagree a little", value: { extraversion: 4 } },
                    { text: "Neither agree nor disagree", value: { extraversion: 3 } },
                    { text: "Agree a little", value: { extraversion: 2 } },
                    { text: "Agree strongly", value: { extraversion: 1 } }
                ]
            },
            {
                id: 7,
                text: "I see myself as someone who is helpful and unselfish with others",
                options: [
                    { text: "Disagree strongly", value: { agreeableness: 1 } },
                    { text: "Disagree a little", value: { agreeableness: 2 } },
                    { text: "Neither agree nor disagree", value: { agreeableness: 3 } },
                    { text: "Agree a little", value: { agreeableness: 4 } },
                    { text: "Agree strongly", value: { agreeableness: 5 } }
                ]
            },
            {
                id: 8,
                text: "I see myself as someone who can be somewhat careless",
                options: [
                    { text: "Disagree strongly", value: { conscientiousness: 5 } },
                    { text: "Disagree a little", value: { conscientiousness: 4 } },
                    { text: "Neither agree nor disagree", value: { conscientiousness: 3 } },
                    { text: "Agree a little", value: { conscientiousness: 2 } },
                    { text: "Agree strongly", value: { conscientiousness: 1 } }
                ]
            },
            {
                id: 9,
                text: "I see myself as someone who is relaxed, handles stress well",
                options: [
                    { text: "Disagree strongly", value: { neuroticism: 5 } },
                    { text: "Disagree a little", value: { neuroticism: 4 } },
                    { text: "Neither agree nor disagree", value: { neuroticism: 3 } },
                    { text: "Agree a little", value: { neuroticism: 2 } },
                    { text: "Agree strongly", value: { neuroticism: 1 } }
                ]
            },
            {
                id: 10,
                text: "I see myself as someone who is curious about many different things",
                options: [
                    { text: "Disagree strongly", value: { openness: 1 } },
                    { text: "Disagree a little", value: { openness: 2 } },
                    { text: "Neither agree nor disagree", value: { openness: 3 } },
                    { text: "Agree a little", value: { openness: 4 } },
                    { text: "Agree strongly", value: { openness: 5 } }
                ]
            }
        ];
    }

    /**
     * Generate daily questions
     */
    generateDailyQuestions() {
        const dailyQuestions = [
            {
                id: 1,
                text: "How do you prefer to start your day?",
                options: [
                    { text: "With a detailed plan", value: { planning: 5 } },
                    { text: "With flexibility for spontaneity", value: { spontaneity: 5 } },
                    { text: "With social interaction", value: { social: 5 } },
                    { text: "With quiet reflection", value: { introspection: 5 } }
                ]
            },
            {
                id: 2,
                text: "When facing a challenge, you typically:",
                options: [
                    { text: "Analyze it thoroughly first", value: { analytical: 5 } },
                    { text: "Jump in and figure it out as you go", value: { action_oriented: 5 } },
                    { text: "Seek advice from others", value: { collaborative: 5 } },
                    { text: "Take time to consider all options", value: { reflective: 5 } }
                ]
            },
            {
                id: 3,
                text: "Your ideal weekend activity would be:",
                options: [
                    { text: "Exploring a new place", value: { adventurous: 5 } },
                    { text: "Reading a good book at home", value: { contemplative: 5 } },
                    { text: "Hanging out with friends", value: { social: 5 } },
                    { text: "Working on a personal project", value: { independent: 5 } }
                ]
            },
            {
                id: 4,
                text: "When making decisions, you rely most on:",
                options: [
                    { text: "Logic and facts", value: { logical: 5 } },
                    { text: "Your intuition", value: { intuitive: 5 } },
                    { text: "Others' opinions", value: { collaborative: 5 } },
                    { text: "Past experiences", value: { experiential: 5 } }
                ]
            },
            {
                id: 5,
                text: "You feel most energized when:",
                options: [
                    { text: "Accomplishing tasks efficiently", value: { achievement: 5 } },
                    { text: "Connecting with people", value: { social: 5 } },
                    { text: "Learning something new", value: { curious: 5 } },
                    { text: "Having quiet time alone", value: { introspective: 5 } }
                ]
            }
        ];

        return dailyQuestions;
    }

    /**
     * Generate quick questions
     */
    generateQuickQuestions() {
        return [
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
            },
            {
                id: 3,
                text: "Your approach to new experiences is:",
                options: [
                    { text: "Bring them on! I love novelty", value: { openness: 5 } },
                    { text: "I'm open but prefer some familiarity", value: { openness: 3 } },
                    { text: "I like to research before trying", value: { cautiousness: 5 } },
                    { text: "I prefer sticking to what I know", value: { traditional: 5 } }
                ]
            },
            {
                id: 4,
                text: "When working in a team, you usually:",
                options: [
                    { text: "Take charge and organize", value: { leadership: 5 } },
                    { text: "Contribute ideas and support others", value: { collaborative: 5 } },
                    { text: "Focus on your assigned tasks", value: { task_focused: 5 } },
                    { text: "Prefer to work independently", value: { independent: 5 } }
                ]
            },
            {
                id: 5,
                text: "Your ideal work environment would be:",
                options: [
                    { text: "Fast-paced and dynamic", value: { dynamic: 5 } },
                    { text: "Structured and organized", value: { structured: 5 } },
                    { text: "Creative and flexible", value: { creative: 5 } },
                    { text: "Quiet and focused", value: { contemplative: 5 } }
                ]
            }
        ];
    }

    /**
     * Generate This or That questions
     */
    generateThisOrThatQuestions() {
        return [
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
            },
            {
                id: 3,
                text: "Netflix or Books?",
                options: [
                    { text: "Netflix 📺", value: { entertainment: 5, visual: 3 } },
                    { text: "Books 📚", value: { intellectual: 5, imaginative: 3 } }
                ]
            },
            {
                id: 4,
                text: "Early Bird or Night Owl?",
                options: [
                    { text: "Early Bird 🌅", value: { disciplined: 5, morning_person: 5 } },
                    { text: "Night Owl 🦉", value: { creative: 5, night_person: 5 } }
                ]
            },
            {
                id: 5,
                text: "Cats or Dogs?",
                options: [
                    { text: "Cats 🐱", value: { independent: 5, mysterious: 3 } },
                    { text: "Dogs 🐕", value: { loyal: 5, social: 3 } }
                ]
            },
            {
                id: 6,
                text: "Planning or Spontaneity?",
                options: [
                    { text: "Planning 📅", value: { organized: 5, cautious: 3 } },
                    { text: "Spontaneity ✨", value: { flexible: 5, adventurous: 3 } }
                ]
            },
            {
                id: 7,
                text: "City or Countryside?",
                options: [
                    { text: "City 🏙️", value: { energetic: 5, ambitious: 3 } },
                    { text: "Countryside 🌾", value: { peaceful: 5, nature_loving: 3 } }
                ]
            },
            {
                id: 8,
                text: "Texting or Calling?",
                options: [
                    { text: "Texting 💬", value: { thoughtful: 5, introverted: 3 } },
                    { text: "Calling ☎️", value: { expressive: 5, extraverted: 3 } }
                ]
            }
            // Add more questions as needed
        ];
    }

    /**
     * Generate mood questions
     */
    generateMoodQuestions() {
        return [
            {
                id: 1,
                text: "How would you describe your current mood?",
                options: [
                    { text: "Energetic and optimistic", value: { positive_mood: 5, high_energy: 5 } },
                    { text: "Calm and content", value: { peaceful_mood: 5, balanced_energy: 3 } },
                    { text: "Focused and determined", value: { goal_oriented: 5, medium_energy: 4 } },
                    { text: "Reflective and contemplative", value: { introspective_mood: 5, low_energy: 2 } }
                ]
            },
            {
                id: 2,
                text: "When you're in a good mood, you tend to:",
                options: [
                    { text: "Share your joy with others", value: { expressive: 5, social: 5 } },
                    { text: "Take on new challenges", value: { ambitious: 5, confident: 5 } },
                    { text: "Be more creative and imaginative", value: { creative: 5, open: 5 } },
                    { text: "Feel more generous and helpful", value: { altruistic: 5, caring: 5 } }
                ]
            },
            {
                id: 3,
                text: "How do you typically handle bad moods?",
                options: [
                    { text: "Talk to friends or family", value: { social_support: 5, expressive: 3 } },
                    { text: "Exercise or do physical activities", value: { active_coping: 5, physical: 3 } },
                    { text: "Listen to music or watch movies", value: { artistic_coping: 5, escapist: 3 } },
                    { text: "Journal or spend time in nature", value: { reflective_coping: 5, introspective: 3 } }
                ]
            },
            {
                id: 4,
                text: "Your mood is most influenced by:",
                options: [
                    { text: "The people around you", value: { socially_influenced: 5, empathetic: 3 } },
                    { text: "Your accomplishments and goals", value: { achievement_focused: 5, self_driven: 3 } },
                    { text: "Your environment and surroundings", value: { environmentally_sensitive: 5, aesthetic: 3 } },
                    { text: "Your thoughts and internal state", value: { internally_driven: 5, self_aware: 3 } }
                ]
            },
            {
                id: 5,
                text: "When you're feeling stressed, you're more likely to:",
                options: [
                    { text: "Become more organized and systematic", value: { structured_stress: 5, control_seeking: 3 } },
                    { text: "Seek comfort from others", value: { social_stress: 5, support_seeking: 3 } },
                    { text: "Become more withdrawn and quiet", value: { introverted_stress: 5, self_protective: 3 } },
                    { text: "Look for distractions and fun activities", value: { avoidant_stress: 5, pleasure_seeking: 3 } }
                ]
            }
        ];
    }

    /**
     * Generate career questions
     */
    generateCareerQuestions() {
        return [
            {
                id: 1,
                text: "In your ideal work day, you would spend most time:",
                options: [
                    { text: "Collaborating with team members", value: { teamwork: 5, social: 4 } },
                    { text: "Analyzing data and solving problems", value: { analytical: 5, detail_oriented: 4 } },
                    { text: "Creating and designing new things", value: { creative: 5, innovative: 4 } },
                    { text: "Leading and making decisions", value: { leadership: 5, decisive: 4 } }
                ]
            },
            {
                id: 2,
                text: "What motivates you most at work?",
                options: [
                    { text: "Making a positive impact on others", value: { service_oriented: 5, altruistic: 4 } },
                    { text: "Achieving challenging goals", value: { achievement_oriented: 5, competitive: 4 } },
                    { text: "Learning and growing professionally", value: { growth_oriented: 5, curious: 4 } },
                    { text: "Having autonomy and flexibility", value: { independence: 5, self_directed: 4 } }
                ]
            },
            {
                id: 3,
                text: "Your preferred work environment is:",
                options: [
                    { text: "Fast-paced and dynamic", value: { high_energy: 5, adaptable: 4 } },
                    { text: "Stable and predictable", value: { security_oriented: 5, routine_loving: 4 } },
                    { text: "Intellectually stimulating", value: { intellectual: 5, knowledge_seeking: 4 } },
                    { text: "People-focused and collaborative", value: { interpersonal: 5, team_oriented: 4 } }
                ]
            },
            {
                id: 4,
                text: "When facing a work challenge, you prefer to:",
                options: [
                    { text: "Research thoroughly before acting", value: { research_oriented: 5, cautious: 3 } },
                    { text: "Brainstorm creative solutions", value: { innovative: 5, creative: 3 } },
                    { text: "Consult with colleagues", value: { collaborative: 5, social: 3 } },
                    { text: "Take immediate action", value: { action_oriented: 5, decisive: 3 } }
                ]
            },
            {
                id: 5,
                text: "Success at work means:",
                options: [
                    { text: "Recognition and advancement", value: { ambitious: 5, status_oriented: 3 } },
                    { text: "Work-life balance and satisfaction", value: { balanced: 5, value_oriented: 3 } },
                    { text: "Mastery of skills and expertise", value: { competence_oriented: 5, perfectionist: 3 } },
                    { text: "Positive relationships with colleagues", value: { relationship_oriented: 5, harmonious: 3 } }
                ]
            }
        ];
    }

    /**
     * Render current question
     */
    renderCurrentQuestion() {
        if (!this.quizData || this.currentQuestion >= this.quizData.questions.length) {
            return;
        }

        const question = this.quizData.questions[this.currentQuestion];
        const quizContent = document.getElementById('quiz-content');
        
        if (!quizContent) return;

        quizContent.innerHTML = `
            <div class="quiz-question">
                <div class="question-number">Question ${this.currentQuestion + 1} of ${this.quizData.questions.length}</div>
                <h2 class="question-text">${question.text}</h2>
                <div class="question-options">
                    ${question.options.map((option, index) => `
                        <button class="option-button" data-option-index="${index}">
                            ${option.text}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        // Add event listeners to option buttons
        const optionButtons = quizContent.querySelectorAll('.option-button');
        optionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.selectOption(parseInt(e.target.getAttribute('data-option-index')));
            });
        });

        // Update progress
        this.updateQuizProgress();

        // Update navigation buttons
        this.updateQuizNavigation();
    }

    /**
     * Select an option
     */
    selectOption(optionIndex) {
        const question = this.quizData.questions[this.currentQuestion];
        const selectedOption = question.options[optionIndex];

        // Store answer
        this.answers[this.currentQuestion] = {
            questionId: question.id,
            optionIndex: optionIndex,
            value: selectedOption.value
        };

        // Update UI
        const optionButtons = document.querySelectorAll('.option-button');
        optionButtons.forEach((button, index) => {
            button.classList.remove('selected');
            if (index === optionIndex) {
                button.classList.add('selected');
            }
        });

        // Enable next button
        const nextBtn = document.getElementById('quiz-next-btn');
        if (nextBtn) {
            nextBtn.disabled = false;
        }
    }

    /**
     * Go to next question
     */
    nextQuestion() {
        if (this.currentQuestion < this.quizData.questions.length - 1) {
            this.currentQuestion++;
            this.renderCurrentQuestion();
        } else {
            // Quiz completed
            this.completeQuiz();
        }
    }

    /**
     * Go to previous question
     */
    previousQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.renderCurrentQuestion();
        }
    }

    /**
     * Update quiz progress
     */
    updateQuizProgress() {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        if (progressFill && progressText) {
            const progress = ((this.currentQuestion + 1) / this.quizData.questions.length) * 100;
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `Question ${this.currentQuestion + 1} of ${this.quizData.questions.length}`;
        }
    }

    /**
     * Update quiz navigation buttons
     */
    updateQuizNavigation() {
        const prevBtn = document.getElementById('quiz-prev-btn');
        const nextBtn = document.getElementById('quiz-next-btn');

        if (prevBtn) {
            prevBtn.disabled = this.currentQuestion === 0;
        }

        if (nextBtn) {
            const hasAnswer = this.answers[this.currentQuestion] !== undefined;
            nextBtn.disabled = !hasAnswer;
            
            if (this.currentQuestion === this.quizData.questions.length - 1) {
                nextBtn.textContent = 'Finish Quiz';
            } else {
                nextBtn.textContent = 'Next';
            }
        }
    }

    /**
     * Complete quiz and calculate results
     */
    async completeQuiz() {
        try {
            this.showToast('Calculating your results...', 'info');

            // Calculate results
            const results = this.calculateResults();

            // Store results
            this.storeResults(results);

            // Navigate to results page
            this.navigateToPage('results');

            // Render results
            this.renderResults(results);

        } catch (error) {
            console.error('Failed to complete quiz:', error);
            this.showToast('Failed to calculate results. Please try again.', 'error');
        }
    }

    /**
     * Calculate quiz results
     */
    calculateResults() {
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
            traits[trait] = {
                score: Math.round(values.reduce((sum, val) => sum + val, 0) / values.length),
                percentage: Math.round((values.reduce((sum, val) => sum + val, 0) / values.length / 5) * 100)
            };
        });

        // Generate insights based on quiz type and scores
        const insights = this.generateInsights(traits);

        return {
            quizType: this.currentQuiz,
            quizTitle: this.quizData.title,
            traits: traits,
            insights: insights,
            completedAt: new Date().toISOString(),
            answers: this.answers
        };
    }

    /**
     * Generate insights based on results
     */
    generateInsights(traits) {
        const insights = {
            summary: '',
            strengths: [],
            growthAreas: [],
            recommendations: []
        };

        // Find top traits
        const sortedTraits = Object.entries(traits)
            .sort(([,a], [,b]) => b.score - a.score)
            .slice(0, 3);

        if (this.currentQuiz === 'big5') {
            insights.summary = this.generateBig5Summary(traits);
            insights.strengths = this.generateBig5Strengths(traits);
            insights.growthAreas = this.generateBig5GrowthAreas(traits);
            insights.recommendations = this.generateBig5Recommendations(traits);
        } else {
            // General insights for other quiz types
            insights.summary = `Based on your responses, you show strong tendencies toward ${sortedTraits.map(([trait]) => trait).join(', ')}. Your personality profile suggests a unique blend of characteristics that influence how you interact with the world.`;
            
            insights.strengths = sortedTraits.map(([trait, data]) => 
                `Your ${trait} nature (${data.percentage}%) is a key strength that helps you navigate various situations effectively.`
            );

            insights.growthAreas = Object.entries(traits)
                .filter(([,data]) => data.score < 3)
                .map(([trait]) => `Consider developing your ${trait} skills for a more balanced approach.`);

            insights.recommendations = [
                'Continue leveraging your natural strengths in personal and professional settings',
                'Consider exploring areas where you scored lower to develop a more well-rounded personality',
                'Use these insights to better understand your decision-making patterns and preferences'
            ];
        }

        return insights;
    }

    /**
     * Generate Big 5 specific insights
     */
    generateBig5Summary(traits) {
        const { extraversion, agreeableness, conscientiousness, neuroticism, openness } = traits;
        
        let summary = "Your personality profile reveals a unique combination of traits. ";
        
        if (extraversion && extraversion.score >= 4) {
            summary += "You tend to be outgoing and energetic in social situations. ";
        } else if (extraversion && extraversion.score <= 2) {
            summary += "You prefer quieter, more intimate social settings. ";
        }

        if (conscientiousness && conscientiousness.score >= 4) {
            summary += "You're naturally organized and goal-oriented. ";
        } else if (conscientiousness && conscientiousness.score <= 2) {
            summary += "You prefer flexibility and spontaneity in your approach. ";
        }

        if (openness && openness.score >= 4) {
            summary += "You're curious and open to new experiences. ";
        }

        return summary;
    }

    generateBig5Strengths(traits) {
        const strengths = [];
        
        Object.entries(traits).forEach(([trait, data]) => {
            if (data.score >= 4) {
                switch (trait) {
                    case 'extraversion':
                        strengths.push('Strong social skills and ability to energize groups');
                        break;
                    case 'agreeableness':
                        strengths.push('Excellent at building relationships and working collaboratively');
                        break;
                    case 'conscientiousness':
                        strengths.push('Reliable, organized, and excellent at achieving goals');
                        break;
                    case 'openness':
                        strengths.push('Creative, curious, and adaptable to new situations');
                        break;
                    case 'neuroticism':
                        if (data.score <= 2) {
                            strengths.push('Emotionally stable and resilient under pressure');
                        }
                        break;
                }
            }
        });

        return strengths.length > 0 ? strengths : ['Your balanced personality allows you to adapt to various situations effectively'];
    }

    generateBig5GrowthAreas(traits) {
        const growthAreas = [];
        
        Object.entries(traits).forEach(([trait, data]) => {
            if (data.score <= 2) {
                switch (trait) {
                    case 'extraversion':
                        growthAreas.push('Consider stepping out of your comfort zone in social situations');
                        break;
                    case 'agreeableness':
                        growthAreas.push('Practice empathy and collaborative approaches in relationships');
                        break;
                    case 'conscientiousness':
                        growthAreas.push('Develop better organizational systems and goal-setting practices');
                        break;
                    case 'openness':
                        growthAreas.push('Try new experiences and be more open to different perspectives');
                        break;
                }
            }
        });

        return growthAreas.length > 0 ? growthAreas : ['Continue developing your existing strengths while maintaining balance'];
    }

    generateBig5Recommendations(traits) {
        const recommendations = [
            'Use your personality insights to choose environments and roles that align with your natural tendencies',
            'Consider how your traits affect your relationships and communication style',
            'Leverage your strengths while being mindful of potential blind spots'
        ];

        // Add specific recommendations based on trait combinations
        if (traits.extraversion && traits.openness && traits.extraversion.score >= 4 && traits.openness.score >= 4) {
            recommendations.push('Your combination of extraversion and openness makes you well-suited for leadership and innovation roles');
        }

        if (traits.conscientiousness && traits.conscientiousness.score >= 4) {
            recommendations.push('Your high conscientiousness is valuable in roles requiring reliability and attention to detail');
        }

        return recommendations;
    }

    /**
     * Store results in localStorage
     */
    storeResults(results) {
        try {
            const existingResults = JSON.parse(localStorage.getItem('personality-spark-results') || '[]');
            existingResults.push(results);
            
            // Keep only the last 10 results
            if (existingResults.length > 10) {
                existingResults.splice(0, existingResults.length - 10);
            }
            
            localStorage.setItem('personality-spark-results', JSON.stringify(existingResults));
            localStorage.setItem('personality-spark-latest-result', JSON.stringify(results));
        } catch (error) {
            console.warn('Failed to store results:', error);
        }
    }

    /**
     * Render results on the results page
     */
    renderResults(results) {
        const resultsContent = document.getElementById('results-content');
        if (!resultsContent) return;

        const { traits, insights } = results;

        resultsContent.innerHTML = `
            <div class="result-card">
                <h3>🎯 Your Personality Summary</h3>
                <p class="result-summary">${insights.summary}</p>
            </div>

            <div class="result-card">
                <h3>📊 Trait Breakdown</h3>
                <div class="trait-bars">
                    ${Object.entries(traits).map(([trait, data]) => `
                        <div class="trait-bar">
                            <div class="trait-label">${this.formatTraitName(trait)}</div>
                            <div class="trait-progress">
                                <div class="trait-fill" style="width: ${data.percentage}%"></div>
                            </div>
                            <div class="trait-score">${data.percentage}%</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="result-card">
                <h3>💪 Your Strengths</h3>
                <ul class="insights-list">
                    ${insights.strengths.map(strength => `<li>${strength}</li>`).join('')}
                </ul>
            </div>

            ${insights.growthAreas.length > 0 ? `
                <div class="result-card">
                    <h3>🌱 Growth Opportunities</h3>
                    <ul class="insights-list">
                        ${insights.growthAreas.map(area => `<li>${area}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            <div class="result-card">
                <h3>🎯 Recommendations</h3>
                <ul class="insights-list">
                    ${insights.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        `;

        // Animate trait bars
        setTimeout(() => {
            const traitFills = resultsContent.querySelectorAll('.trait-fill');
            traitFills.forEach(fill => {
                const width = fill.style.width;
                fill.style.width = '0%';
                setTimeout(() => {
                    fill.style.width = width;
                }, 100);
            });
        }, 500);
    }

    /**
     * Format trait name for display
     */
    formatTraitName(trait) {
        const traitNames = {
            extraversion: 'Extraversion',
            agreeableness: 'Agreeableness',
            conscientiousness: 'Conscientiousness',
            neuroticism: 'Emotional Stability',
            openness: 'Openness',
            social: 'Social',
            analytical: 'Analytical',
            creative: 'Creative',
            leadership: 'Leadership',
            planning: 'Planning',
            spontaneity: 'Spontaneity',
            introspection: 'Introspection'
        };

        return traitNames[trait] || trait.charAt(0).toUpperCase() + trait.slice(1);
    }

    /**
     * Exit quiz
     */
    exitQuiz() {
        if (confirm('Are you sure you want to exit the quiz? Your progress will be lost.')) {
            this.currentQuiz = null;
            this.quizData = null;
            this.currentQuestion = 0;
            this.answers = [];
            this.navigateToPage('quizzes');
        }
    }

    /**
     * Share results
     */
    shareResults() {
        const latestResult = JSON.parse(localStorage.getItem('personality-spark-latest-result') || 'null');
        if (!latestResult) {
            this.showToast('No results to share', 'error');
            return;
        }

        if (navigator.share) {
            // Use Web Share API if available
            navigator.share({
                title: 'My PersonalitySpark Results',
                text: `I just discovered fascinating insights about my personality! Check out PersonalitySpark for AI-powered personality quizzes.`,
                url: window.location.origin
            }).catch(console.error);
        } else {
            // Fallback to custom share modal
            this.showShareModal(latestResult);
        }
    }

    /**
     * Show share modal
     */
    showShareModal(results) {
        const shareModal = document.getElementById('share-modal');
        const sharePreview = document.getElementById('share-preview');
        
        if (!shareModal || !sharePreview) return;

        // Generate share preview
        const topTraits = Object.entries(results.traits)
            .sort(([,a], [,b]) => b.score - a.score)
            .slice(0, 3)
            .map(([trait, data]) => `${this.formatTraitName(trait)} (${data.percentage}%)`)
            .join(', ');

        sharePreview.innerHTML = `
            <h3>🎯 My Personality Results</h3>
            <p><strong>Quiz:</strong> ${results.quizTitle}</p>
            <p><strong>Top Traits:</strong> ${topTraits}</p>
            <p>Discover your personality with AI-powered quizzes at PersonalitySpark!</p>
        `;

        // Show modal
        shareModal.classList.add('active');

        // Add share button handlers
        const shareButtons = shareModal.querySelectorAll('.share-btn');
        shareButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const platform = e.target.getAttribute('data-platform');
                this.shareToplatform(platform, results);
            });
        });
    }

    /**
     * Share to specific platform
     */
    shareToplatform(platform, results) {
        const shareText = `I just discovered fascinating insights about my personality! Check out PersonalitySpark for AI-powered personality quizzes.`;
        const shareUrl = window.location.origin;

        const urls = {
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
            copy: null
        };

        if (platform === 'copy') {
            // Copy link to clipboard
            navigator.clipboard.writeText(shareUrl).then(() => {
                this.showToast('Link copied to clipboard!', 'success');
                this.hideShareModal();
            }).catch(() => {
                this.showToast('Failed to copy link', 'error');
            });
        } else if (urls[platform]) {
            window.open(urls[platform], '_blank', 'width=600,height=400');
            this.hideShareModal();
        }
    }

    /**
     * Hide share modal
     */
    hideShareModal() {
        const shareModal = document.getElementById('share-modal');
        if (shareModal) {
            shareModal.classList.remove('active');
        }
    }

    /**
     * Download results
     */
    downloadResults() {
        const latestResult = JSON.parse(localStorage.getItem('personality-spark-latest-result') || 'null');
        if (!latestResult) {
            this.showToast('No results to download', 'error');
            return;
        }

        // Create downloadable content
        const content = this.formatResultsForDownload(latestResult);
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        // Create download link
        const a = document.createElement('a');
        a.href = url;
        a.download = `PersonalitySpark-Results-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast('Results downloaded!', 'success');
    }

    /**
     * Format results for download
     */
    formatResultsForDownload(results) {
        const { quizTitle, traits, insights, completedAt } = results;
        
        let content = `PersonalitySpark - Personality Assessment Results\n`;
        content += `=============================================\n\n`;
        content += `Quiz: ${quizTitle}\n`;
        content += `Completed: ${new Date(completedAt).toLocaleDateString()}\n\n`;
        
        content += `PERSONALITY SUMMARY:\n`;
        content += `${insights.summary}\n\n`;
        
        content += `TRAIT SCORES:\n`;
        Object.entries(traits).forEach(([trait, data]) => {
            content += `${this.formatTraitName(trait)}: ${data.percentage}%\n`;
        });
        content += `\n`;
        
        content += `STRENGTHS:\n`;
        insights.strengths.forEach((strength, index) => {
            content += `${index + 1}. ${strength}\n`;
        });
        content += `\n`;
        
        if (insights.growthAreas.length > 0) {
            content += `GROWTH OPPORTUNITIES:\n`;
            insights.growthAreas.forEach((area, index) => {
                content += `${index + 1}. ${area}\n`;
            });
            content += `\n`;
        }
        
        content += `RECOMMENDATIONS:\n`;
        insights.recommendations.forEach((rec, index) => {
            content += `${index + 1}. ${rec}\n`;
        });
        content += `\n`;
        
        content += `Generated by PersonalitySpark (${window.location.origin})\n`;
        
        return content;
    }

    /**
     * Load quiz categories and populate grid
     */
    async loadQuizCategories() {
        const quizCategories = [
            {
                id: 'big5',
                title: 'Big 5 Personality',
                description: 'Discover your personality across five major dimensions',
                duration: '10-15 min',
                questions: '30 questions',
                icon: '🏆',
                badge: 'Most Popular',
                category: 'personality'
            },
            {
                id: 'daily',
                title: 'Daily Personality Challenge',
                description: 'Quick daily quiz that explores different aspects of your personality',
                duration: '3-5 min',
                questions: '10 questions',
                icon: '📅',
                badge: 'Daily Challenge',
                category: 'daily'
            },
            {
                id: 'quick',
                title: 'Quick Assessment',
                description: 'Get instant personality insights with our rapid-fire assessment',
                duration: '2 min',
                questions: '5 questions',
                icon: '⚡',
                badge: 'Quick & Fun',
                category: 'quick'
            },
            {
                id: 'thisorthat',
                title: 'This or That',
                description: 'Make quick choices between options to reveal your personality',
                duration: '5 min',
                questions: '15 questions',
                icon: '🎯',
                badge: 'Choice Based',
                category: 'quick'
            },
            {
                id: 'mood',
                title: 'Mood-Based Test',
                description: 'Explore how your current mood influences your personality',
                duration: '7 min',
                questions: '20 questions',
                icon: '🌈',
                badge: 'Emotional',
                category: 'personality'
            },
            {
                id: 'career',
                title: 'Career Match',
                description: 'Discover which career paths align best with your personality',
                duration: '12 min',
                questions: '25 questions',
                icon: '💼',
                badge: 'Professional',
                category: 'career'
            }
        ];

        this.allQuizzes = quizCategories;
        this.populateQuizGrid(quizCategories);
    }

    /**
     * Populate quiz grid
     */
    populateQuizGrid(quizzes = this.allQuizzes) {
        const quizGrid = document.getElementById('quiz-grid');
        if (!quizGrid || !quizzes) return;

        quizGrid.innerHTML = quizzes.map(quiz => `
            <div class="quiz-type-card" data-quiz-type="${quiz.id}">
                <div class="quiz-type-header">
                    <div class="quiz-type-icon">${quiz.icon}</div>
                    <div class="quiz-type-badge">${quiz.badge}</div>
                </div>
                <h3 class="quiz-type-title">${quiz.title}</h3>
                <p class="quiz-type-description">${quiz.description}</p>
                <div class="quiz-type-meta">
                    <span class="quiz-duration">⏱️ ${quiz.duration}</span>
                    <span class="quiz-questions">📝 ${quiz.questions}</span>
                </div>
                <button class="btn btn-primary quiz-type-btn">Take Quiz</button>
            </div>
        `).join('');

        // Add event listeners to new quiz cards
        const quizCards = quizGrid.querySelectorAll('.quiz-type-card');
        quizCards.forEach(card => {
            const button = card.querySelector('.quiz-type-btn');
            button.addEventListener('click', () => {
                const quizType = card.getAttribute('data-quiz-type');
                this.startQuiz(quizType);
            });
        });
    }

    /**
     * Search quizzes
     */
    searchQuizzes() {
        const searchInput = document.getElementById('quiz-search-input');
        if (!searchInput || !this.allQuizzes) return;

        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            this.populateQuizGrid(this.allQuizzes);
            return;
        }

        const filteredQuizzes = this.allQuizzes.filter(quiz => 
            quiz.title.toLowerCase().includes(searchTerm) ||
            quiz.description.toLowerCase().includes(searchTerm) ||
            quiz.category.toLowerCase().includes(searchTerm)
        );

        this.populateQuizGrid(filteredQuizzes);

        if (filteredQuizzes.length === 0) {
            const quizGrid = document.getElementById('quiz-grid');
            quizGrid.innerHTML = `
                <div class="no-results">
                    <h3>No quizzes found</h3>
                    <p>Try searching for something else or browse all quizzes.</p>
                    <button class="btn btn-primary" onclick="app.clearSearch()">Show All Quizzes</button>
                </div>
            `;
        }
    }

    /**
     * Clear search
     */
    clearSearch() {
        const searchInput = document.getElementById('quiz-search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        this.populateQuizGrid(this.allQuizzes);
    }

    /**
     * Filter quizzes by category
     */
    filterQuizzes(category) {
        if (!this.allQuizzes) return;

        if (category === 'all') {
            this.populateQuizGrid(this.allQuizzes);
        } else {
            const filteredQuizzes = this.allQuizzes.filter(quiz => quiz.category === category);
            this.populateQuizGrid(filteredQuizzes);
        }
    }

    /**
     * Initialize modals
     */
    initializeModals() {
        // Share modal close button
        const shareModalClose = document.getElementById('share-modal-close');
        if (shareModalClose) {
            shareModalClose.addEventListener('click', () => this.hideShareModal());
        }

        // Close modal when clicking outside
        const shareModal = document.getElementById('share-modal');
        if (shareModal) {
            shareModal.addEventListener('click', (e) => {
                if (e.target === shareModal) {
                    this.hideShareModal();
                }
            });
        }

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideShareModal();
            }
        });
    }

    /**
     * Animate stats on scroll
     */
    animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number[data-count]');
        
        const animateNumber = (element, target) => {
            let current = 0;
            const increment = target / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                element.textContent = Math.floor(current).toLocaleString();
            }, 40);
        };

        // Intersection Observer to animate when in view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.getAttribute('data-count'));
                    animateNumber(entry.target, target);
                    observer.unobserve(entry.target);
                }
            });
        });

        statNumbers.forEach(stat => observer.observe(stat));
    }

    /**
     * Initialize scroll effects
     */
    initializeScrollEffects() {
        let lastScrollTop = 0;
        const header = document.getElementById('header');

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Hide/show header on scroll
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scrolling down
                header.classList.add('hidden');
            } else {
                // Scrolling up
                header.classList.remove('hidden');
            }
            
            lastScrollTop = scrollTop;
        });
    }

    /**
     * Handle contact form submission
     */
    handleContactForm(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        // Simulate form submission
        this.showToast('Thank you for your message! We\'ll get back to you soon.', 'success');
        e.target.reset();
    }

    /**
     * Load user data from localStorage
     */
    loadUserData() {
        try {
            const savedResults = localStorage.getItem('personality-spark-results');
            if (savedResults) {
                this.userResults = JSON.parse(savedResults);
            }
        } catch (error) {
            console.warn('Failed to load user data:', error);
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toastId = 'toast-' + Date.now();
        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️',
            warning: '⚠️'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.id = toastId;
        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-message">${message}</div>
            <button class="toast-close">×</button>
        `;

        toastContainer.appendChild(toast);

        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);

        // Auto remove after 5 seconds
        const autoRemove = setTimeout(() => this.hideToast(toastId), 5000);

        // Close button
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            clearTimeout(autoRemove);
            this.hideToast(toastId);
        });
    }

    /**
     * Hide toast notification
     */
    hideToast(toastId) {
        const toast = document.getElementById(toastId);
        if (toast) {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }

    /**
     * Handle initialization errors
     */
    handleInitializationError(error) {
        console.error('Initialization error:', error);
        this.hideLoadingScreen();
        this.showToast('Failed to initialize the application. Please refresh the page.', 'error');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PersonalitySparkApp();
});

// Handle errors gracefully
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    if (window.app) {
        window.app.showToast('An unexpected error occurred. Please refresh the page.', 'error');
    }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    if (window.app) {
        window.app.showToast('An unexpected error occurred. Please try again.', 'error');
    }
});

// Export for testing or external access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PersonalitySparkApp;
}