/**
 * PersonalitySpark Blog Article Registry
 * Automatically discovers and categorizes blog articles
 */

class ArticleRegistry {
    constructor() {
        this.articles = [];
        this.categories = {
            'twin-flames': {
                name: 'Twin Flames & Spiritual Connections',
                icon: '💫',
                keywords: ['twin-flame', 'twin flame', 'runner', 'chaser', 'separation', 'reunion', 'spiritual-connection'],
                tags: ['separation', 'reunion', 'runner', 'chaser', 'signs', 'love', 'healing', 'awakening']
            },
            'introversion': {
                name: 'Introversion & Personality',
                icon: '🤫',
                keywords: ['introvert', 'introversion', 'personality', 'communication', 'social', 'energy'],
                tags: ['communication', 'energy', 'workplace', 'dating', 'social', 'traits', 'strengths']
            },
            'angel-numbers': {
                name: 'Angel Numbers & Spirituality',
                icon: '🔢',
                keywords: ['angel-number', 'angel number', '1111', '2222', '3333', '0000', '1010', '1034'],
                tags: ['manifestation', 'spiritual', 'guidance', 'numerology', 'divine', 'synchronicity']
            },
            'relationships': {
                name: 'Relationships & Love',
                icon: '💕',
                keywords: ['relationship', 'dating', 'love', 'romance', 'communication', 'compatibility'],
                tags: ['dating', 'communication', 'love', 'compatibility', 'challenges', 'romance']
            },
            'psychology': {
                name: 'Psychology & Mental Health',
                icon: '🧠',
                keywords: ['psychology', 'personality-types', 'mental', 'behavior', 'emotional', 'cognitive'],
                tags: ['personality-types', 'behavior', 'mental-health', 'emotional-intelligence', 'wellbeing']
            },
            'self-discovery': {
                name: 'Self-Discovery & Growth',
                icon: '🌱',
                keywords: ['self-discovery', 'personal-growth', 'development', 'mindfulness', 'awareness'],
                tags: ['growth', 'development', 'mindfulness', 'awareness', 'transformation']
            }
        };
        this.initializeArticles();
    }

    initializeArticles() {
        // Registry of all articles with metadata
        this.articles = [
            // Twin Flame Articles
            {
                title: "10 Signs Your Twin Flame Separation Is Coming to an End",
                filename: "10-signs-twin-flame-separation-ending.html",
                category: "twin-flames",
                excerpt: "Discover the profound indicators that signal your twin flame separation phase may be nearing its conclusion and prepare for the beautiful reunion ahead.",
                readTime: "5 min",
                date: "2025-08-17",
                tags: ["separation", "signs", "reunion"],
                featured: true
            },
            {
                title: "10 Signs of Twin Flame Love",
                filename: "10-signs-of-twin-flame-love.html",
                category: "twin-flames",
                excerpt: "Explore the unique characteristics of twin flame love and spiritual connection that transcend ordinary relationships.",
                readTime: "6 min",
                date: "2025-08-17",
                tags: ["love", "signs", "spiritual"]
            },
            {
                title: "10 Common Twin Flame Runner Fears",
                filename: "10-common-twin-flame-runner-fears.html",
                category: "twin-flames",
                excerpt: "Understanding the fears that cause twin flame runners and explore paths to healing and reunion.",
                readTime: "7 min",
                date: "2025-08-17",
                tags: ["runner", "fears", "healing"]
            },
            {
                title: "12 Signs You've Met Your Twin Flame",
                filename: "12-signs-youve-met-your-twin-flame.html",
                category: "twin-flames",
                excerpt: "Discover the 12 definitive signs that indicate you've encountered your mirror soul and begun this transformative spiritual journey.",
                readTime: "6 min",
                date: "2025-08-17",
                tags: ["signs", "recognition", "spiritual"]
            },
            {
                title: "10 Common Twin Flame Separation Feelings",
                filename: "10-common-twin-flame-separation-feelings.html",
                category: "twin-flames",
                excerpt: "Learn to understand and manage the complex emotions experienced during twin flame separation with practical coping strategies.",
                readTime: "8 min",
                date: "2025-08-17",
                tags: ["separation", "feelings", "healing"]
            },
            {
                title: "10 Deep Twin Flame Runner Feelings",
                filename: "10-deep-twin-flame-runner-feelings.html",
                category: "twin-flames",
                excerpt: "Deep psychological exploration of twin flame runner emotions and the healing journey toward reunion.",
                readTime: "7 min",
                date: "2025-08-17",
                tags: ["runner", "feelings", "psychology"]
            },

            // Angel Number Articles
            {
                title: "0000 Angel Number Twin Flame Meaning",
                filename: "0000-angel-number-twin-flame.html",
                category: "angel-numbers",
                excerpt: "Discover the profound spiritual significance of 0000 angel number in twin flame relationships, representing new beginnings and divine guidance.",
                readTime: "5 min",
                date: "2025-08-17",
                tags: ["manifestation", "spiritual", "guidance"]
            },
            {
                title: "0707 Angel Number Twin Flame",
                filename: "0707-angel-number-twin-flame.html",
                category: "angel-numbers",
                excerpt: "Explore the spiritual alignment and divine guidance messages of 0707 angel number in your twin flame journey.",
                readTime: "5 min",
                date: "2025-08-17",
                tags: ["spiritual", "guidance", "alignment"]
            },
            {
                title: "0808 Angel Number Twin Flame",
                filename: "0808-angel-number-twin-flame.html",
                category: "angel-numbers",
                excerpt: "Understand the messages of financial prosperity and spiritual growth in twin flame relationships through 0808.",
                readTime: "5 min",
                date: "2025-08-17",
                tags: ["prosperity", "spiritual", "growth"]
            },
            {
                title: "1010 Angel Number Twin Flame",
                filename: "1010-angel-number-twin-flame.html",
                category: "angel-numbers",
                excerpt: "Discover the transformative power of 1010 in twin flame relationships, symbolizing new beginnings and spiritual alignment.",
                readTime: "6 min",
                date: "2025-08-17",
                tags: ["transformation", "spiritual", "alignment"]
            },
            {
                title: "1034 Angel Number Twin Flame",
                filename: "1034-angel-number-twin-flame.html",
                category: "angel-numbers",
                excerpt: "Learn about divine support and spiritual growth guidance in your twin flame journey with angel number 1034.",
                readTime: "5 min",
                date: "2025-08-17",
                tags: ["divine", "support", "growth"]
            },
            {
                title: "1111 Angel Number Twin Flame Meaning",
                filename: "1111-angel-number-twin-flame.html",
                category: "angel-numbers",
                excerpt: "Uncover the spiritual significance of seeing 1111 in your twin flame journey and its manifestation power.",
                readTime: "6 min",
                date: "2025-08-17",
                tags: ["manifestation", "spiritual", "awakening"],
                featured: true
            },
            {
                title: "2222 Angel Number Twin Flame",
                filename: "2222-angel-number-twin-flame.html",
                category: "angel-numbers",
                excerpt: "Explore balance, harmony, and partnership messages from angel number 2222 in twin flame relationships.",
                readTime: "5 min",
                date: "2025-08-17",
                tags: ["balance", "harmony", "partnership"]
            },
            {
                title: "333 Angel Number Twin Flame",
                filename: "333-angel-number-twin-flame.html",
                category: "angel-numbers",
                excerpt: "Discover the divine creativity and spiritual growth signals of 333 in twin flame journeys.",
                readTime: "5 min",
                date: "2025-08-17",
                tags: ["creativity", "spiritual", "growth"]
            },

            // Introversion Articles
            {
                title: "Are Introverts Friendly? Discover the Truth",
                filename: "are-introverts-friendly.html",
                category: "introversion",
                excerpt: "Discover the truth about introvert friendliness and their unique approach to meaningful connections and relationships.",
                readTime: "5 min",
                date: "2025-08-17",
                tags: ["traits", "social", "relationships"]
            },
            {
                title: "How Introverts Can Effectively Communicate",
                filename: "introvert-communication-styles.html",
                category: "introversion",
                excerpt: "Master communication strategies for introverts, leveraging unique strengths in active listening and authentic connections.",
                readTime: "8 min",
                date: "2025-08-17",
                tags: ["communication", "strengths", "workplace"],
                featured: true
            },
            {
                title: "Preventing Introvert Burnout: Energy Management",
                filename: "introvert-energy-management.html",
                category: "introversion",
                excerpt: "Learn essential strategies to manage your social energy and prevent exhaustion while maintaining meaningful connections.",
                readTime: "7 min",
                date: "2025-08-17",
                tags: ["energy", "burnout", "self-care"]
            },
            {
                title: "Introverts in Marketing: Hidden Potential",
                filename: "introvert-workplace-success.html",
                category: "introversion",
                excerpt: "Discover how introverts excel in marketing roles by leveraging analytical skills and authentic relationships.",
                readTime: "6 min",
                date: "2025-08-17",
                tags: ["workplace", "marketing", "strengths"]
            },
            {
                title: "Date Ideas for Introverts: Comfort Guide",
                filename: "introvert-dating-guide.html",
                category: "introversion",
                excerpt: "Comprehensive dating ideas for comfortable, meaningful connections that honor introverted preferences.",
                readTime: "6 min",
                date: "2025-08-17",
                tags: ["dating", "relationships", "comfort"]
            },
            {
                title: "Introvert's Guide: Navigating Parties",
                filename: "introvert-social-survival-guide.html",
                category: "introversion",
                excerpt: "Master the art of socializing at parties while staying true to your introverted nature with practical strategies.",
                readTime: "7 min",
                date: "2025-08-17",
                tags: ["social", "parties", "strategies"]
            },

            // Psychology Articles
            {
                title: "Understanding ISFJ Personality Type",
                filename: "personality-types-guide.html",
                category: "psychology",
                excerpt: "Comprehensive guide to ISFJ personality type covering characteristics, strengths, career paths, and relationships.",
                readTime: "10 min",
                date: "2025-08-17",
                tags: ["personality-types", "ISFJ", "traits"]
            },
            {
                title: "Overly Compliant Behavior Patterns",
                filename: "behavior-patterns-guide.html",
                category: "psychology",
                excerpt: "Recognition of excessive compliance, boundary issues, and building assertiveness for healthier relationships.",
                readTime: "8 min",
                date: "2025-08-17",
                tags: ["behavior", "compliance", "assertiveness"]
            },
            {
                title: "Confident Introverts: Myths & Strengths",
                filename: "psychology-concepts-guide.html",
                category: "psychology",
                excerpt: "Myth-busting exploration of confident introverts, cognitive advantages, and the science of introversion.",
                readTime: "9 min",
                date: "2025-08-17",
                tags: ["confidence", "introversion", "science"]
            },
            {
                title: "Mental Wellness & Burnout Prevention",
                filename: "mental-wellness-guide.html",
                category: "psychology",
                excerpt: "Comprehensive guide to mental wellness, burnout recognition, and effective self-care strategies.",
                readTime: "12 min",
                date: "2025-08-17",
                tags: ["mental-health", "burnout", "wellness"]
            },
            {
                title: "Personality Testing & Assessment Guide",
                filename: "emotional-intelligence-guide.html",
                category: "psychology",
                excerpt: "Historical perspectives, testing methods, interpretation guides, and practical applications of personality assessment.",
                readTime: "11 min",
                date: "2025-08-17",
                tags: ["assessment", "testing", "evaluation"]
            },

            // Relationship Articles
            {
                title: "Thoughtful Dating Ideas for Introverts",
                filename: "relationship-dating-tips.html",
                category: "relationships",
                excerpt: "Thoughtful dating ideas designed for meaningful connections and comfortable romantic experiences.",
                readTime: "7 min",
                date: "2025-08-17",
                tags: ["dating", "romance", "comfort"]
            },
            {
                title: "Understanding Trust & Vulnerability",
                filename: "relationship-communication-guide.html",
                category: "relationships",
                excerpt: "Exploring trust, vulnerability, and emotional intimacy in meaningful relationship communication.",
                readTime: "8 min",
                date: "2025-08-17",
                tags: ["communication", "trust", "intimacy"]
            },
            {
                title: "Signs of Love & Emotional Opening",
                filename: "love-and-romance-guide.html",
                category: "relationships",
                excerpt: "Recognizing signs of love and emotional vulnerability in developing romantic relationships.",
                readTime: "6 min",
                date: "2025-08-17",
                tags: ["love", "romance", "signs"]
            },
            {
                title: "Building Unconditional Love",
                filename: "relationship-compatibility-guide.html",
                category: "relationships",
                excerpt: "Building unconditional love through spiritual growth and deep emotional compatibility.",
                readTime: "9 min",
                date: "2025-08-17",
                tags: ["compatibility", "love", "spiritual"]
            },
            {
                title: "Navigating Relationship Challenges",
                filename: "relationship-challenges-guide.html",
                category: "relationships",
                excerpt: "Understanding and navigating common relationship challenges with practical solutions.",
                readTime: "8 min",
                date: "2025-08-17",
                tags: ["challenges", "solutions", "growth"]
            }
        ];
    }

    getArticlesByCategory(categoryKey) {
        return this.articles.filter(article => article.category === categoryKey);
    }

    getFeaturedArticles() {
        return this.articles.filter(article => article.featured);
    }

    getArticlesByTag(tag) {
        return this.articles.filter(article => article.tags.includes(tag));
    }

    searchArticles(query) {
        const searchTerm = query.toLowerCase();
        return this.articles.filter(article => 
            article.title.toLowerCase().includes(searchTerm) ||
            article.excerpt.toLowerCase().includes(searchTerm) ||
            article.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }

    getArticleStats(categoryKey) {
        const categoryArticles = this.getArticlesByCategory(categoryKey);
        return {
            count: categoryArticles.length,
            avgReadTime: Math.round(
                categoryArticles.reduce((sum, article) => 
                    sum + parseInt(article.readTime), 0) / categoryArticles.length
            )
        };
    }

    getAllCategories() {
        return this.categories;
    }

    generateArticleCard(article) {
        const tagsHtml = article.tags.map(tag => 
            `<span class="article-tag">${tag.charAt(0).toUpperCase() + tag.slice(1).replace('-', ' ')}</span>`
        ).join('');

        return `
            <a href="../posts/${article.filename}" class="article-card" data-tags="${article.tags.join(',')}">
                <div class="article-meta">
                    <span>📅 ${this.formatDate(article.date)}</span>
                    <span>📖 ${article.readTime} read</span>
                </div>
                <h3 class="article-title">${article.title}</h3>
                <p class="article-excerpt">${article.excerpt}</p>
                <div class="article-tags">
                    ${tagsHtml}
                </div>
            </a>
        `;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
}

// Make ArticleRegistry available globally
window.ArticleRegistry = ArticleRegistry;