<?php
/**
 * PersonalitySpark Local WordPress Migration Script
 * 
 * This script migrates HTML articles to local WordPress instance
 * Preserves SEO metadata, categories, and content structure
 */

// WordPress configuration - UPDATE THESE PATHS
define('WP_LOCAL_PATH', '/path/to/your/local/wordpress'); // Update this path
define('ARTICLES_PATH', '/Users/abdulrahim/GitHub Projects/personality-html/blog/posts/');

// Include WordPress
require_once(WP_LOCAL_PATH . '/wp-config.php');
require_once(WP_LOCAL_PATH . '/wp-load.php');

class PersonalitySparkMigrator {
    
    private $categories_map = [
        'twin-flame' => 'Twin Flames',
        'angel-number' => 'Angel Numbers', 
        'introvert' => 'Introversion',
        'personality' => 'Psychology',
        'relationship' => 'Relationships',
        'spiritual' => 'Spirituality',
        'personal-growth' => 'Personal Growth',
        'mindfulness' => 'Mindfulness',
        'self-care' => 'Self-Care',
        'anxiety' => 'Anxiety Management',
        'career' => 'Career Development',
        'emotional-healing' => 'Emotional Healing',
        'life-transitions' => 'Life Transitions',
        'productivity' => 'Productivity',
        'creativity' => 'Creativity',
        'social-psychology' => 'Social Psychology',
        'spiritual-practices' => 'Spiritual Practices'
    ];
    
    public function __construct() {
        echo "🚀 PersonalitySpark WordPress Migration Tool\n";
        echo "==========================================\n\n";
    }
    
    public function migrate_all_articles() {
        $article_files = glob(ARTICLES_PATH . '*.html');
        $article_files = array_filter($article_files, function($file) {
            return !strpos(basename($file), '.!'); // Exclude temp files
        });
        
        echo "Found " . count($article_files) . " articles to migrate\n\n";
        
        // Create categories first
        $this->create_categories();
        
        $success_count = 0;
        $error_count = 0;
        
        foreach ($article_files as $file) {
            echo "Migrating: " . basename($file) . "... ";
            
            try {
                $post_id = $this->migrate_single_article($file);
                if ($post_id) {
                    echo "✅ Success (Post ID: $post_id)\n";
                    $success_count++;
                } else {
                    echo "❌ Failed\n";
                    $error_count++;
                }
            } catch (Exception $e) {
                echo "❌ Error: " . $e->getMessage() . "\n";
                $error_count++;
            }
        }
        
        echo "\n📊 Migration Summary:\n";
        echo "✅ Successfully migrated: $success_count articles\n";
        echo "❌ Failed: $error_count articles\n";
        echo "📝 Total WordPress posts created: $success_count\n";
    }
    
    private function create_categories() {
        echo "📁 Creating WordPress categories...\n";
        
        foreach ($this->categories_map as $slug => $name) {
            $category = get_term_by('slug', $slug, 'category');
            if (!$category) {
                $result = wp_insert_term($name, 'category', [
                    'slug' => $slug,
                    'description' => "Articles about $name"
                ]);
                
                if (!is_wp_error($result)) {
                    echo "✅ Created category: $name\n";
                } else {
                    echo "❌ Failed to create category: $name\n";
                }
            } else {
                echo "📁 Category exists: $name\n";
            }
        }
        echo "\n";
    }
    
    private function migrate_single_article($file_path) {
        $html_content = file_get_contents($file_path);
        if (!$html_content) {
            throw new Exception("Could not read file");
        }
        
        // Parse HTML content
        $dom = new DOMDocument();
        libxml_use_internal_errors(true);
        $dom->loadHTML($html_content);
        libxml_clear_errors();
        
        // Extract metadata
        $title = $this->extract_title($dom);
        $content = $this->extract_content($dom);
        $excerpt = $this->extract_excerpt($dom);
        $meta_description = $this->extract_meta_description($dom);
        $keywords = $this->extract_keywords($dom);
        $category = $this->determine_category($file_path, $content);
        
        // Create WordPress post
        $post_data = [
            'post_title' => $title,
            'post_content' => $content,
            'post_excerpt' => $excerpt,
            'post_status' => 'publish',
            'post_type' => 'post',
            'post_author' => 1, // Admin user
            'post_date' => current_time('mysql'),
            'meta_input' => [
                '_yoast_wpseo_metadesc' => $meta_description,
                '_yoast_wpseo_focuskw' => $this->extract_primary_keyword($keywords),
                'original_html_file' => basename($file_path),
                'migration_date' => current_time('mysql')
            ]
        ];
        
        // Insert post
        $post_id = wp_insert_post($post_data);
        
        if (is_wp_error($post_id)) {
            throw new Exception($post_id->get_error_message());
        }
        
        // Set category
        if ($category) {
            wp_set_post_categories($post_id, [$category]);
        }
        
        // Set tags from keywords
        if ($keywords) {
            wp_set_post_tags($post_id, explode(',', $keywords));
        }
        
        return $post_id;
    }
    
    private function extract_title($dom) {
        $title_elements = $dom->getElementsByTagName('title');
        if ($title_elements->length > 0) {
            $title = $title_elements->item(0)->textContent;
            // Remove " - PersonalitySpark" suffix
            return preg_replace('/ - PersonalitySpark.*$/', '', $title);
        }
        
        // Fallback to H1
        $h1_elements = $dom->getElementsByTagName('h1');
        if ($h1_elements->length > 0) {
            return $h1_elements->item(0)->textContent;
        }
        
        return 'Untitled Article';
    }
    
    private function extract_content($dom) {
        // Find main content area
        $main_elements = $dom->getElementsByTagName('main');
        if ($main_elements->length > 0) {
            $main = $main_elements->item(0);
            return $this->clean_content($main->saveHTML());
        }
        
        // Fallback to body content
        $body_elements = $dom->getElementsByTagName('body');
        if ($body_elements->length > 0) {
            return $this->clean_content($body_elements->item(0)->saveHTML());
        }
        
        return '';
    }
    
    private function clean_content($html) {
        // Remove navigation, footer, and other non-content elements
        $html = preg_replace('/<nav[^>]*>.*?<\/nav>/is', '', $html);
        $html = preg_replace('/<footer[^>]*>.*?<\/footer>/is', '', $html);
        $html = preg_replace('/<header[^>]*>.*?<\/header>/is', '', $html);
        
        // Convert relative URLs to absolute
        $html = str_replace('href="../../', 'href="https://personalityspark.com/', $html);
        $html = str_replace('src="../../', 'src="https://personalityspark.com/', $html);
        
        // Add WordPress Grow.me ad placeholders
        $html = $this->add_ad_placeholders($html);
        
        return $html;
    }
    
    private function add_ad_placeholders($content) {
        // Add ad after first paragraph
        $content = preg_replace('/(<p[^>]*>.*?<\/p>)/', '$1' . "\n\n" . '[grow_me_ad position="top"]', $content, 1);
        
        // Add ad in middle of content
        $paragraphs = explode('</p>', $content);
        $middle_pos = floor(count($paragraphs) / 2);
        if ($middle_pos > 0 && isset($paragraphs[$middle_pos])) {
            $paragraphs[$middle_pos] .= "\n\n[grow_me_ad position=\"middle\"]";
        }
        $content = implode('</p>', $paragraphs);
        
        // Add ad at end
        $content .= "\n\n[grow_me_ad position=\"bottom\"]";
        
        return $content;
    }
    
    private function extract_excerpt($dom) {
        $meta_elements = $dom->getElementsByTagName('meta');
        foreach ($meta_elements as $meta) {
            if ($meta->getAttribute('name') === 'description') {
                return $meta->getAttribute('content');
            }
        }
        return '';
    }
    
    private function extract_meta_description($dom) {
        return $this->extract_excerpt($dom);
    }
    
    private function extract_keywords($dom) {
        $meta_elements = $dom->getElementsByTagName('meta');
        foreach ($meta_elements as $meta) {
            if ($meta->getAttribute('name') === 'keywords') {
                return $meta->getAttribute('content');
            }
        }
        return '';
    }
    
    private function extract_primary_keyword($keywords) {
        if (!$keywords) return '';
        $keyword_array = explode(',', $keywords);
        return trim($keyword_array[0]);
    }
    
    private function determine_category($file_path, $content) {
        $filename = basename($file_path);
        $content_lower = strtolower($content);
        
        // Twin Flames
        if (strpos($filename, 'twin-flame') !== false || 
            strpos($content_lower, 'twin flame') !== false) {
            return get_term_by('slug', 'twin-flame', 'category')->term_id ?? null;
        }
        
        // Angel Numbers
        if (preg_match('/\d{3,4}-angel-number/', $filename) || 
            strpos($content_lower, 'angel number') !== false) {
            return get_term_by('slug', 'angel-number', 'category')->term_id ?? null;
        }
        
        // Introversion
        if (strpos($filename, 'introvert') !== false || 
            strpos($content_lower, 'introvert') !== false) {
            return get_term_by('slug', 'introvert', 'category')->term_id ?? null;
        }
        
        // Relationships
        if (strpos($filename, 'relationship') !== false || 
            strpos($content_lower, 'relationship') !== false) {
            return get_term_by('slug', 'relationship', 'category')->term_id ?? null;
        }
        
        // Psychology
        if (strpos($filename, 'personality') !== false || 
            strpos($content_lower, 'personality') !== false ||
            strpos($content_lower, 'psychology') !== false) {
            return get_term_by('slug', 'personality', 'category')->term_id ?? null;
        }
        
        return null; // Uncategorized
    }
}

// Usage instructions
echo "PersonalitySpark WordPress Migration Tool\n";
echo "========================================\n\n";
echo "BEFORE RUNNING:\n";
echo "1. Update WP_LOCAL_PATH constant to your local WordPress installation\n";
echo "2. Ensure your local WordPress is running\n";
echo "3. Backup your local WordPress database\n\n";
echo "TO RUN MIGRATION:\n";
echo "php migrate-to-local-wp.php\n\n";

// Uncomment the following lines to run migration
// $migrator = new PersonalitySparkMigrator();
// $migrator->migrate_all_articles();

?>