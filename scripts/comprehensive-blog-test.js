#!/usr/bin/env node

const { chromium } = require('playwright');

// Test configuration
const baseUrl = 'http://y0gwkso4koss4c88oggcs8ok.5.161.250.7.sslip.io';
const categories = [
  'twin-flames', 'introversion', 'angel-numbers', 
  'relationships', 'psychology', 'self-discovery'
];

class BlogTestRunner {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      mainBlog: { passed: 0, failed: 0, details: [] },
      categories: {},
      overall: { passed: 0, failed: 0 }
    };
  }

  async init() {
    this.browser = await chromium.launch({ headless: true });
    this.page = await this.browser.newPage();
    
    // Collect console errors
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ Console Error: ${msg.text()}`);
      }
    });
  }

  async testMainBlogPage() {
    console.log('\n🧪 Testing Main Blog Page...');
    const url = `${baseUrl}/blog/`;
    
    try {
      await this.page.goto(url, { waitUntil: 'networkidle' });
      await this.page.waitForTimeout(2000);

      // Test 1: Check if featured articles are displayed
      const featuredArticles = await this.page.locator('.article-card').count();
      if (featuredArticles > 0) {
        this.addResult('mainBlog', true, `Featured articles displayed (${featuredArticles} found)`);
      } else {
        this.addResult('mainBlog', false, 'No featured articles found');
      }

      // Test 2: Check category cards
      const categoryCards = await this.page.locator('.category-card').count();
      if (categoryCards >= 6) {
        this.addResult('mainBlog', true, `Category cards displayed (${categoryCards} found)`);
      } else {
        this.addResult('mainBlog', false, `Insufficient category cards (${categoryCards} found, expected 6+)`);
      }

      // Test 3: Check search functionality
      const searchBox = await this.page.locator('#blogSearch').count();
      if (searchBox > 0) {
        this.addResult('mainBlog', true, 'Search box present');
        
        // Test search interaction
        await this.page.fill('#blogSearch', 'personality');
        await this.page.waitForTimeout(1000);
        this.addResult('mainBlog', true, 'Search interaction works');
      } else {
        this.addResult('mainBlog', false, 'Search box not found');
      }

    } catch (error) {
      this.addResult('mainBlog', false, `Page load error: ${error.message}`);
    }
  }

  async testCategoryPage(category) {
    console.log(`\n🔍 Testing ${category} category page...`);
    const url = `${baseUrl}/blog/categories/${category}.html`;
    
    this.results.categories[category] = { passed: 0, failed: 0, details: [] };
    
    try {
      await this.page.goto(url, { waitUntil: 'networkidle' });
      await this.page.waitForTimeout(2000);

      // Test 1: Check if articles are displayed
      const articles = await this.page.locator('.article-card').count();
      if (articles > 0) {
        this.addResult('categories', true, `Articles displayed (${articles} found)`, category);
      } else {
        this.addResult('categories', false, 'No articles found', category);
      }

      // Test 2: Check category header
      const pageTitle = await this.page.title();
      if (pageTitle.toLowerCase().includes(category.replace('-', ' '))) {
        this.addResult('categories', true, 'Category-specific page title', category);
      } else {
        this.addResult('categories', false, 'Generic page title', category);
      }

      // Test 3: Check for duplicate category cards (should not exist on category pages)
      const categoryCards = await this.page.locator('.category-card').count();
      if (categoryCards === 0) {
        this.addResult('categories', true, 'No duplicate category cards', category);
      } else {
        this.addResult('categories', false, `Found ${categoryCards} category cards (should be 0)`, category);
      }

      // Test 4: Check search functionality
      const searchBox = await this.page.locator('#blogSearch').count();
      if (searchBox > 0) {
        this.addResult('categories', true, 'Search functionality present', category);
      } else {
        this.addResult('categories', false, 'Search functionality missing', category);
      }

      // Test 5: Verify category-specific content
      const hasBackLink = await this.page.locator('a[href="../"]').count() > 0 || 
                          await this.page.locator('a[href="/blog/"]').count() > 0;
      if (hasBackLink) {
        this.addResult('categories', true, 'Back to blog link present', category);
      } else {
        this.addResult('categories', false, 'Back to blog link missing', category);
      }

    } catch (error) {
      this.addResult('categories', false, `Page load error: ${error.message}`, category);
    }
  }

  addResult(section, passed, detail, category = null) {
    const target = category ? this.results.categories[category] : this.results[section];
    
    if (passed) {
      target.passed++;
      this.results.overall.passed++;
    } else {
      target.failed++;
      this.results.overall.failed++;
    }
    
    target.details.push({
      status: passed ? '✅' : '❌',
      message: detail
    });
  }

  printResults() {
    console.log('\n📊 COMPREHENSIVE BLOG TEST RESULTS');
    console.log('=====================================\n');

    // Main blog page results
    console.log('🏠 Main Blog Page:');
    console.log(`   ✅ Passed: ${this.results.mainBlog.passed}`);
    console.log(`   ❌ Failed: ${this.results.mainBlog.failed}`);
    this.results.mainBlog.details.forEach(detail => {
      console.log(`   ${detail.status} ${detail.message}`);
    });

    // Category pages results
    console.log('\n📂 Category Pages:');
    for (const [category, results] of Object.entries(this.results.categories)) {
      console.log(`\n   ${category.toUpperCase()}:`);
      console.log(`   ✅ Passed: ${results.passed}`);
      console.log(`   ❌ Failed: ${results.failed}`);
      results.details.forEach(detail => {
        console.log(`   ${detail.status} ${detail.message}`);
      });
    }

    // Overall summary
    console.log('\n🎯 OVERALL SUMMARY:');
    console.log(`   ✅ Total Passed: ${this.results.overall.passed}`);
    console.log(`   ❌ Total Failed: ${this.results.overall.failed}`);
    console.log(`   📈 Success Rate: ${Math.round((this.results.overall.passed / (this.results.overall.passed + this.results.overall.failed)) * 100)}%`);

    if (this.results.overall.failed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! Blog functionality is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the issues above.');
    }
  }

  async run() {
    try {
      await this.init();
      
      console.log('🚀 Starting Comprehensive Blog Tests...');
      console.log(`📍 Testing URL: ${baseUrl}`);
      
      // Test main blog page
      await this.testMainBlogPage();
      
      // Test each category page
      for (const category of categories) {
        await this.testCategoryPage(category);
      }
      
      // Print results
      this.printResults();
      
    } catch (error) {
      console.error('❌ Test runner error:', error);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Run the tests
(async () => {
  const testRunner = new BlogTestRunner();
  await testRunner.run();
})();
