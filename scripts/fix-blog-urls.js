#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fix all blog URLs to use root-level format
function fixBlogUrls() {
    const directories = [
        path.join(__dirname, '..', 'blog', 'posts'),
        path.join(__dirname, '..', 'blog', 'categories'),
        path.join(__dirname, '..', 'blog'),
        path.join(__dirname, '..')
    ];
    
    let totalFixed = 0;
    
    directories.forEach(dir => {
        if (!fs.existsSync(dir)) return;
        
        const files = fs.readdirSync(dir)
            .filter(file => file.endsWith('.html') || file.endsWith('.js'))
            .filter(file => !file.startsWith('.!'));
        
        files.forEach(file => {
            const filePath = path.join(dir, file);
            let content = fs.readFileSync(filePath, 'utf8');
            let modified = false;
            
            // Fix various URL patterns
            const replacements = [
                // Fix href links
                [/href="\/blog\/posts\/([^"]+\.html)"/g, 'href="/$1"'],
                [/href='\/blog\/posts\/([^']+\.html)'/g, "href='/$1'"],
                
                // Fix canonical URLs
                [/rel="canonical" href="\/blog\/posts\/([^"]+)"/g, 'rel="canonical" href="/$1"'],
                
                // Fix og:url and other meta tags
                [/content="https:\/\/personalityspark\.com\/blog\/posts\/([^"]+)"/g, 'content="https://personalityspark.com/$1"'],
                [/content="http:\/\/personalityspark\.com\/blog\/posts\/([^"]+)"/g, 'content="https://personalityspark.com/$1"'],
                
                // Fix JavaScript references
                [/['"]\/blog\/posts\/([^'"]+\.html)['"]/g, '"/$1"'],
                
                // Fix relative paths in blog directory
                [/href="\.\.\/posts\/([^"]+\.html)"/g, 'href="/$1"'],
                [/href="posts\/([^"]+\.html)"/g, 'href="/$1"'],
                
                // Fix sitemap and other references
                [/<loc>https:\/\/personalityspark\.com\/blog\/posts\/([^<]+)<\/loc>/g, '<loc>https://personalityspark.com/$1</loc>'],
                [/<loc>https:\/\/www\.personalityspark\.com\/blog\/posts\/([^<]+)<\/loc>/g, '<loc>https://www.personalityspark.com/$1</loc>'],
            ];
            
            replacements.forEach(([pattern, replacement]) => {
                const newContent = content.replace(pattern, replacement);
                if (newContent !== content) {
                    content = newContent;
                    modified = true;
                }
            });
            
            if (modified) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`✅ Fixed URLs in: ${file}`);
                totalFixed++;
            }
        });
    });
    
    return totalFixed;
}

// Update sitemap if it exists
function updateSitemap() {
    const sitemapPath = path.join(__dirname, '..', 'sitemap.xml');
    if (fs.existsSync(sitemapPath)) {
        let content = fs.readFileSync(sitemapPath, 'utf8');
        
        // Fix blog post URLs in sitemap
        content = content.replace(
            /<loc>https:\/\/personalityspark\.com\/blog\/posts\/([^<]+)<\/loc>/g,
            '<loc>https://personalityspark.com/$1</loc>'
        );
        content = content.replace(
            /<loc>https:\/\/www\.personalityspark\.com\/blog\/posts\/([^<]+)<\/loc>/g,
            '<loc>https://www.personalityspark.com/$1</loc>'
        );
        
        fs.writeFileSync(sitemapPath, content, 'utf8');
        console.log('✅ Updated sitemap.xml');
    }
}

// Update article registry if it exists
function updateArticleRegistry() {
    const registryPath = path.join(__dirname, '..', 'blog', 'js', 'article-registry.js');
    if (fs.existsSync(registryPath)) {
        let content = fs.readFileSync(registryPath, 'utf8');
        
        // Fix URLs in article registry
        content = content.replace(/url: '\/blog\/posts\//g, "url: '/");
        content = content.replace(/url: "\/blog\/posts\//g, 'url: "/');
        
        fs.writeFileSync(registryPath, content, 'utf8');
        console.log('✅ Updated article-registry.js');
    }
}

// Main execution
console.log('🔧 Fixing blog URLs to use root-level format...\n');

const fixedCount = fixBlogUrls();
updateSitemap();
updateArticleRegistry();

console.log('\n=== Summary ===');
console.log(`✅ Fixed ${fixedCount} files`);
console.log('✅ All blog URLs now use root format: /article-name.html');
console.log('\nOld format: article.html');
console.log('New format: /article.html');
console.log('\n🎉 URL structure permanently fixed!');
console.log('\nRemember to:');
console.log('1. Commit these changes');
console.log('2. Push to GitHub');
console.log('3. Redeploy on Coolify');
console.log('4. Clear Cloudflare cache');