#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to recursively find all HTML files
function findHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            findHtmlFiles(filePath, fileList);
        } else if (path.extname(file) === '.html') {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

// Function to fix legal links in a file
function fixLegalLinks(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Fix relative paths for blog posts (need to go up two levels: ../privacy.html -> ../../privacy-policy.html)
    const replacements = [
        // For files in blog/posts/ (need ../../)
        { from: 'href="../privacy.html"', to: 'href="../../privacy-policy.html"' },
        { from: 'href="../terms.html"', to: 'href="../../terms-of-service.html"' },
        { from: 'href="../cookies.html"', to: 'href="../../cookie-policy.html"' },
        { from: 'href="../disclaimer.html"', to: 'href="../../disclaimer.html"' },
        
        // For files in blog/ (need ../)
        { from: 'href="../privacy.html"', to: 'href="../privacy-policy.html"' },
        { from: 'href="../terms.html"', to: 'href="../terms-of-service.html"' },
        { from: 'href="../cookies.html"', to: 'href="../cookie-policy.html"' },
        
        // For root files
        { from: 'href="/privacy.html"', to: 'href="/privacy-policy.html"' },
        { from: 'href="/terms.html"', to: 'href="/terms-of-service.html"' },
        { from: 'href="/cookies.html"', to: 'href="/cookie-policy.html"' },
        { from: 'href="/disclaimer.html"', to: 'href="/disclaimer.html"' },
        
        // Fix cookies-policy typo
        { from: 'href="/cookies-policy.html"', to: 'href="/cookie-policy.html"' },
        { from: 'href="../cookies-policy.html"', to: 'href="../cookie-policy.html"' },
        { from: 'href="../../cookies-policy.html"', to: 'href="../../cookie-policy.html"' }
    ];
    
    replacements.forEach(replacement => {
        if (content.includes(replacement.from)) {
            content = content.replace(new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement.to);
            hasChanges = true;
        }
    });
    
    return { content, hasChanges };
}

// Main function
function main() {
    console.log('🔧 Fixing legal page links in all HTML files...\n');
    
    const projectRoot = '/Users/abdulrahim/GitHub Projects/personality-html';
    const allHtmlFiles = findHtmlFiles(projectRoot);
    
    let totalFiles = 0;
    let modifiedFiles = 0;
    
    allHtmlFiles.forEach(filePath => {
        // Skip the legal pages themselves
        const fileName = path.basename(filePath);
        if (['privacy-policy.html', 'terms-of-service.html', 'cookie-policy.html', 'disclaimer.html'].includes(fileName)) {
            return;
        }
        
        totalFiles++;
        
        try {
            const result = fixLegalLinks(filePath);
            
            if (result.hasChanges) {
                fs.writeFileSync(filePath, result.content);
                modifiedFiles++;
                console.log(`✅ Updated: ${path.relative(projectRoot, filePath)}`);
            }
        } catch (error) {
            console.log(`❌ Error processing ${filePath}: ${error.message}`);
        }
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`- Total HTML files checked: ${totalFiles}`);
    console.log(`- Files modified: ${modifiedFiles}`);
    console.log(`- Files unchanged: ${totalFiles - modifiedFiles}`);
    
    if (modifiedFiles > 0) {
        console.log('\n✅ All legal page links have been updated!');
        console.log('📋 Next steps:');
        console.log('1. Commit the changes to git');
        console.log('2. Deploy to Coolify with force redeploy');
        console.log('3. Test the legal pages again');
    } else {
        console.log('\n✅ No files needed updating - all legal links are already correct!');
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { findHtmlFiles, fixLegalLinks };