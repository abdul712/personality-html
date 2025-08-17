/**
 * PersonalitySpark - Navigation Component
 * Handles navigation logic and URL routing
 */

class NavigationManager {
    constructor() {
        this.currentPage = 'home';
        this.history = [];
        this.maxHistoryLength = 10;
        this.isNavigating = false;
        
        this.init();
    }

    /**
     * Initialize navigation manager
     */
    init() {
        this.setupEventListeners();
        this.handleInitialRoute();
        console.log('🧭 Navigation manager initialized');
    }

    /**
     * Set up navigation event listeners
     */
    setupEventListeners() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.page) {
                this.navigateToPage(event.state.page, false);
            } else {
                this.navigateToPage('home', false);
            }
        });

        // Handle hash changes
        window.addEventListener('hashchange', () => {
            this.handleHashNavigation();
        });

        // Handle navigation links
        document.addEventListener('click', (event) => {
            const navLink = event.target.closest('[data-page]');
            if (navLink) {
                event.preventDefault();
                const page = navLink.getAttribute('data-page');
                this.navigateToPage(page);
                
                // Track navigation
                if (window.PSAnalytics) {
                    window.PSAnalytics.trackNavigation(this.currentPage, page);
                }
            }
        });

        // Handle quiz navigation links
        document.addEventListener('click', (event) => {
            const quizLink = event.target.closest('[data-quiz]');
            if (quizLink) {
                event.preventDefault();
                const quizType = quizLink.getAttribute('data-quiz');
                this.navigateToQuiz(quizType);
            }
        });

        // Handle keyboard navigation
        document.addEventListener('keydown', (event) => {
            // Alt + Arrow keys for navigation
            if (event.altKey) {
                if (event.key === 'ArrowLeft') {
                    this.goBack();
                } else if (event.key === 'ArrowRight') {
                    this.goForward();
                }
            }
            
            // Escape key to go back
            if (event.key === 'Escape') {
                this.handleEscapeKey();
            }
        });
    }

    /**
     * Handle initial route from URL
     */
    handleInitialRoute() {
        const path = window.location.pathname;
        const hash = window.location.hash;
        
        if (hash && hash.length > 1) {
            const page = hash.substring(1);
            if (this.isValidPage(page)) {
                this.currentPage = page;
                return;
            }
        }
        
        // Handle direct URLs (if using history API routing)
        if (path !== '/') {
            const page = path.substring(1);
            if (this.isValidPage(page)) {
                this.currentPage = page;
                return;
            }
        }
        
        this.currentPage = 'home';
    }

    /**
     * Handle hash-based navigation
     */
    handleHashNavigation() {
        const hash = window.location.hash;
        if (hash && hash.length > 1) {
            const page = hash.substring(1);
            if (this.isValidPage(page)) {
                this.navigateToPage(page, false);
            }
        }
    }

    /**
     * Navigate to a specific page
     */
    navigateToPage(page, updateHistory = true, data = {}) {
        if (this.isNavigating || !this.isValidPage(page)) {
            return false;
        }

        this.isNavigating = true;
        
        try {
            // Add current page to history
            if (updateHistory && this.currentPage !== page) {
                this.addToHistory(this.currentPage);
            }

            // Hide all pages
            this.hideAllPages();

            // Show target page
            const targetPage = document.getElementById(`${page}-page`);
            if (!targetPage) {
                console.error(`Page element not found: ${page}-page`);
                this.isNavigating = false;
                return false;
            }

            targetPage.classList.add('active');

            // Update navigation state
            this.updateNavigationState(page);
            
            // Update URL and browser history
            if (updateHistory) {
                this.updateURL(page, data);
            }

            // Update page title
            this.updatePageTitle(page);

            // Initialize page-specific functionality
            this.initializePage(page, data);

            // Close mobile menu if open
            this.closeMobileMenu();

            // Scroll to top
            this.scrollToTop();

            // Update current page
            const previousPage = this.currentPage;
            this.currentPage = page;

            // Track page view
            if (window.PSAnalytics) {
                window.PSAnalytics.trackPageView({
                    page: page,
                    previousPage: previousPage,
                    data: data
                });
            }

            console.log(`🧭 Navigated to: ${page}`);
            return true;

        } catch (error) {
            console.error('Navigation error:', error);
            return false;
        } finally {
            this.isNavigating = false;
        }
    }

    /**
     * Navigate to quiz page with specific quiz type
     */
    navigateToQuiz(quizType) {
        return this.navigateToPage('quiz', true, { quizType });
    }

    /**
     * Navigate to results page with result data
     */
    navigateToResults(resultData) {
        return this.navigateToPage('results', true, { resultData });
    }

    /**
     * Go back to previous page
     */
    goBack() {
        if (this.history.length > 0) {
            const previousPage = this.history.pop();
            this.navigateToPage(previousPage, false);
            return true;
        }
        
        // If no history, go to home
        if (this.currentPage !== 'home') {
            this.navigateToPage('home');
            return true;
        }
        
        return false;
    }

    /**
     * Go forward (browser forward button)
     */
    goForward() {
        window.history.forward();
    }

    /**
     * Handle escape key navigation
     */
    handleEscapeKey() {
        // Close modals first
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            activeModal.classList.remove('active');
            return;
        }

        // Close mobile menu
        const mobileMenu = document.querySelector('.nav-menu.active');
        if (mobileMenu) {
            this.closeMobileMenu();
            return;
        }

        // Go back if not on home page
        if (this.currentPage !== 'home') {
            this.goBack();
        }
    }

    /**
     * Check if page name is valid
     */
    isValidPage(page) {
        const validPages = ['home', 'quizzes', 'quiz', 'results', 'about', 'contact', 'terms', 'privacy', 'cookies', 'disclaimer'];
        return validPages.includes(page);
    }

    /**
     * Hide all page elements
     */
    hideAllPages() {
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            page.classList.remove('active');
        });
    }

    /**
     * Update navigation state (active links, etc.)
     */
    updateNavigationState(page) {
        // Update navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === page) {
                link.classList.add('active');
            }
        });

        // Update breadcrumbs if present
        this.updateBreadcrumbs(page);
    }

    /**
     * Update breadcrumbs
     */
    updateBreadcrumbs(page) {
        const breadcrumbs = document.getElementById('breadcrumbs');
        if (!breadcrumbs) return;

        const breadcrumbMap = {
            home: [{ name: 'Home', page: 'home' }],
            quizzes: [
                { name: 'Home', page: 'home' },
                { name: 'Quizzes', page: 'quizzes' }
            ],
            quiz: [
                { name: 'Home', page: 'home' },
                { name: 'Quizzes', page: 'quizzes' },
                { name: 'Take Quiz', page: 'quiz' }
            ],
            results: [
                { name: 'Home', page: 'home' },
                { name: 'Results', page: 'results' }
            ],
            about: [
                { name: 'Home', page: 'home' },
                { name: 'About', page: 'about' }
            ],
            contact: [
                { name: 'Home', page: 'home' },
                { name: 'Contact', page: 'contact' }
            ],
            terms: [
                { name: 'Home', page: 'home' },
                { name: 'Terms of Service', page: 'terms' }
            ],
            privacy: [
                { name: 'Home', page: 'home' },
                { name: 'Privacy Policy', page: 'privacy' }
            ],
            cookies: [
                { name: 'Home', page: 'home' },
                { name: 'Cookie Policy', page: 'cookies' }
            ],
            disclaimer: [
                { name: 'Home', page: 'home' },
                { name: 'Disclaimer', page: 'disclaimer' }
            ]
        };

        const crumbs = breadcrumbMap[page] || [{ name: 'Home', page: 'home' }];
        
        breadcrumbs.innerHTML = crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            if (isLast) {
                return `<span class="breadcrumb-current">${crumb.name}</span>`;
            } else {
                return `<a href="#${crumb.page}" class="breadcrumb-link" data-page="${crumb.page}">${crumb.name}</a>`;
            }
        }).join(' <span class="breadcrumb-separator">›</span> ');
    }

    /**
     * Update URL in address bar
     */
    updateURL(page, data = {}) {
        const url = page === 'home' ? '/' : `/#${page}`;
        const title = this.getPageTitle(page);
        
        const state = {
            page: page,
            data: data,
            timestamp: Date.now()
        };

        // Only use pushState if not running from file:// protocol
        try {
            if (window.location.protocol !== 'file:') {
                history.pushState(state, title, url);
            } else {
                // For local file testing, just update the hash
                window.location.hash = `#${page}`;
            }
        } catch (error) {
            console.error('Navigation error:', error);
            // Fallback to hash-based navigation
            window.location.hash = `#${page}`;
        }
    }

    /**
     * Update page title
     */
    updatePageTitle(page) {
        document.title = this.getPageTitle(page);
    }

    /**
     * Get title for a page
     */
    getPageTitle(page) {
        const titles = {
            home: 'PersonalitySpark - Discover Your True Personality',
            quizzes: 'Personality Quizzes - PersonalitySpark',
            quiz: 'Take Quiz - PersonalitySpark',
            results: 'Your Results - PersonalitySpark',
            about: 'About Us - PersonalitySpark',
            contact: 'Contact - PersonalitySpark',
            terms: 'Terms of Service - PersonalitySpark',
            privacy: 'Privacy Policy - PersonalitySpark',
            cookies: 'Cookie Policy - PersonalitySpark',
            disclaimer: 'Disclaimer - PersonalitySpark'
        };
        return titles[page] || 'PersonalitySpark';
    }

    /**
     * Initialize page-specific functionality
     */
    initializePage(page, data = {}) {
        // Call page-specific initialization
        const initMethods = {
            home: () => this.initHomePage(data),
            quizzes: () => this.initQuizzesPage(data),
            quiz: () => this.initQuizPage(data),
            results: () => this.initResultsPage(data),
            about: () => this.initAboutPage(data),
            contact: () => this.initContactPage(data),
            terms: () => this.initLegalPage(data),
            privacy: () => this.initLegalPage(data),
            cookies: () => this.initLegalPage(data),
            disclaimer: () => this.initLegalPage(data)
        };

        if (initMethods[page]) {
            initMethods[page]();
        }

        // Focus management for accessibility
        this.manageFocus(page);
    }

    /**
     * Initialize home page
     */
    initHomePage(data) {
        // Set up intersection observer for stats animation
        this.setupStatsAnimation();
    }

    /**
     * Initialize quizzes page
     */
    initQuizzesPage(data) {
        // Initialize quiz filters and search
        this.setupQuizFilters();
        
        // Focus on search input if coming from search
        if (data.focusSearch) {
            const searchInput = document.getElementById('quiz-search-input');
            if (searchInput) {
                searchInput.focus();
            }
        }
    }

    /**
     * Initialize quiz page
     */
    initQuizPage(data) {
        if (data.quizType && window.app) {
            // Start the specified quiz
            window.app.startQuiz(data.quizType);
        }
    }

    /**
     * Initialize results page
     */
    initResultsPage(data) {
        if (data.resultData && window.app) {
            // Render the specified results
            window.app.renderResults(data.resultData);
        }
    }

    /**
     * Initialize about page
     */
    initAboutPage(data) {
        // No specific initialization needed
    }

    /**
     * Initialize contact page
     */
    initContactPage(data) {
        // Focus on name field
        const nameField = document.getElementById('contact-name');
        if (nameField) {
            setTimeout(() => nameField.focus(), 100);
        }
    }

    /**
     * Initialize legal pages (terms, privacy, cookies, disclaimer)
     */
    initLegalPage(data) {
        // No specific initialization needed for legal pages
        // They are primarily static content
    }

    /**
     * Manage focus for accessibility
     */
    manageFocus(page) {
        // Find the main heading of the page and focus it
        const pageElement = document.getElementById(`${page}-page`);
        if (pageElement) {
            const heading = pageElement.querySelector('h1');
            if (heading) {
                heading.setAttribute('tabindex', '-1');
                heading.focus();
                // Remove tabindex after focus to restore normal tab order
                setTimeout(() => heading.removeAttribute('tabindex'), 100);
            }
        }
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        const navMenu = document.getElementById('nav-menu');
        const navToggle = document.getElementById('nav-toggle');
        
        if (navMenu) navMenu.classList.remove('active');
        if (navToggle) navToggle.classList.remove('active');
    }

    /**
     * Smooth scroll to top
     */
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    /**
     * Add page to navigation history
     */
    addToHistory(page) {
        this.history.push(page);
        
        // Limit history length
        if (this.history.length > this.maxHistoryLength) {
            this.history.shift();
        }
    }

    /**
     * Set up stats animation on home page
     */
    setupStatsAnimation() {
        const statElements = document.querySelectorAll('.stat-number[data-count]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateStatNumber(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });

        statElements.forEach(stat => observer.observe(stat));
    }

    /**
     * Animate individual stat number
     */
    animateStatNumber(element) {
        const target = parseInt(element.getAttribute('data-count'));
        const duration = 2000; // 2 seconds
        const start = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(target * easeOut);
            
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Set up quiz filters
     */
    setupQuizFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active state
                filterButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Filter quizzes
                const category = e.target.getAttribute('data-category');
                if (window.app) {
                    window.app.filterQuizzes(category);
                }
                
                // Track filter usage
                if (window.PSAnalytics) {
                    window.PSAnalytics.trackEvent('quiz_filter', { category });
                }
            });
        });
    }

    /**
     * Get current page
     */
    getCurrentPage() {
        return this.currentPage;
    }

    /**
     * Get navigation history
     */
    getHistory() {
        return [...this.history];
    }

    /**
     * Check if can go back
     */
    canGoBack() {
        return this.history.length > 0 || this.currentPage !== 'home';
    }

    /**
     * Get navigation state for debugging
     */
    getNavigationState() {
        return {
            currentPage: this.currentPage,
            history: this.history,
            isNavigating: this.isNavigating,
            canGoBack: this.canGoBack()
        };
    }
}

// Create global instance
const navigationManager = new NavigationManager();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.PSNavigation = navigationManager;
}

// Export class for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationManager;
}