/**
 * PersonalitySpark - Results Component
 * Handles quiz results display, visualization, and interactions
 */

class ResultsManager {
    constructor() {
        this.currentResults = null;
        this.chartInstances = [];
        this.animationQueue = [];
        this.isAnimating = false;
        
        this.init();
    }

    /**
     * Initialize results manager
     */
    init() {
        this.setupEventListeners();
        console.log('📊 Results manager initialized');
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Handle results action buttons
        document.addEventListener('click', (event) => {
            if (event.target.id === 'share-results-btn') {
                this.shareResults();
            } else if (event.target.id === 'download-results-btn') {
                this.downloadResults();
            } else if (event.target.id === 'retake-quiz-btn') {
                this.retakeQuiz();
            } else if (event.target.id === 'save-results-btn') {
                this.saveResults();
            }
        });

        // Handle trait bar interactions
        document.addEventListener('click', (event) => {
            if (event.target.closest('.trait-bar')) {
                this.showTraitDetails(event.target.closest('.trait-bar'));
            }
        });

        // Handle print results
        document.addEventListener('keydown', (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
                event.preventDefault();
                this.printResults();
            }
        });

        // Handle comparison features
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('compare-btn')) {
                this.showComparison();
            }
        });
    }

    /**
     * Display quiz results
     */
    displayResults(results) {
        this.currentResults = results;
        
        try {
            this.renderResults(results);
            this.animateResults();
            this.setupInteractions();
            
            // Track results view
            if (window.PSAnalytics) {
                window.PSAnalytics.trackEvent('results_viewed', {
                    quizType: results.quizType,
                    resultId: results.id
                });
            }

            console.log('📊 Results displayed successfully');
            
        } catch (error) {
            console.error('Failed to display results:', error);
            this.showError('Failed to display results. Please try again.');
        }
    }

    /**
     * Render main results content
     */
    renderResults(results) {
        const resultsContent = document.getElementById('results-content');
        if (!resultsContent) {
            throw new Error('Results content element not found');
        }

        // Update page title
        this.updateResultsTitle(results);

        // Render results sections
        resultsContent.innerHTML = `
            ${this.renderSummaryCard(results)}
            ${this.renderTraitVisualization(results)}
            ${this.renderInsightsCards(results)}
            ${this.renderPersonalityWheel(results)}
            ${this.renderComparisons(results)}
            ${this.renderRecommendations(results)}
            ${this.renderMetadata(results)}
        `;

        // Initialize charts and visualizations
        this.initializeCharts(results);
    }

    /**
     * Update results page title
     */
    updateResultsTitle(results) {
        const titleElement = document.querySelector('.results-title');
        const subtitleElement = document.querySelector('.results-subtitle');
        
        if (titleElement) {
            titleElement.textContent = `Your ${results.quizTitle} Results`;
        }
        
        if (subtitleElement) {
            const completionTime = this.formatDuration(results.totalTime);
            subtitleElement.textContent = `Completed in ${completionTime} • ${new Date(results.completedAt).toLocaleDateString()}`;
        }
    }

    /**
     * Render summary card
     */
    renderSummaryCard(results) {
        const topTraits = this.getTopTraits(results.traits, 3);
        const personalityType = this.determinePersonalityType(results.traits);

        return `
            <div class="result-card summary-card" data-animation="fadeInUp">
                <div class="card-header">
                    <h3>🎯 Your Personality Summary</h3>
                    <div class="personality-type-badge">${personalityType}</div>
                </div>
                <div class="card-content">
                    <p class="result-summary">${results.insights.summary}</p>
                    <div class="top-traits">
                        <h4>Your Top Traits:</h4>
                        <div class="trait-chips">
                            ${topTraits.map(([trait, data]) => `
                                <div class="trait-chip" style="--trait-color: ${this.getTraitColor(trait)}">
                                    <span class="trait-name">${this.formatTraitName(trait)}</span>
                                    <span class="trait-percentage">${data.percentage}%</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render trait visualization
     */
    renderTraitVisualization(results) {
        const traits = results.traits;
        
        return `
            <div class="result-card chart-card" data-animation="fadeInUp" data-delay="200">
                <div class="card-header">
                    <h3>📊 Personality Profile</h3>
                    <div class="chart-controls">
                        <button class="chart-type-btn active" data-chart="bars">Bar Chart</button>
                        <button class="chart-type-btn" data-chart="radar">Radar Chart</button>
                        <button class="chart-type-btn" data-chart="wheel">Wheel Chart</button>
                    </div>
                </div>
                <div class="card-content">
                    <div class="chart-container">
                        <div class="trait-bars-chart active" id="trait-bars-chart">
                            ${this.renderTraitBars(traits)}
                        </div>
                        <div class="radar-chart" id="radar-chart">
                            <canvas id="radar-canvas" width="400" height="400"></canvas>
                        </div>
                        <div class="wheel-chart" id="wheel-chart">
                            <div class="personality-wheel" id="personality-wheel">
                                ${this.renderPersonalityWheelSVG(traits)}
                            </div>
                        </div>
                    </div>
                    <div class="chart-legend">
                        ${this.renderChartLegend(traits)}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render trait bars
     */
    renderTraitBars(traits) {
        return `
            <div class="trait-bars">
                ${Object.entries(traits).map(([trait, data], index) => `
                    <div class="trait-bar" data-trait="${trait}" data-animation-delay="${index * 100}">
                        <div class="trait-info">
                            <div class="trait-label">
                                <span class="trait-icon">${this.getTraitIcon(trait)}</span>
                                <span class="trait-name">${this.formatTraitName(trait)}</span>
                            </div>
                            <div class="trait-score">${data.percentage}%</div>
                        </div>
                        <div class="trait-progress">
                            <div class="trait-fill" 
                                 style="--trait-color: ${this.getTraitColor(trait)}; width: 0%"
                                 data-width="${data.percentage}%">
                            </div>
                        </div>
                        <div class="trait-description">
                            ${this.getTraitDescription(trait, data.score)}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Render insights cards
     */
    renderInsightsCards(results) {
        const { insights } = results;
        
        return `
            <div class="insights-grid">
                ${insights.strengths && insights.strengths.length > 0 ? `
                    <div class="result-card insights-card" data-animation="fadeInLeft" data-delay="400">
                        <div class="card-header">
                            <h3>💪 Your Strengths</h3>
                        </div>
                        <div class="card-content">
                            <ul class="insights-list strengths-list">
                                ${insights.strengths.map(strength => `
                                    <li class="insight-item">
                                        <span class="insight-icon">✨</span>
                                        <span class="insight-text">${strength}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                ` : ''}

                ${insights.growthAreas && insights.growthAreas.length > 0 ? `
                    <div class="result-card insights-card" data-animation="fadeInRight" data-delay="600">
                        <div class="card-header">
                            <h3>🌱 Growth Opportunities</h3>
                        </div>
                        <div class="card-content">
                            <ul class="insights-list growth-list">
                                ${insights.growthAreas.map(area => `
                                    <li class="insight-item">
                                        <span class="insight-icon">🎯</span>
                                        <span class="insight-text">${area}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                ` : ''}

                <div class="result-card insights-card" data-animation="fadeInUp" data-delay="800">
                    <div class="card-header">
                        <h3>🎯 Recommendations</h3>
                    </div>
                    <div class="card-content">
                        <ul class="insights-list recommendations-list">
                            ${insights.recommendations.map(recommendation => `
                                <li class="insight-item">
                                    <span class="insight-icon">💡</span>
                                    <span class="insight-text">${recommendation}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render personality wheel
     */
    renderPersonalityWheel(results) {
        return `
            <div class="result-card wheel-card" data-animation="fadeIn" data-delay="1000">
                <div class="card-header">
                    <h3>🎡 Personality Wheel</h3>
                    <p class="card-subtitle">Interactive visualization of your traits</p>
                </div>
                <div class="card-content">
                    <div class="wheel-container">
                        ${this.renderInteractiveWheel(results.traits)}
                    </div>
                    <div class="wheel-legend">
                        <p>Click on any segment to explore that trait in detail</p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render comparisons section
     */
    renderComparisons(results) {
        return `
            <div class="result-card comparison-card" data-animation="fadeInUp" data-delay="1200">
                <div class="card-header">
                    <h3>📈 How You Compare</h3>
                    <p class="card-subtitle">Your results compared to others</p>
                </div>
                <div class="card-content">
                    <div class="comparison-grid">
                        ${this.renderComparisonCharts(results.traits)}
                    </div>
                    <div class="comparison-note">
                        <p>Comparisons are based on anonymized data from thousands of quiz takers.</p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render recommendations
     */
    renderRecommendations(results) {
        const careerMatches = this.generateCareerMatches(results.traits);
        const relationshipTips = this.generateRelationshipTips(results.traits);
        
        return `
            <div class="recommendations-grid">
                <div class="result-card career-card" data-animation="fadeInLeft" data-delay="1400">
                    <div class="card-header">
                        <h3>💼 Career Matches</h3>
                    </div>
                    <div class="card-content">
                        <div class="career-matches">
                            ${careerMatches.map(career => `
                                <div class="career-match">
                                    <div class="career-icon">${career.icon}</div>
                                    <div class="career-info">
                                        <h4>${career.title}</h4>
                                        <p>${career.description}</p>
                                        <div class="match-percentage">${career.match}% match</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div class="result-card relationships-card" data-animation="fadeInRight" data-delay="1600">
                    <div class="card-header">
                        <h3>💕 Relationship Tips</h3>
                    </div>
                    <div class="card-content">
                        <div class="relationship-tips">
                            ${relationshipTips.map(tip => `
                                <div class="relationship-tip">
                                    <div class="tip-icon">${tip.icon}</div>
                                    <div class="tip-content">
                                        <h4>${tip.title}</h4>
                                        <p>${tip.description}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render metadata and statistics
     */
    renderMetadata(results) {
        return `
            <div class="result-card metadata-card" data-animation="fadeIn" data-delay="1800">
                <div class="card-header">
                    <h3>📋 Quiz Details</h3>
                </div>
                <div class="card-content">
                    <div class="metadata-grid">
                        <div class="metadata-item">
                            <span class="metadata-label">Quiz Type:</span>
                            <span class="metadata-value">${results.quizTitle}</span>
                        </div>
                        <div class="metadata-item">
                            <span class="metadata-label">Completed:</span>
                            <span class="metadata-value">${new Date(results.completedAt).toLocaleString()}</span>
                        </div>
                        <div class="metadata-item">
                            <span class="metadata-label">Time Taken:</span>
                            <span class="metadata-value">${this.formatDuration(results.totalTime)}</span>
                        </div>
                        <div class="metadata-item">
                            <span class="metadata-label">Questions:</span>
                            <span class="metadata-value">${results.metadata?.questionsCount || 'N/A'}</span>
                        </div>
                        <div class="metadata-item">
                            <span class="metadata-label">Average per Question:</span>
                            <span class="metadata-value">${this.formatDuration(results.metadata?.averageTimePerQuestion || 0)}</span>
                        </div>
                        <div class="metadata-item">
                            <span class="metadata-label">Result ID:</span>
                            <span class="metadata-value code">${results.id}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Animate results appearance
     */
    animateResults() {
        const cards = document.querySelectorAll('[data-animation]');
        
        cards.forEach((card, index) => {
            const animation = card.getAttribute('data-animation');
            const delay = parseInt(card.getAttribute('data-delay')) || (index * 200);
            
            // Set initial state
            card.style.opacity = '0';
            card.style.transform = this.getInitialTransform(animation);
            
            // Animate in
            setTimeout(() => {
                card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0) translateX(0) scale(1)';
            }, delay);
        });

        // Animate trait bars
        setTimeout(() => {
            this.animateTraitBars();
        }, 1000);
    }

    /**
     * Get initial transform for animation
     */
    getInitialTransform(animation) {
        const transforms = {
            fadeIn: 'scale(0.8)',
            fadeInUp: 'translateY(30px)',
            fadeInDown: 'translateY(-30px)',
            fadeInLeft: 'translateX(-30px)',
            fadeInRight: 'translateX(30px)'
        };
        
        return transforms[animation] || 'translateY(30px)';
    }

    /**
     * Animate trait bars
     */
    animateTraitBars() {
        const traitBars = document.querySelectorAll('.trait-fill');
        
        traitBars.forEach((bar, index) => {
            const targetWidth = bar.getAttribute('data-width');
            const delay = parseInt(bar.closest('.trait-bar').getAttribute('data-animation-delay')) || 0;
            
            setTimeout(() => {
                bar.style.transition = 'width 1s ease-out';
                bar.style.width = targetWidth;
            }, delay);
        });
    }

    /**
     * Initialize interactive charts
     */
    initializeCharts(results) {
        // Initialize radar chart
        this.initializeRadarChart(results.traits);
        
        // Initialize wheel chart
        this.initializeWheelChart(results.traits);
        
        // Set up chart type switching
        this.setupChartSwitching();
    }

    /**
     * Initialize radar chart
     */
    initializeRadarChart(traits) {
        const canvas = document.getElementById('radar-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 50;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw radar chart
        this.drawRadarGrid(ctx, centerX, centerY, radius);
        this.drawRadarData(ctx, centerX, centerY, radius, traits);
        this.drawRadarLabels(ctx, centerX, centerY, radius, traits);
    }

    /**
     * Draw radar chart grid
     */
    drawRadarGrid(ctx, centerX, centerY, radius) {
        const levels = 5;
        const traitCount = Object.keys(this.currentResults.traits).length;

        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;

        // Draw concentric polygons
        for (let level = 1; level <= levels; level++) {
            const levelRadius = (radius / levels) * level;
            
            ctx.beginPath();
            for (let i = 0; i < traitCount; i++) {
                const angle = (2 * Math.PI * i) / traitCount - Math.PI / 2;
                const x = centerX + levelRadius * Math.cos(angle);
                const y = centerY + levelRadius * Math.sin(angle);
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.stroke();
        }

        // Draw radial lines
        for (let i = 0; i < traitCount; i++) {
            const angle = (2 * Math.PI * i) / traitCount - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    }

    /**
     * Setup chart type switching
     */
    setupChartSwitching() {
        const chartButtons = document.querySelectorAll('.chart-type-btn');
        const charts = document.querySelectorAll('.trait-bars-chart, .radar-chart, .wheel-chart');

        chartButtons.forEach(button => {
            button.addEventListener('click', () => {
                const chartType = button.getAttribute('data-chart');
                
                // Update active button
                chartButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Show corresponding chart
                charts.forEach(chart => chart.classList.remove('active'));
                const targetChart = document.getElementById(`${chartType === 'bars' ? 'trait-bars' : chartType}-chart`);
                if (targetChart) {
                    targetChart.classList.add('active');
                }

                // Track chart view
                if (window.PSAnalytics) {
                    window.PSAnalytics.trackEvent('chart_view', {
                        chartType: chartType,
                        quizType: this.currentResults.quizType
                    });
                }
            });
        });
    }

    /**
     * Share results functionality
     */
    shareResults() {
        if (!this.currentResults) {
            this.showError('No results to share');
            return;
        }

        // Use Web Share API if available
        if (navigator.share) {
            this.shareWithWebAPI();
        } else {
            this.showShareModal();
        }

        // Track share attempt
        if (window.PSAnalytics) {
            window.PSAnalytics.trackResultShare('native', this.currentResults.quizType);
        }
    }

    /**
     * Share using Web Share API
     */
    async shareWithWebAPI() {
        try {
            const shareData = {
                title: 'My PersonalitySpark Results',
                text: `I just discovered fascinating insights about my personality! Check out PersonalitySpark for AI-powered personality quizzes.`,
                url: window.location.origin
            };

            await navigator.share(shareData);
            
            if (window.PSAnalytics) {
                window.PSAnalytics.trackResultShare('web_api', this.currentResults.quizType);
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.warn('Web Share failed:', error);
                this.showShareModal();
            }
        }
    }

    /**
     * Show share modal
     */
    showShareModal() {
        // Implementation would show the share modal
        // This is handled by the main app's share functionality
        if (window.app && window.app.showShareModal) {
            window.app.showShareModal(this.currentResults);
        }
    }

    /**
     * Download results
     */
    downloadResults() {
        if (!this.currentResults) {
            this.showError('No results to download');
            return;
        }

        try {
            const content = this.formatResultsForDownload();
            const filename = `PersonalitySpark-Results-${new Date().toISOString().split('T')[0]}.txt`;
            
            if (window.PSHelpers) {
                window.PSHelpers.downloadAsFile(content, filename, 'text/plain');
            }

            if (window.PSAnalytics) {
                window.PSAnalytics.trackResultDownload(this.currentResults.quizType);
            }

        } catch (error) {
            console.error('Download failed:', error);
            this.showError('Failed to download results');
        }
    }

    /**
     * Format results for download
     */
    formatResultsForDownload() {
        const { quizTitle, traits, insights, completedAt, totalTime } = this.currentResults;
        
        let content = `PersonalitySpark - Personality Assessment Results\n`;
        content += `=============================================\n\n`;
        content += `Quiz: ${quizTitle}\n`;
        content += `Completed: ${new Date(completedAt).toLocaleDateString()}\n`;
        content += `Time Taken: ${this.formatDuration(totalTime)}\n\n`;
        
        content += `PERSONALITY SUMMARY:\n`;
        content += `${insights.summary}\n\n`;
        
        content += `TRAIT SCORES:\n`;
        Object.entries(traits).forEach(([trait, data]) => {
            content += `${this.formatTraitName(trait)}: ${data.percentage}%\n`;
        });
        content += `\n`;
        
        if (insights.strengths && insights.strengths.length > 0) {
            content += `STRENGTHS:\n`;
            insights.strengths.forEach((strength, index) => {
                content += `${index + 1}. ${strength}\n`;
            });
            content += `\n`;
        }
        
        if (insights.growthAreas && insights.growthAreas.length > 0) {
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
     * Retake quiz
     */
    retakeQuiz() {
        if (window.PSNavigation) {
            window.PSNavigation.navigateToPage('quizzes');
        }
    }

    /**
     * Print results
     */
    printResults() {
        window.print();
    }

    /**
     * Utility methods
     */
    
    formatDuration(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        } else {
            return `${remainingSeconds}s`;
        }
    }

    formatTraitName(trait) {
        return trait.charAt(0).toUpperCase() + trait.slice(1).replace(/_/g, ' ');
    }

    getTraitColor(trait) {
        const colors = {
            extraversion: '#ff6b6b',
            agreeableness: '#4ecdc4',
            conscientiousness: '#45b7d1',
            neuroticism: '#96ceb4',
            openness: '#feca57',
            leadership: '#a55eea',
            creativity: '#fd79a8',
            social: '#00b894',
            analytical: '#0984e3',
            practical: '#6c5ce7'
        };
        
        return colors[trait] || '#6c757d';
    }

    getTraitIcon(trait) {
        const icons = {
            extraversion: '🗣️',
            agreeableness: '🤝',
            conscientiousness: '✅',
            neuroticism: '😌',
            openness: '🎨',
            leadership: '👑',
            creativity: '💡',
            social: '👥',
            analytical: '🔍',
            practical: '🔧'
        };
        
        return icons[trait] || '📊';
    }

    getTraitDescription(trait, score) {
        // Return trait descriptions based on score
        const descriptions = {
            extraversion: score >= 4 ? 'You enjoy social interaction and feel energized by being around others.' : 'You prefer smaller groups and quiet environments.',
            agreeableness: score >= 4 ? 'You are cooperative, trusting, and considerate of others.' : 'You are more competitive and straightforward in your approach.',
            conscientiousness: score >= 4 ? 'You are organized, disciplined, and goal-oriented.' : 'You prefer flexibility and spontaneity.',
            openness: score >= 4 ? 'You are creative, curious, and open to new experiences.' : 'You prefer familiar situations and conventional approaches.'
        };
        
        return descriptions[trait] || 'Your score indicates a balanced approach in this area.';
    }

    getTopTraits(traits, count = 3) {
        return Object.entries(traits)
            .sort(([,a], [,b]) => b.score - a.score)
            .slice(0, count);
    }

    determinePersonalityType(traits) {
        // Simple personality type determination
        const topTrait = this.getTopTraits(traits, 1)[0];
        if (topTrait) {
            const [trait, data] = topTrait;
            return `${this.formatTraitName(trait)} (${data.percentage}%)`;
        }
        return 'Balanced Personality';
    }

    generateCareerMatches(traits) {
        // Generate career matches based on traits
        return [
            { icon: '💼', title: 'Project Manager', description: 'Lead teams and manage complex projects', match: 85 },
            { icon: '🎨', title: 'Creative Designer', description: 'Express creativity through visual design', match: 78 },
            { icon: '📊', title: 'Data Analyst', description: 'Analyze data to drive business decisions', match: 72 }
        ];
    }

    generateRelationshipTips(traits) {
        // Generate relationship tips based on traits
        return [
            { icon: '💝', title: 'Communication Style', description: 'You prefer direct, honest communication in relationships.' },
            { icon: '🎯', title: 'Conflict Resolution', description: 'You handle conflicts by seeking practical solutions.' },
            { icon: '🌟', title: 'Love Language', description: 'You express love through quality time and meaningful conversations.' }
        ];
    }

    showError(message) {
        if (window.app && window.app.showToast) {
            window.app.showToast(message, 'error');
        } else {
            console.error(message);
        }
    }

    // Additional methods for interactive features...
    
    renderPersonalityWheelSVG(traits) {
        // SVG-based personality wheel implementation
        const svgSize = 300;
        const centerX = svgSize / 2;
        const centerY = svgSize / 2;
        const radius = 120;
        
        const traitEntries = Object.entries(traits);
        const angleStep = (2 * Math.PI) / traitEntries.length;
        
        let svg = `<svg width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}">`;
        
        traitEntries.forEach(([trait, data], index) => {
            const angle = index * angleStep;
            const value = data.percentage / 100;
            const segmentRadius = radius * value;
            
            const x1 = centerX + segmentRadius * Math.cos(angle);
            const y1 = centerY + segmentRadius * Math.sin(angle);
            const x2 = centerX + segmentRadius * Math.cos(angle + angleStep);
            const y2 = centerY + segmentRadius * Math.sin(angle + angleStep);
            
            svg += `
                <path d="M ${centerX} ${centerY} L ${x1} ${y1} A ${segmentRadius} ${segmentRadius} 0 0 1 ${x2} ${y2} Z"
                      fill="${this.getTraitColor(trait)}"
                      opacity="0.8"
                      stroke="#fff"
                      stroke-width="2"
                      data-trait="${trait}"
                      class="wheel-segment">
                </path>
            `;
        });
        
        svg += '</svg>';
        return svg;
    }

    renderInteractiveWheel(traits) {
        return `
            <div class="interactive-wheel">
                ${this.renderPersonalityWheelSVG(traits)}
                <div class="wheel-center">
                    <div class="wheel-center-content">
                        <span class="wheel-emoji">🧠</span>
                        <span class="wheel-label">Your Personality</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderChartLegend(traits) {
        return `
            <div class="chart-legend-items">
                ${Object.entries(traits).map(([trait, data]) => `
                    <div class="legend-item">
                        <div class="legend-color" style="background-color: ${this.getTraitColor(trait)}"></div>
                        <span class="legend-label">${this.formatTraitName(trait)}</span>
                        <span class="legend-value">${data.percentage}%</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderComparisonCharts(traits) {
        return `
            <div class="comparison-items">
                ${Object.entries(traits).slice(0, 3).map(([trait, data]) => `
                    <div class="comparison-item">
                        <h4>${this.formatTraitName(trait)}</h4>
                        <div class="comparison-bar">
                            <div class="comparison-average" style="left: 50%">
                                <span class="average-label">Average</span>
                            </div>
                            <div class="comparison-you" style="left: ${data.percentage}%">
                                <span class="you-label">You (${data.percentage}%)</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// Create global instance
const resultsManager = new ResultsManager();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.PSResults = resultsManager;
}

// Export class for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResultsManager;
}