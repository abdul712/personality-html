const fs = require('fs');
const path = require('path');

// Get all HTML files in the root directory
const rootDir = './';
const files = fs.readdirSync(rootDir).filter(file => {
  return file.endsWith('.html') && !file.startsWith('.');
});

// Filter for blog posts (excluding main site pages)
const excludeFiles = ['index.html', '404.html', 'privacy.html', 'terms.html'];
const blogPosts = files.filter(file => !excludeFiles.includes(file));

// Categorize posts
const categories = {
  twinFlames: [],
  angelNumbers: [],
  introversion: [],
  relationships: [],
  psychology: []
};

blogPosts.forEach(file => {
  const filename = file.toLowerCase();
  
  if (filename.includes('twin-flame') || filename.includes('twin_flame') ||
      filename.includes('runner') || filename.includes('chaser') || 
      filename.includes('separation') || filename.includes('reunion') ||
      filename.includes('mirror-soul') || filename.includes('kundalini') ||
      filename.includes('divine-masculine') || filename.includes('divine-timing') ||
      filename.includes('sacred-feminine') || filename.includes('soul-contract')) {
    categories.twinFlames.push(file);
  } else if (filename.match(/\d{3,4}-angel-number/) || 
             filename.includes('angel-number') || 
             filename.includes('angel_number') ||
             filename.includes('master-number')) {
    categories.angelNumbers.push(file);
  } else if (filename.includes('introvert')) {
    categories.introversion.push(file);
  } else if (filename.includes('relationship') || filename.includes('dating') ||
             filename.includes('love') || filename.includes('romance') ||
             filename.includes('marriage') || filename.includes('attachment') ||
             filename.includes('trust') || filename.includes('boundaries')) {
    categories.relationships.push(file);
  } else if (filename.includes('psychology') || filename.includes('personality-type') ||
             filename.includes('mental') || filename.includes('emotional') ||
             filename.includes('cognitive') || filename.includes('behavior') ||
             filename.match(/^(infj|infp|intj|intp|isfj|isfp|istj|istp|enfj|enfp|entj|entp|esfj|esfp|estj|estp)-/)) {
    categories.psychology.push(file);
  }
});

// Generate sitemap XML
let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    <!-- Main Pages -->
    <url>
        <loc>https://www.personalityspark.com/</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://www.personalityspark.com/blog/</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>
`;

// Function to add URL entries
const addUrlEntry = (file, priority = 0.8) => {
  return `    <url>
        <loc>https://www.personalityspark.com/${file}</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>${priority}</priority>
    </url>
`;
};

// Add Twin Flames posts
if (categories.twinFlames.length > 0) {
  sitemap += `    
    <!-- Twin Flames & Spiritual Connections (${categories.twinFlames.length} articles) -->
`;
  categories.twinFlames.sort().forEach(file => {
    sitemap += addUrlEntry(file);
  });
}

// Add Angel Numbers posts
if (categories.angelNumbers.length > 0) {
  sitemap += `    
    <!-- Angel Numbers & Spiritual Guidance (${categories.angelNumbers.length} articles) -->
`;
  categories.angelNumbers.sort().forEach(file => {
    sitemap += addUrlEntry(file);
  });
}

// Add Introversion posts
if (categories.introversion.length > 0) {
  sitemap += `    
    <!-- Introversion & Personality Traits (${categories.introversion.length} articles) -->
`;
  categories.introversion.sort().forEach(file => {
    sitemap += addUrlEntry(file);
  });
}

// Add Relationships posts
if (categories.relationships.length > 0) {
  sitemap += `    
    <!-- Relationships & Love (${categories.relationships.length} articles) -->
`;
  categories.relationships.sort().forEach(file => {
    sitemap += addUrlEntry(file);
  });
}

// Add Psychology posts
if (categories.psychology.length > 0) {
  sitemap += `    
    <!-- Psychology & Personality Types (${categories.psychology.length} articles) -->
`;
  categories.psychology.sort().forEach(file => {
    sitemap += addUrlEntry(file);
  });
}

sitemap += `</urlset>`;

// Write sitemap to file
fs.writeFileSync('sitemap.xml', sitemap);

// Print statistics
console.log('Sitemap generated successfully!');
console.log(`Total blog posts: ${blogPosts.length}`);
console.log(`Twin Flames: ${categories.twinFlames.length}`);
console.log(`Angel Numbers: ${categories.angelNumbers.length}`);
console.log(`Introversion: ${categories.introversion.length}`);
console.log(`Relationships: ${categories.relationships.length}`);
console.log(`Psychology: ${categories.psychology.length}`);