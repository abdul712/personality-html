#!/usr/bin/env node

const { chromium } = require('playwright');

async function testLegalPages() {
    console.log('🔍 Testing Legal Pages with Playwright...\n');
    
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    const legalPages = [
        {
            name: 'Privacy Policy',
            url: 'https://www.personalityspark.com/privacy-policy.html',
            expectedTitle: 'Privacy Policy - PersonalitySpark',
            expectedContent: 'Information We Collect'
        },
        {
            name: 'Terms of Service',
            url: 'https://www.personalityspark.com/terms-of-service.html',
            expectedTitle: 'Terms of Service - PersonalitySpark',
            expectedContent: 'Acceptance of Terms'
        },
        {
            name: 'Cookie Policy',
            url: 'https://www.personalityspark.com/cookie-policy.html',
            expectedTitle: 'Cookie Policy - PersonalitySpark',
            expectedContent: 'What Are Cookies'
        },
        {
            name: 'Disclaimer',
            url: 'https://www.personalityspark.com/disclaimer.html',
            expectedTitle: 'Disclaimer - PersonalitySpark',
            expectedContent: 'General Information'
        },
        // Test alternative URL formats
        {
            name: 'Privacy Policy (without .html)',
            url: 'https://www.personalityspark.com/privacy-policy',
            expectedTitle: 'Privacy Policy - PersonalitySpark',
            expectedContent: 'Information We Collect'
        },
        {
            name: 'Terms of Service (without .html)',
            url: 'https://www.personalityspark.com/terms-of-service',
            expectedTitle: 'Terms of Service - PersonalitySpark',
            expectedContent: 'Acceptance of Terms'
        }
    ];
    
    const results = [];
    
    for (const legalPage of legalPages) {
        console.log(`Testing: ${legalPage.name}`);
        console.log(`URL: ${legalPage.url}`);
        
        try {
            // Navigate to the page
            const response = await page.goto(legalPage.url, { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });
            
            // Check HTTP status
            const status = response.status();
            console.log(`Status: ${status}`);
            
            // Get page title
            const title = await page.title();
            console.log(`Title: ${title}`);
            
            // Check if it's the correct page or redirecting to homepage
            const isHomepage = title.includes('PersonalitySpark - Discover Your True Personality');
            const isCorrectPage = title === legalPage.expectedTitle;
            
            // Check for expected content
            const hasExpectedContent = await page.locator(`text=${legalPage.expectedContent}`).count() > 0;
            
            // Check URL after navigation (in case of redirects)
            const finalUrl = page.url();
            
            const result = {
                name: legalPage.name,
                url: legalPage.url,
                finalUrl: finalUrl,
                status: status,
                title: title,
                isCorrectPage: isCorrectPage,
                isHomepage: isHomepage,
                hasExpectedContent: hasExpectedContent,
                success: status === 200 && isCorrectPage && hasExpectedContent && !isHomepage
            };
            
            results.push(result);
            
            if (result.success) {
                console.log('✅ SUCCESS - Page loads correctly');
            } else if (isHomepage) {
                console.log('❌ REDIRECTING TO HOMEPAGE - Page not found');
            } else if (!isCorrectPage) {
                console.log('❌ WRONG PAGE - Title mismatch');
            } else if (!hasExpectedContent) {
                console.log('❌ MISSING CONTENT - Expected content not found');
            } else {
                console.log(`❌ HTTP ERROR - Status ${status}`);
            }
            
        } catch (error) {
            console.log(`❌ ERROR: ${error.message}`);
            results.push({
                name: legalPage.name,
                url: legalPage.url,
                error: error.message,
                success: false
            });
        }
        
        console.log(''); // Empty line for readability
    }
    
    await browser.close();
    
    // Summary
    console.log('='.repeat(60));
    console.log('📊 LEGAL PAGES TEST SUMMARY');
    console.log('='.repeat(60));
    
    const successful = results.filter(r => r.success).length;
    const total = results.length;
    
    console.log(`\n✅ Successful: ${successful}/${total}`);
    console.log(`❌ Failed: ${total - successful}/${total}\n`);
    
    // Detailed results
    results.forEach(result => {
        const status = result.success ? '✅' : '❌';
        console.log(`${status} ${result.name}`);
        if (!result.success) {
            if (result.isHomepage) {
                console.log(`   Issue: Redirecting to homepage instead of legal page`);
            } else if (result.error) {
                console.log(`   Error: ${result.error}`);
            } else {
                console.log(`   Issue: Status ${result.status}, incorrect content`);
            }
        }
    });
    
    console.log('\n📝 NEXT STEPS:');
    if (successful === total) {
        console.log('🎉 All legal pages are working correctly!');
    } else {
        console.log('1. Deploy the legal page files to your server');
        console.log('2. Update nginx configuration if needed');
        console.log('3. Clear CDN/browser cache');
        console.log('4. Re-run this test');
    }
    
    return results;
}

// Run the test
if (require.main === module) {
    testLegalPages().catch(console.error);
}

module.exports = testLegalPages;