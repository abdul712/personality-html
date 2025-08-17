#!/usr/bin/env node

// Quick test script to verify blog functionality
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Blog Functionality...\n');

// Test 1: Check if CSS contains article card styles
const cssPath = path.join(__dirname, '..', 'css', 'main.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

if (cssContent.includes('.article-card') && cssContent.includes('.article-title') && cssContent.includes('.article-meta')) {
    console.log('✅ Article card styles are present in CSS');
} else {
    console.log('❌ Article card styles missing in CSS');
}

// Test 2: Check if article registry has proper path handling
const registryPath = path.join(__dirname, '..', 'blog', 'js', 'article-registry.js');
const registryContent = fs.readFileSync(registryPath, 'utf8');

if (registryContent.includes('window.location.pathname.includes(\'/categories/\')')) {
    console.log('✅ Article registry has dynamic path handling');
} else {
    console.log('❌ Article registry missing dynamic path handling');
}

// Test 3: Check category pages structure
const categoriesDir = path.join(__dirname, '..', 'blog', 'categories');
const categories = ['twin-flames', 'introversion', 'angel-numbers', 'relationships', 'psychology', 'self-discovery'];

let allCategoriesPassed = true;
categories.forEach(category => {
    const categoryPath = path.join(categoriesDir, `${category}.html`);
    if (fs.existsSync(categoryPath)) {
        const content = fs.readFileSync(categoryPath, 'utf8');
        
        // Check for category-specific elements
        const hasSpecificHeader = content.includes('category-specific-header');
        const hasCorrectScript = content.includes(`articleRegistry.getArticlesByCategory('${category}')`);
        const hasSearchFunctionality = content.includes('getElementById(\'blogSearch\')');
        
        if (hasSpecificHeader && hasCorrectScript && hasSearchFunctionality) {
            console.log(`✅ ${category}.html has correct structure`);
        } else {
            console.log(`❌ ${category}.html has issues:`);
            if (!hasSpecificHeader) console.log(`   - Missing category-specific header`);
            if (!hasCorrectScript) console.log(`   - Missing correct category filter script`);
            if (!hasSearchFunctionality) console.log(`   - Missing search functionality`);
            allCategoriesPassed = false;
        }
    } else {
        console.log(`❌ ${category}.html does not exist`);
        allCategoriesPassed = false;
    }
});

// Test 4: Check main blog page
const blogIndexPath = path.join(__dirname, '..', 'blog', 'index.html');
const blogIndexContent = fs.readFileSync(blogIndexPath, 'utf8');

if (blogIndexContent.includes('getFeaturedArticles()') && blogIndexContent.includes('getElementById(\'blogSearch\')')) {
    console.log('✅ Main blog page has correct article loading and search');
} else {
    console.log('❌ Main blog page has issues');
}

// Summary
console.log('\n📊 Test Summary:');
if (allCategoriesPassed) {
    console.log('🎉 All tests passed! Blog functionality should be working correctly.');
} else {
    console.log('⚠️  Some tests failed. Please check the issues above.');
}

console.log('\n🔍 Next steps:');
console.log('1. Test the blog pages in a browser');
console.log('2. Verify article cards display properly');
console.log('3. Test category filtering works');
console.log('4. Test search functionality');
console.log('5. Check console for any JavaScript errors');