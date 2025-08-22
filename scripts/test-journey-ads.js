#!/usr/bin/env node

const { chromium } = require('playwright');

async function testJourneyAds() {
    console.log('🎯 Testing Journey Ads Across Website...\n');
    
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    const testPages = [
        {
            name: 'Homepage',
            url: 'https://www.personalityspark.com/',
            type: 'main'
        },
        {
            name: 'Blog Index',
            url: 'https://www.personalityspark.com/blog/',
            type: 'blog'
        },
        {
            name: 'Privacy Policy',
            url: 'https://www.personalityspark.com/privacy-policy.html',
            type: 'legal'
        },
        {
            name: 'Terms of Service',
            url: 'https://www.personalityspark.com/terms-of-service.html',
            type: 'legal'
        },
        // Test random blog articles
        {
            name: 'Twin Flame Article 1',
            url: 'https://www.personalityspark.com/13-signs-of-a-twin-flame.html',
            type: 'article'
        },
        {
            name: 'Twin Flame Article 2',
            url: 'https://www.personalityspark.com/what-is-twin-flame-separation.html',
            type: 'article'
        },
        {
            name: 'Introvert Article 1',
            url: 'https://www.personalityspark.com/signs-youre-an-introvert.html',
            type: 'article'
        },
        {
            name: 'Angel Number Article',
            url: 'https://www.personalityspark.com/888-angel-number-abundance.html',
            type: 'article'
        },
        {
            name: 'Psychology Article',
            url: 'https://www.personalityspark.com/building-trust-after-betrayal.html',
            type: 'article'
        }
    ];
    
    const results = [];
    
    for (const testPage of testPages) {
        console.log(`Testing: ${testPage.name}`);
        console.log(`URL: ${testPage.url}`);
        console.log(`Type: ${testPage.type}`);
        
        try {
            // Navigate to the page
            const response = await page.goto(testPage.url, { 
                waitUntil: 'networkidle',
                timeout: 30000 
            });
            
            // Check HTTP status
            const status = response.status();
            console.log(`Status: ${status}`);
            
            if (status !== 200) {
                console.log(`❌ PAGE ERROR - HTTP ${status}`);
                results.push({
                    name: testPage.name,
                    url: testPage.url,
                    type: testPage.type,
                    status: status,
                    hasJourneyScript: false,
                    hasJourneyElements: false,
                    error: `HTTP ${status}`
                });
                console.log('');
                continue;
            }
            
            // Wait a moment for ads to potentially load
            await page.waitForTimeout(3000);
            
            // Check for Journey script in the page
            const hasJourneyScript = await page.evaluate(() => {
                const scripts = Array.from(document.querySelectorAll('script'));
                return scripts.some(script => 
                    script.src && script.src.includes('journeymv.com') || 
                    script.src && script.src.includes('cd1147c1-3ea2-4dea-b685-660b90e8962e')
                );
            });
            
            // Check for Journey-specific elements or content
            const journeyElements = await page.evaluate(() => {
                const elements = [];
                
                // Look for Journey-specific elements
                const journeyDivs = document.querySelectorAll('[class*="journey"], [id*="journey"]');
                const adDivs = document.querySelectorAll('[class*="ad"], [id*="ad"]');
                
                elements.push({
                    journeyDivs: journeyDivs.length,
                    adDivs: adDivs.length
                });
                
                // Check for iframe ads
                const iframes = document.querySelectorAll('iframe');
                const adIframes = Array.from(iframes).filter(iframe => {
                    return iframe.src && (
                        iframe.src.includes('journey') || 
                        iframe.src.includes('ad') ||
                        iframe.src.includes('doubleclick') ||
                        iframe.src.includes('googlesyndication')
                    );
                });
                
                elements.push({
                    totalIframes: iframes.length,
                    adIframes: adIframes.length
                });
                
                return elements;
            });
            
            // Check network requests for Journey
            const journeyRequests = [];
            page.on('request', request => {
                const url = request.url();
                if (url.includes('journeymv.com') || url.includes('cd1147c1-3ea2-4dea-b685-660b90e8962e')) {
                    journeyRequests.push(url);
                }
            });
            
            // Check page content for Journey script tags
            const pageContent = await page.content();
            const hasJourneyInContent = pageContent.includes('journeymv.com') || 
                                      pageContent.includes('cd1147c1-3ea2-4dea-b685-660b90e8962e');
            
            // Count ad placements in articles
            let adPlacements = 0;
            if (testPage.type === 'article') {
                adPlacements = await page.evaluate(() => {
                    const comments = [];
                    const walker = document.createTreeWalker(
                        document.body,
                        NodeFilter.SHOW_COMMENT
                    );
                    
                    let node;
                    while (node = walker.nextNode()) {
                        if (node.nodeValue.includes('Journey Ad') || node.nodeValue.includes('journey')) {
                            comments.push(node.nodeValue.trim());
                        }
                    }
                    return comments.length;
                });
            }
            
            const result = {
                name: testPage.name,
                url: testPage.url,
                type: testPage.type,
                status: status,
                hasJourneyScript: hasJourneyScript,
                hasJourneyInContent: hasJourneyInContent,
                journeyElements: journeyElements,
                adPlacements: adPlacements,
                journeyRequests: journeyRequests.length,
                success: hasJourneyScript || hasJourneyInContent || adPlacements > 0
            };
            
            results.push(result);
            
            if (result.success) {
                console.log('✅ JOURNEY ADS DETECTED');
                if (hasJourneyScript) console.log('  - Journey script found');
                if (hasJourneyInContent) console.log('  - Journey content found');
                if (adPlacements > 0) console.log(`  - ${adPlacements} ad placements found`);
            } else {
                console.log('❌ NO JOURNEY ADS DETECTED');
                console.log('  - No Journey script found');
                console.log('  - No Journey content found');
                console.log('  - No ad placements found');
            }
            
        } catch (error) {
            console.log(`❌ ERROR: ${error.message}`);
            results.push({
                name: testPage.name,
                url: testPage.url,
                type: testPage.type,
                error: error.message,
                hasJourneyScript: false,
                hasJourneyElements: false
            });
        }
        
        console.log(''); // Empty line for readability
    }
    
    await browser.close();
    
    // Summary
    console.log('='.repeat(60));
    console.log('📊 JOURNEY ADS TEST SUMMARY');
    console.log('='.repeat(60));
    
    const successful = results.filter(r => r.success).length;
    const total = results.length;
    const articles = results.filter(r => r.type === 'article');
    const articlesWithAds = articles.filter(r => r.success);
    
    console.log(`\n✅ Pages with Journey Ads: ${successful}/${total}`);
    console.log(`📝 Articles with Ads: ${articlesWithAds.length}/${articles.length}`);
    console.log(`❌ Pages without Ads: ${total - successful}/${total}\n`);
    
    // Detailed results by type
    const pageTypes = ['main', 'blog', 'legal', 'article'];
    pageTypes.forEach(type => {
        const typePages = results.filter(r => r.type === type);
        const typeSuccess = typePages.filter(r => r.success).length;
        
        if (typePages.length > 0) {
            console.log(`📄 ${type.toUpperCase()} PAGES: ${typeSuccess}/${typePages.length}`);
            typePages.forEach(result => {
                const status = result.success ? '✅' : '❌';
                console.log(`   ${status} ${result.name}`);
                if (result.type === 'article' && result.success) {
                    console.log(`      - Ad placements: ${result.adPlacements}`);
                }
                if (result.error) {
                    console.log(`      - Error: ${result.error}`);
                }
            });
            console.log('');
        }
    });
    
    console.log('📝 NEXT STEPS:');
    if (successful === total) {
        console.log('🎉 All pages have Journey ads working correctly!');
    } else {
        console.log('⚠️  Some pages are missing Journey ads:');
        console.log('1. Check if Journey scripts are properly included');
        console.log('2. Verify Journey Site ID: cd1147c1-3ea2-4dea-b685-660b90e8962e');
        console.log('3. Contact Journey support if ads are not displaying');
        console.log('4. Check browser console for any JavaScript errors');
    }
    
    return results;
}

// Run the test
if (require.main === module) {
    testJourneyAds().catch(console.error);
}

module.exports = testJourneyAds;