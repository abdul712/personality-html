const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const cacheBuster = new Date().getTime();

  page.on('console', msg => console.log(msg.text()));
  page.on('request', request => console.log('>>', request.method(), request.url()));
  page.on('response', response => console.log('<<', response.status(), response.url()));

  await page.goto(`http://y0gwkso4koss4c88oggcs8ok.5.161.250.7.sslip.io/blog/categories/twin-flames.html?v=${cacheBuster}`);
  await page.waitForTimeout(5000);
  const articleCount = await page.locator('.article-card').count();
  console.log(`Found ${articleCount} articles in the twin-flames category.`);

  await browser.close();
})();