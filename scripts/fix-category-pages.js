#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Category configurations
const categories = {
  'twin-flames': {
    title: 'Twin Flame Articles - PersonalitySpark Blog',
    description: 'Explore comprehensive articles on twin flame relationships, spiritual connections, separation, reunion, and awakening. Expert insights on twin flame runner, chaser dynamics, and divine love.',
    keywords: 'twin flame articles, twin flame relationship, spiritual connection, twin flame separation, twin flame reunion, twin flame runner, twin flame chaser, divine love, soul connection',
    icon: '💫',
    heading: 'Twin Flames & Spiritual Connections',
    subtitle: 'Explore the mystical world of twin flame relationships, separation, reunion, and spiritual awakening. Discover deep insights into the sacred journey of twin souls and divine connections.',
    searchPlaceholder: 'Search twin flame articles...',
    sectionTitle: 'Twin Flame Articles',
    categoryKey: 'twin-flames'
  },
  'introversion': {
    title: 'Introversion & Personality Articles - PersonalitySpark Blog',
    description: 'Comprehensive articles on introversion, personality types, communication styles, workplace success, and social strategies. Expert insights for introverts and personality development.',
    keywords: 'introversion articles, introvert personality, personality types, introvert communication, workplace success, social strategies, MBTI, personality development',
    icon: '🤫',
    heading: 'Introversion & Personality Types',
    subtitle: 'Deep insights into introversion, personality traits, communication styles, and workplace success. Discover how to thrive as an introvert in various life situations.',
    searchPlaceholder: 'Search introversion articles...',
    sectionTitle: 'Introversion Articles',
    categoryKey: 'introversion'
  },
  'angel-numbers': {
    title: 'Angel Numbers & Spirituality Articles - PersonalitySpark Blog',
    description: 'Comprehensive articles on angel numbers, spiritual meanings, divine guidance, and numerology. Decode the messages from the universe through sacred number sequences.',
    keywords: 'angel numbers articles, spiritual numbers, numerology, divine guidance, angel number meanings, spiritual awakening, sacred numbers',
    icon: '🔢',
    heading: 'Angel Numbers & Spirituality',
    subtitle: 'Decode the meanings behind angel numbers and their spiritual significance in your life. Discover divine guidance through sacred number sequences.',
    searchPlaceholder: 'Search angel number articles...',
    sectionTitle: 'Angel Number Articles',
    categoryKey: 'angel-numbers'
  },
  'relationships': {
    title: 'Relationships & Love Articles - PersonalitySpark Blog',
    description: 'Comprehensive articles on relationships, dating advice, love compatibility, and communication. Expert insights on building meaningful connections and lasting love.',
    keywords: 'relationships articles, dating advice, love compatibility, relationship communication, dating tips, love advice, relationship guidance',
    icon: '💕',
    heading: 'Relationships & Love',
    subtitle: 'Navigate the complexities of relationships, dating, and finding meaningful connections. Expert guidance on love, communication, and building lasting bonds.',
    searchPlaceholder: 'Search relationship articles...',
    sectionTitle: 'Relationship Articles',
    categoryKey: 'relationships'
  },
  'psychology': {
    title: 'Psychology & Mental Health Articles - PersonalitySpark Blog',
    description: 'Comprehensive articles on psychology, mental health, personality types, and behavioral science. Expert insights on understanding the human mind and emotional wellbeing.',
    keywords: 'psychology articles, mental health, personality types, behavioral science, emotional intelligence, psychology concepts, mental wellbeing',
    icon: '🧠',
    heading: 'Psychology & Mental Health',
    subtitle: 'Understand the human mind, emotions, and strategies for maintaining mental wellness. Explore psychology concepts and behavioral insights.',
    searchPlaceholder: 'Search psychology articles...',
    sectionTitle: 'Psychology Articles',
    categoryKey: 'psychology'
  },
  'self-discovery': {
    title: 'Self-Discovery & Growth Articles - PersonalitySpark Blog',
    description: 'Comprehensive articles on self-discovery, personal growth, mindfulness, and transformation. Expert insights on finding your true self and achieving personal development.',
    keywords: 'self-discovery articles, personal growth, mindfulness, transformation, self-awareness, personal development, spiritual growth',
    icon: '🌱',
    heading: 'Self-Discovery & Growth',
    subtitle: 'Embark on a journey of personal growth, self-awareness, and discovering your true potential. Transform your life through mindful self-discovery.',
    searchPlaceholder: 'Search self-discovery articles...',
    sectionTitle: 'Self-Discovery Articles',
    categoryKey: 'self-discovery'
  }
};

function createCategoryPageContent(categoryKey, config) {
  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.title}</title>
    <meta name="description" content="${config.description}">
    <meta name="keywords" content="${config.keywords}">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${config.title}">
    <meta property="og:description" content="${config.description}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://personalityspark.com/blog/categories/${categoryKey}.html">
    <meta property="og:image" content="https://personalityspark.com/assets/icons/icon-512.png">
    
    <link rel="stylesheet" href="../../css/main.css">
    <link rel="icon" type="image/svg+xml" href="../../assets/icons/favicon.svg">
    <link rel="canonical" href="https://personalityspark.com/blog/categories/${categoryKey}.html">
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar">
        <div class="nav-container">
            <a href="../../" class="nav-logo">
                <span class="logo-icon">✨</span>
                PersonalitySpark
            </a>
            <div class="nav-links">
                <a href="../../#home" class="nav-link">Home</a>
                <a href="../../#quizzes" class="nav-link">Quizzes</a>
                <a href="/blog" class="nav-link active">Blog</a>
                <a href="../../#about" class="nav-link">About</a>
                <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">
                    <span class="theme-icon">🌙</span>
                </button>
            </div>
            <button class="mobile-menu-toggle" id="mobileMenuToggle" aria-label="Toggle menu">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>
    </nav>

    <!-- Category-Specific Hero Section -->
    <section class="category-specific-header">
        <div class="container">
            <div class="category-breadcrumb">
                <a href="../">Blog</a> / ${config.heading}
            </div>
            <div class="category-icon">${config.icon}</div>
            <h1>${config.heading}</h1>
            <p>${config.subtitle}</p>
        </div>
    </section>

    <!-- Search Section -->
    <section class="container search-section">
        <h2 style="margin-bottom: var(--spacing-4); color: var(--text-primary);">${config.sectionTitle} Search</h2>
        <div class="search-box">
            <input type="text" class="search-input" placeholder="${config.searchPlaceholder}" id="blogSearch">
        </div>
    </section>

    <!-- Articles Section -->
    <section class="container featured-posts">
        <h2>${config.sectionTitle}</h2>
        <div class="posts-grid" id="postsGrid">
            <!-- Articles will be loaded dynamically -->
        </div>
    </section>

    <script src="../js/article-registry.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const articleRegistry = new ArticleRegistry();
            const postsGrid = document.getElementById('postsGrid');

            const articles = articleRegistry.getArticlesByCategory('${config.categoryKey}');
            console.log('Found articles for ${config.categoryKey}:', articles.length);

            if (articles.length === 0) {
                postsGrid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); font-size: var(--font-size-lg); margin: var(--spacing-8) 0;">No articles found in this category yet. Check back soon for new content!</p>';
            } else {
                articles.forEach(article => {
                    const articleCard = articleRegistry.generateArticleCard(article);
                    postsGrid.innerHTML += articleCard;
                });
            }
        });
    </script>

    <!-- Newsletter Signup -->
    <section class="container" style="text-align: center; padding: var(--spacing-12) 0;">
        <div style="background: var(--bg-secondary); padding: var(--spacing-8); border-radius: var(--radius-lg); max-width: 600px; margin: 0 auto;">
            <h3 style="color: var(--text-primary); margin-bottom: var(--spacing-4);">Stay Updated</h3>
            <p style="color: var(--text-secondary); margin-bottom: var(--spacing-6);">Get the latest insights on personality, spirituality, and self-discovery delivered to your inbox.</p>
            <div style="display: flex; gap: var(--spacing-3); flex-wrap: wrap; justify-content: center;">
                <input type="email" placeholder="Enter your email" style="flex: 1; min-width: 250px; padding: var(--spacing-3); border: 1px solid var(--gray-300); border-radius: var(--radius-md); background: var(--bg-primary); color: var(--text-primary);">
                <button class="btn btn-primary">Subscribe</button>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h4>PersonalitySpark Blog</h4>
                    <p>Your trusted source for personality insights, spiritual growth, and self-discovery.</p>
                </div>
                <div class="footer-section">
                    <h4>Categories</h4>
                    <ul class="footer-links">
                        <li><a href="twin-flames.html">Twin Flames</a></li>
                        <li><a href="introversion.html">Introversion</a></li>
                        <li><a href="angel-numbers.html">Angel Numbers</a></li>
                        <li><a href="relationships.html">Relationships</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Quick Links</h4>
                    <ul class="footer-links">
                        <li><a href="../../#home">Home</a></li>
                        <li><a href="../../#quizzes">Personality Tests</a></li>
                        <li><a href="../../#about">About</a></li>
                        <li><a href="../../#contact">Contact</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 PersonalitySpark. All rights reserved. | <a href="../../privacy.html">Privacy Policy</a> | <a href="../../terms.html">Terms of Service</a></p>
            </div>
        </div>
    </footer>

    <script>
        // Blog search functionality
        document.getElementById('blogSearch').addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const articleCards = document.querySelectorAll('.article-card');
            
            articleCards.forEach(card => {
                const title = card.querySelector('.article-title').textContent.toLowerCase();
                const excerpt = card.querySelector('.article-excerpt').textContent.toLowerCase();
                const tags = card.getAttribute('data-tags').toLowerCase();
                
                if (title.includes(searchTerm) || excerpt.includes(searchTerm) || tags.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });

        // Initialize theme
        const savedTheme = localStorage.getItem('personality-spark-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Update theme toggle icon
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const themeIcon = themeToggle.querySelector('.theme-icon');
            if (themeIcon) {
                themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
            }
        }

        // Theme toggle functionality
        if (themeToggle) {
            themeToggle.addEventListener('click', function() {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('personality-spark-theme', newTheme);
                
                const themeIcon = this.querySelector('.theme-icon');
                if (themeIcon) {
                    themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
                }
            });
        }
    </script>
</body>
</html>`;
}

// Generate and write all category pages
const blogCategoriesDir = path.join(__dirname, '..', 'blog', 'categories');

Object.keys(categories).forEach(categoryKey => {
  const config = categories[categoryKey];
  const content = createCategoryPageContent(categoryKey, config);
  const filePath = path.join(blogCategoriesDir, `${categoryKey}.html`);
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Generated ${categoryKey}.html`);
});

console.log('🎉 All category pages have been generated successfully!');