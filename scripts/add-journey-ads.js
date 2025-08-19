#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Journey Ad Script
const journeyAdScript = `
    <!-- Journey Ad Script -->
    <script async src="https://tags.journeymv.com/cd1147c1-3ea2-4dea-b685-660b90e8962e/journey.js"></script>
`;

// Journey Ad Placements
const journeyAdPlacements = {
    afterTitle: `
    <!-- Journey Ad - After Title -->
    <div class="ad-container ad-banner">
        <div class="ad-label">Advertisement</div>
        <div id="journey-ad-top" data-journey-unit="top-banner"></div>
    </div>`,
    
    midContent: `
    <!-- Journey Ad - Mid Content -->
    <div class="ad-container ad-banner">
        <div class="ad-label">Advertisement</div>
        <div id="journey-ad-middle" data-journey-unit="mid-content"></div>
    </div>`,
    
    endContent: `
    <!-- Journey Ad - End of Content -->
    <div class="ad-container ad-banner">
        <div class="ad-label">Advertisement</div>
        <div id="journey-ad-bottom" data-journey-unit="bottom-banner"></div>
    </div>`,
    
    sidebar: `
    <!-- Journey Ad - Sidebar -->
    <div class="ad-container ad-square">
        <div class="ad-label">Advertisement</div>
        <div id="journey-ad-sidebar" data-journey-unit="sidebar-square"></div>
    </div>`
};

function processHtmlFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Check if Journey script already exists
        if (content.includes('tags.journeymv.com')) {
            console.log(`✓ ${path.basename(filePath)} - Journey ads already present`);
            return false;
        }
        
        // Remove old Grow.me script if present
        if (content.includes('grow.me')) {
            content = content.replace(
                /<!-- Grow\.me Ad Script -->[\s\S]*?<\/script>/g,
                ''
            );
            modified = true;
        }
        
        // Add Journey script in head (before </head>)
        if (!content.includes('journey.js')) {
            content = content.replace(
                '</head>',
                `${journeyAdScript}\n</head>`
            );
            modified = true;
        }
        
        // Add ad after article title (after first h1 in article-content)
        const h1Match = content.match(/<div class="article-content">[\s\S]*?(<h1[^>]*>[\s\S]*?<\/h1>)/);
        if (h1Match && !content.includes('journey-ad-top')) {
            const h1Full = h1Match[1];
            content = content.replace(
                h1Full,
                `${h1Full}\n${journeyAdPlacements.afterTitle}`
            );
            modified = true;
        }
        
        // Add ad in middle of content (after 3rd h2 or middle of article)
        const h2Matches = content.match(/<h2[^>]*>[\s\S]*?<\/h2>/g);
        if (h2Matches && h2Matches.length >= 3 && !content.includes('journey-ad-middle')) {
            const thirdH2 = h2Matches[2];
            content = content.replace(
                thirdH2,
                `${thirdH2}\n${journeyAdPlacements.midContent}`
            );
            modified = true;
        }
        
        // Add ad at end of content (before closing article-content div)
        if (!content.includes('journey-ad-bottom')) {
            content = content.replace(
                /<\/article>/,
                `${journeyAdPlacements.endContent}\n</article>`
            );
            modified = true;
        }
        
        // Add sidebar ad if sidebar exists
        if (content.includes('article-sidebar') && !content.includes('journey-ad-sidebar')) {
            content = content.replace(
                /<aside class="article-sidebar">/,
                `<aside class="article-sidebar">\n${journeyAdPlacements.sidebar}`
            );
            modified = true;
        }
        
        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ ${path.basename(filePath)} - Journey ads added`);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return false;
    }
}

function main() {
    const postsDir = path.join(__dirname, '..', 'blog', 'posts');
    
    if (!fs.existsSync(postsDir)) {
        console.error('Posts directory not found:', postsDir);
        process.exit(1);
    }
    
    const files = fs.readdirSync(postsDir)
        .filter(file => file.endsWith('.html'))
        .filter(file => !file.startsWith('.!')); // Skip hidden/temp files
    
    console.log(`Found ${files.length} HTML files to process\n`);
    
    let processedCount = 0;
    let skippedCount = 0;
    
    files.forEach(file => {
        const filePath = path.join(postsDir, file);
        if (processHtmlFile(filePath)) {
            processedCount++;
        } else {
            skippedCount++;
        }
    });
    
    console.log('\n=== Summary ===');
    console.log(`✅ Processed: ${processedCount} files`);
    console.log(`✓ Skipped: ${skippedCount} files (already had Journey ads)`);
    console.log(`Total: ${files.length} files`);
    
    if (processedCount > 0) {
        console.log('\n🎉 Journey ads successfully added to blog posts!');
        console.log('Remember to commit and push changes to deploy.');
    }
}

// Run the script
main();