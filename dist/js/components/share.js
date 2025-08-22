/**
 * PersonalitySpark - Share Component
 * Handles social sharing functionality and share card generation
 */

class ShareManager {
    constructor() {
        this.shareModal = null;
        this.currentResults = null;
        this.shareFormats = ['image', 'text', 'link'];
        this.socialPlatforms = ['twitter', 'facebook', 'linkedin', 'whatsapp', 'copy'];
        this.shareHistory = [];
        
        this.init();
    }

    /**
     * Initialize share manager
     */
    init() {
        this.setupEventListeners();
        this.createShareModal();
        console.log('📤 Share manager initialized');
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Handle share buttons
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('share-btn')) {
                const platform = event.target.getAttribute('data-platform');
                const format = event.target.getAttribute('data-format') || 'link';
                this.shareToplatform(platform, format);
            }
        });

        // Handle share modal
        document.addEventListener('click', (event) => {
            if (event.target.id === 'share-modal-close') {
                this.hideShareModal();
            } else if (event.target.classList.contains('modal-backdrop')) {
                this.hideShareModal();
            }
        });

        // Handle keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.hideShareModal();
            }
            
            // Ctrl/Cmd + S to share
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                event.preventDefault();
                this.quickShare();
            }
        });

        // Handle Web Share API
        if (navigator.share) {
            document.addEventListener('click', (event) => {
                if (event.target.classList.contains('native-share-btn')) {
                    this.nativeShare();
                }
            });
        }
    }

    /**
     * Create share modal HTML
     */
    createShareModal() {
        const modalHTML = `
            <div id="share-modal" class="modal share-modal">
                <div class="modal-backdrop"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Share Your Results</h2>
                        <button class="modal-close" id="share-modal-close" aria-label="Close">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="share-preview" id="share-preview">
                            <!-- Share preview will be generated here -->
                        </div>
                        
                        <div class="share-format-tabs">
                            <button class="format-tab active" data-format="image">🖼️ Image</button>
                            <button class="format-tab" data-format="text">📝 Text</button>
                            <button class="format-tab" data-format="link">🔗 Link</button>
                        </div>
                        
                        <div class="share-content" id="share-content">
                            <!-- Share content will be populated based on format -->
                        </div>
                        
                        <div class="share-platforms">
                            <h3>Share to:</h3>
                            <div class="platform-buttons">
                                ${this.renderPlatformButtons()}
                            </div>
                        </div>
                        
                        <div class="share-options">
                            <label class="share-option">
                                <input type="checkbox" id="include-details" checked>
                                <span>Include detailed results</span>
                            </label>
                            <label class="share-option">
                                <input type="checkbox" id="include-watermark" checked>
                                <span>Include PersonalitySpark branding</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to document if it doesn't exist
        if (!document.getElementById('share-modal')) {
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            this.shareModal = document.getElementById('share-modal');
            this.setupModalEventListeners();
        }
    }

    /**
     * Set up modal-specific event listeners
     */
    setupModalEventListeners() {
        // Format tab switching
        const formatTabs = this.shareModal.querySelectorAll('.format-tab');
        formatTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const format = tab.getAttribute('data-format');
                this.switchShareFormat(format);
                
                // Update active tab
                formatTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });

        // Share option changes
        const shareOptions = this.shareModal.querySelectorAll('.share-option input');
        shareOptions.forEach(option => {
            option.addEventListener('change', () => {
                this.updateSharePreview();
            });
        });
    }

    /**
     * Render platform buttons
     */
    renderPlatformButtons() {
        const platforms = [
            { id: 'twitter', name: 'Twitter', icon: '🐦', color: '#1da1f2' },
            { id: 'facebook', name: 'Facebook', icon: '📘', color: '#1877f2' },
            { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: '#0077b5' },
            { id: 'whatsapp', name: 'WhatsApp', icon: '💬', color: '#25d366' },
            { id: 'copy', name: 'Copy Link', icon: '📋', color: '#6c757d' }
        ];

        return platforms.map(platform => `
            <button class="platform-btn share-btn" 
                    data-platform="${platform.id}"
                    style="border-color: ${platform.color}20; color: ${platform.color}"
                    title="Share on ${platform.name}">
                <span class="platform-icon">${platform.icon}</span>
                <span class="platform-name">${platform.name}</span>
            </button>
        `).join('');
    }

    /**
     * Show share modal with results
     */
    showShareModal(results) {
        this.currentResults = results;
        
        if (!this.shareModal) {
            this.createShareModal();
        }

        // Generate share preview
        this.generateSharePreview();
        
        // Show modal
        this.shareModal.classList.add('active');
        document.body.classList.add('modal-open');

        // Focus management
        const closeButton = this.shareModal.querySelector('#share-modal-close');
        if (closeButton) {
            closeButton.focus();
        }

        // Track modal open
        if (window.PSAnalytics) {
            window.PSAnalytics.trackEvent('share_modal_opened', {
                quizType: results.quizType
            });
        }
    }

    /**
     * Hide share modal
     */
    hideShareModal() {
        if (this.shareModal) {
            this.shareModal.classList.remove('active');
            document.body.classList.remove('modal-open');
        }
    }

    /**
     * Generate share preview
     */
    generateSharePreview() {
        if (!this.currentResults) return;

        const preview = this.shareModal.querySelector('#share-preview');
        const topTraits = this.getTopTraits(this.currentResults.traits, 3);
        
        preview.innerHTML = `
            <div class="share-card">
                <div class="share-card-header">
                    <div class="share-logo">✨ PersonalitySpark</div>
                    <div class="share-type">${this.currentResults.quizTitle}</div>
                </div>
                
                <div class="share-card-content">
                    <h3 class="share-title">My Personality Results</h3>
                    <div class="share-traits">
                        ${topTraits.map(([trait, data]) => `
                            <div class="share-trait">
                                <span class="trait-name">${this.formatTraitName(trait)}</span>
                                <span class="trait-score">${data.percentage}%</span>
                                <div class="trait-bar">
                                    <div class="trait-fill" style="width: ${data.percentage}%; background-color: ${this.getTraitColor(trait)}"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <p class="share-summary">${this.getSharingSummary()}</p>
                </div>
                
                <div class="share-card-footer">
                    <div class="share-cta">Take your own personality quiz!</div>
                    <div class="share-url">${window.location.origin}</div>
                </div>
            </div>
        `;

        // Initialize share content with default format
        this.switchShareFormat('image');
    }

    /**
     * Switch share format
     */
    switchShareFormat(format) {
        const shareContent = this.shareModal.querySelector('#share-content');
        
        switch (format) {
            case 'image':
                shareContent.innerHTML = this.generateImageShare();
                break;
            case 'text':
                shareContent.innerHTML = this.generateTextShare();
                break;
            case 'link':
                shareContent.innerHTML = this.generateLinkShare();
                break;
        }

        // Update platform buttons with format
        const platformButtons = this.shareModal.querySelectorAll('.share-btn');
        platformButtons.forEach(btn => {
            btn.setAttribute('data-format', format);
        });
    }

    /**
     * Generate image share content
     */
    generateImageShare() {
        return `
            <div class="image-share-content">
                <div class="image-preview">
                    <canvas id="share-canvas" width="600" height="400"></canvas>
                </div>
                <div class="image-options">
                    <div class="option-group">
                        <label>Style:</label>
                        <select id="image-style">
                            <option value="modern">Modern</option>
                            <option value="classic">Classic</option>
                            <option value="minimal">Minimal</option>
                        </select>
                    </div>
                    <div class="option-group">
                        <label>Size:</label>
                        <select id="image-size">
                            <option value="square">Square (1080x1080)</option>
                            <option value="landscape">Landscape (1200x630)</option>
                            <option value="story">Story (1080x1920)</option>
                        </select>
                    </div>
                    <button class="btn btn-secondary" id="regenerate-image">🔄 Regenerate</button>
                </div>
            </div>
        `;
    }

    /**
     * Generate text share content
     */
    generateTextShare() {
        const shareText = this.generateShareText();
        
        return `
            <div class="text-share-content">
                <div class="text-preview">
                    <textarea id="share-text" rows="6" readonly>${shareText}</textarea>
                </div>
                <div class="text-options">
                    <div class="option-group">
                        <label>Style:</label>
                        <select id="text-style">
                            <option value="casual">Casual</option>
                            <option value="professional">Professional</option>
                            <option value="fun">Fun & Emoji</option>
                        </select>
                    </div>
                    <div class="option-group">
                        <label>Length:</label>
                        <select id="text-length">
                            <option value="short">Short</option>
                            <option value="medium">Medium</option>
                            <option value="long">Detailed</option>
                        </select>
                    </div>
                    <button class="btn btn-secondary" id="regenerate-text">🔄 Regenerate</button>
                </div>
            </div>
        `;
    }

    /**
     * Generate link share content
     */
    generateLinkShare() {
        const shareUrl = this.generateShareUrl();
        
        return `
            <div class="link-share-content">
                <div class="link-preview">
                    <input type="text" id="share-url" value="${shareUrl}" readonly>
                    <button class="btn btn-secondary" id="copy-link">📋 Copy</button>
                </div>
                <div class="link-options">
                    <label class="link-option">
                        <input type="checkbox" id="include-results" checked>
                        <span>Include results in link</span>
                    </label>
                    <label class="link-option">
                        <input type="checkbox" id="track-clicks">
                        <span>Track clicks (analytics)</span>
                    </label>
                </div>
                <div class="qr-code">
                    <h4>QR Code:</h4>
                    <div id="qr-code-container">
                        ${this.generateQRCode(shareUrl)}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Share to specific platform
     */
    shareToplatform(platform, format = 'link') {
        if (!this.currentResults) {
            this.showError('No results to share');
            return;
        }

        try {
            switch (platform) {
                case 'twitter':
                    this.shareToTwitter(format);
                    break;
                case 'facebook':
                    this.shareToFacebook(format);
                    break;
                case 'linkedin':
                    this.shareToLinkedIn(format);
                    break;
                case 'whatsapp':
                    this.shareToWhatsApp(format);
                    break;
                case 'copy':
                    this.copyToClipboard(format);
                    break;
                default:
                    this.showError('Unsupported platform');
            }

            // Track share
            if (window.PSAnalytics) {
                window.PSAnalytics.trackResultShare(platform, this.currentResults.quizType);
            }

            // Add to share history
            this.addToShareHistory(platform, format);

        } catch (error) {
            console.error('Share failed:', error);
            this.showError('Failed to share. Please try again.');
        }
    }

    /**
     * Share to Twitter
     */
    shareToTwitter(format) {
        const text = this.generateShareText('short');
        const url = this.generateShareUrl();
        const hashtags = 'PersonalitySpark,PersonalityTest,SelfDiscovery';
        
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${hashtags}`;
        
        this.openShareWindow(twitterUrl, 'twitter-share');
    }

    /**
     * Share to Facebook
     */
    shareToFacebook(format) {
        const url = this.generateShareUrl();
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        
        this.openShareWindow(facebookUrl, 'facebook-share');
    }

    /**
     * Share to LinkedIn
     */
    shareToLinkedIn(format) {
        const url = this.generateShareUrl();
        const title = 'My PersonalitySpark Results';
        const summary = this.generateShareText('medium');
        
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}`;
        
        this.openShareWindow(linkedinUrl, 'linkedin-share');
    }

    /**
     * Share to WhatsApp
     */
    shareToWhatsApp(format) {
        const text = this.generateShareText('medium');
        const url = this.generateShareUrl();
        const message = `${text}\n\n${url}`;
        
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        
        this.openShareWindow(whatsappUrl, 'whatsapp-share');
    }

    /**
     * Copy to clipboard
     */
    async copyToClipboard(format) {
        let content;
        
        switch (format) {
            case 'text':
                content = this.generateShareText('long');
                break;
            case 'image':
                content = await this.generateImageBlob();
                break;
            case 'link':
            default:
                content = this.generateShareUrl();
                break;
        }

        try {
            if (format === 'image' && content instanceof Blob) {
                // Copy image to clipboard
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': content })
                ]);
            } else {
                // Copy text to clipboard
                await navigator.clipboard.writeText(content);
            }

            this.showSuccess('Copied to clipboard!');
            this.hideShareModal();

        } catch (error) {
            // Fallback for older browsers
            if (format !== 'image') {
                const success = this.fallbackCopyToClipboard(content);
                if (success) {
                    this.showSuccess('Copied to clipboard!');
                    this.hideShareModal();
                } else {
                    this.showError('Failed to copy to clipboard');
                }
            } else {
                this.showError('Image copying not supported in this browser');
            }
        }
    }

    /**
     * Fallback copy method for older browsers
     */
    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            return successful;
        } catch (error) {
            document.body.removeChild(textArea);
            return false;
        }
    }

    /**
     * Native share using Web Share API
     */
    async nativeShare() {
        if (!navigator.share) {
            this.showError('Native sharing not supported');
            return;
        }

        try {
            const shareData = {
                title: 'My PersonalitySpark Results',
                text: this.generateShareText('medium'),
                url: this.generateShareUrl()
            };

            await navigator.share(shareData);
            
            if (window.PSAnalytics) {
                window.PSAnalytics.trackResultShare('native', this.currentResults.quizType);
            }

        } catch (error) {
            if (error.name !== 'AbortError') {
                console.warn('Native share failed:', error);
                this.showShareModal(this.currentResults);
            }
        }
    }

    /**
     * Quick share (keyboard shortcut)
     */
    quickShare() {
        if (navigator.share) {
            this.nativeShare();
        } else {
            this.copyToClipboard('link');
        }
    }

    /**
     * Generate share text
     */
    generateShareText(length = 'medium') {
        if (!this.currentResults) return '';

        const topTraits = this.getTopTraits(this.currentResults.traits, 3);
        const traitText = topTraits.map(([trait, data]) => 
            `${this.formatTraitName(trait)} (${data.percentage}%)`
        ).join(', ');

        const templates = {
            short: `I just discovered my personality type: ${traitText}! 🧠✨ Check out PersonalitySpark for AI-powered personality quizzes.`,
            
            medium: `🎯 Just completed my personality assessment on PersonalitySpark!\n\nMy top traits: ${traitText}\n\n${this.getSharingSummary()}\n\nDiscover your personality insights too!`,
            
            long: `🧠 Fascinating personality insights from PersonalitySpark!\n\n📊 My Results:\n${topTraits.map(([trait, data]) => `• ${this.formatTraitName(trait)}: ${data.percentage}%`).join('\n')}\n\n💡 ${this.getSharingSummary()}\n\n🎯 ${this.currentResults.insights.recommendations[0] || 'Take the quiz to discover your unique personality profile!'}\n\nTry it yourself at PersonalitySpark! 🚀`
        };

        return templates[length] || templates.medium;
    }

    /**
     * Generate share URL
     */
    generateShareUrl() {
        const baseUrl = window.location.origin;
        
        // Include result ID for shared results viewing
        if (this.currentResults && this.currentResults.id) {
            return `${baseUrl}?shared=${this.currentResults.id}`;
        }
        
        return baseUrl;
    }

    /**
     * Generate sharing summary
     */
    getSharingSummary() {
        if (!this.currentResults || !this.currentResults.insights) {
            return 'Discover fascinating insights about your unique personality!';
        }

        const summary = this.currentResults.insights.summary;
        
        // Truncate for sharing
        if (summary.length > 150) {
            return summary.substring(0, 147) + '...';
        }
        
        return summary;
    }

    /**
     * Generate QR code
     */
    generateQRCode(url) {
        // Simple QR code placeholder - in production would use a QR library
        return `
            <div class="qr-placeholder">
                <div class="qr-pattern"></div>
                <p>QR Code for: ${url}</p>
            </div>
        `;
    }

    /**
     * Generate image blob for sharing
     */
    async generateImageBlob() {
        const canvas = document.getElementById('share-canvas');
        if (!canvas) {
            throw new Error('Share canvas not found');
        }

        return new Promise(resolve => {
            canvas.toBlob(resolve, 'image/png');
        });
    }

    /**
     * Open share window
     */
    openShareWindow(url, name) {
        const width = 600;
        const height = 400;
        const left = (screen.width - width) / 2;
        const top = (screen.height - height) / 2;
        
        const features = `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`;
        
        window.open(url, name, features);
        
        // Hide modal after opening share window
        setTimeout(() => {
            this.hideShareModal();
        }, 500);
    }

    /**
     * Add to share history
     */
    addToShareHistory(platform, format) {
        const shareItem = {
            platform: platform,
            format: format,
            timestamp: Date.now(),
            quizType: this.currentResults?.quizType,
            resultId: this.currentResults?.id
        };

        this.shareHistory.unshift(shareItem);
        
        // Keep only last 50 shares
        if (this.shareHistory.length > 50) {
            this.shareHistory = this.shareHistory.slice(0, 50);
        }

        // Save to storage
        if (window.PSStorage) {
            window.PSStorage.setItem('share-history', this.shareHistory);
        }
    }

    /**
     * Get share history
     */
    getShareHistory() {
        if (window.PSStorage) {
            this.shareHistory = window.PSStorage.getItem('share-history', []);
        }
        return this.shareHistory;
    }

    /**
     * Utility methods
     */
    
    getTopTraits(traits, count = 3) {
        return Object.entries(traits)
            .sort(([,a], [,b]) => b.score - a.score)
            .slice(0, count);
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
            creativity: '#fd79a8'
        };
        
        return colors[trait] || '#6c757d';
    }

    showSuccess(message) {
        if (window.app && window.app.showToast) {
            window.app.showToast(message, 'success');
        }
    }

    showError(message) {
        if (window.app && window.app.showToast) {
            window.app.showToast(message, 'error');
        }
    }

    // Export share history
    exportShareHistory() {
        const history = this.getShareHistory();
        const data = {
            exportDate: new Date().toISOString(),
            shareHistory: history
        };
        
        if (window.PSHelpers) {
            const filename = `PersonalitySpark-ShareHistory-${new Date().toISOString().split('T')[0]}.json`;
            window.PSHelpers.downloadAsFile(JSON.stringify(data, null, 2), filename, 'application/json');
        }
    }

    // Clear share history
    clearShareHistory() {
        this.shareHistory = [];
        if (window.PSStorage) {
            window.PSStorage.removeItem('share-history');
        }
    }
}

// Create global instance
const shareManager = new ShareManager();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.PSShare = shareManager;
}

// Export class for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShareManager;
}