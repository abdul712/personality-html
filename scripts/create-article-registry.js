

const fs = require('fs');
const path = require('path');

const postsDir = path.resolve(__dirname, '../blog/posts');
const registryFile = path.resolve(__dirname, '../blog/js/article-registry.js');

const articles = [];

fs.readdirSync(postsDir).forEach(file => {
  if (file.endsWith('.html')) {
    const filePath = path.join(postsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const titleMatch = content.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1] : 'No Title';

    const excerptMatch = content.match(/<meta name="description" content="(.*?)"/);
    const excerpt = excerptMatch ? excerptMatch[1] : 'No Excerpt';

    const readTimeMatch = content.match(/<meta name="twitter:data1" content="(.*?)"/);
    const readTime = readTimeMatch ? readTimeMatch[1] : '5 min';

    const categoryMatch = content.match(/<meta property="article:section" content="(.*?)"/);
    const category = categoryMatch ? categoryMatch[1] : 'uncategorized';

    const tagsMatch = content.match(/<meta name="keywords" content="(.*?)"/);
    const tags = tagsMatch ? tagsMatch[1].split(',').map(tag => tag.trim()) : [];

    articles.push({
      title,
      filename: file,
      category: category, // Use the extracted category
      excerpt,
      readTime,
      date: '2025-08-17',
      tags,
      featured: false 
    });
  }
});

const generateArticleCard = function(article) {
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

const formatDate = function(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
  });
}

const registryContent = `
class ArticleRegistry {
    constructor() {
        this.articles = ${JSON.stringify(articles, null, 4)};
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

    generateArticleCard = ${generateArticleCard.toString()}

    formatDate = ${formatDate.toString()}
}

// Make ArticleRegistry available globally
if (typeof window !== 'undefined') {
  window.ArticleRegistry = ArticleRegistry;
}
`;

fs.writeFileSync(registryFile, registryContent);

console.log('Article registry created successfully.');
