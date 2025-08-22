#!/bin/bash

# Create sitemap header
cat > sitemap.xml << 'HEADER'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Main Pages -->
  <url>
    <loc>https://www.personalityspark.com/</loc>
    <lastmod>2025-01-21</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Category Pages -->
  <url>
    <loc>https://www.personalityspark.com/angel-numbers/</loc>
    <lastmod>2025-01-21</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.personalityspark.com/twin-flames/</loc>
    <lastmod>2025-01-21</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.personalityspark.com/dream-meanings/</loc>
    <lastmod>2025-01-21</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.personalityspark.com/numerology/</loc>
    <lastmod>2025-01-21</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.personalityspark.com/zodiac-signs/</loc>
    <lastmod>2025-01-21</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.personalityspark.com/tarot-meanings/</loc>
    <lastmod>2025-01-21</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Legal Pages -->
  <url>
    <loc>https://www.personalityspark.com/privacy-policy/</loc>
    <lastmod>2025-01-21</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://www.personalityspark.com/terms-of-service/</loc>
    <lastmod>2025-01-21</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://www.personalityspark.com/cookie-policy/</loc>
    <lastmod>2025-01-21</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://www.personalityspark.com/disclaimer/</loc>
    <lastmod>2025-01-21</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  
  <!-- Articles -->
HEADER

# Add all article URLs
for file in *.html; do
  if [[ "$file" != "index.html" && "$file" != "privacy-policy.html" && "$file" != "terms-of-service.html" && "$file" != "cookie-policy.html" && "$file" != "disclaimer.html" ]]; then
    filename="${file%.html}"
    echo "  <url>
    <loc>https://www.personalityspark.com/${filename}/</loc>
    <lastmod>2025-01-21</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>" >> sitemap.xml
  fi
done

# Close sitemap
echo "</urlset>" >> sitemap.xml

echo "Sitemap generated with $(grep -c '<loc>' sitemap.xml) URLs"
