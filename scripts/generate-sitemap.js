const fs = require('fs');
const path = require('path');

function generateSitemap() {
    const baseUrl = 'https://personalityspark.com';
    const sitemapUrls = [];
    
    // Add main pages
    sitemapUrls.push({
        url: baseUrl,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority: '1.0'
    });
    
    sitemapUrls.push({
        url: `${baseUrl}/blog/`,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority: '0.9'
    });
    
    // Add category pages
    const categories = [
        'twin-flames',
        'angel-numbers', 
        'introversion',
        'psychology',
        'relationships',
        'self-discovery'
    ];
    
    categories.forEach(category => {
        sitemapUrls.push({
            url: `${baseUrl}/blog/categories/${category}.html`,
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: '0.8'
        });
    });
    
    // Find all HTML files in root and blog/posts
    function findHtmlFiles(dir, urlPrefix = '') {
        const files = fs.readdirSync(dir);
        
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory() && !file.startsWith('.') && file !== 'dist' && file !== 'node_modules') {
                // Skip certain directories
                if (['blog', 'css', 'js', 'assets', 'scripts', '.git', '.wrangler'].includes(file)) {
                    return;
                }
                findHtmlFiles(filePath, `${urlPrefix}/${file}`);
            } else if (file.endsWith('.html') && file !== 'index.html' && file !== '404.html') {
                const filename = file.replace('.html', '');
                sitemapUrls.push({
                    url: `${baseUrl}${urlPrefix}/${filename}`,
                    lastmod: new Date().toISOString().split('T')[0],
                    changefreq: 'weekly',
                    priority: '0.7'
                });
            }
        });
    }
    
    // Find HTML files in root directory
    findHtmlFiles('./');
    
    // Find HTML files in blog/posts directory
    if (fs.existsSync('./blog/posts')) {
        findHtmlFiles('./blog/posts', '');
    }
    
    // Generate XML sitemap
    let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;
    
    sitemapUrls.forEach(item => {
        sitemapXml += `  <url>
    <loc>${item.url}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>
`;
    });
    
    sitemapXml += `</urlset>`;
    
    // Write sitemap
    fs.writeFileSync('./sitemap.xml', sitemapXml);
    console.log(`Generated sitemap with ${sitemapUrls.length} URLs`);
    
    return sitemapUrls.length;
}

// Run if called directly
if (require.main === module) {
    generateSitemap();
}

module.exports = { generateSitemap };