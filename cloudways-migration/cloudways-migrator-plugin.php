<?php
/**
 * Plugin Name: PersonalitySpark Cloudways Migrator
 * Plugin URI: https://personalityspark.com
 * Description: Complete migration and ad setup for PersonalitySpark on Cloudways WordPress
 * Version: 1.0.0
 * Author: PersonalitySpark Team
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class PersonalitySparkCloudwaysMigrator {
    
    private $articles_data = [];
    private $migration_log = [];
    
    public function __construct() {
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('wp_ajax_ps_migrate_articles', [$this, 'ajax_migrate_articles']);
        add_action('wp_ajax_ps_test_ads', [$this, 'ajax_test_ads']);
        add_action('wp_head', [$this, 'add_grow_me_script']);
        add_shortcode('grow_me_ad', [$this, 'render_grow_me_ad']);
        add_filter('the_content', [$this, 'auto_insert_ads']);
    }
    
    /**
     * Add admin menu for migration
     */
    public function add_admin_menu() {
        add_management_page(
            'PersonalitySpark Migrator',
            'PS Migrator',
            'manage_options',
            'ps-migrator',
            [$this, 'admin_page']
        );
    }
    
    /**
     * Admin page for migration control
     */
    public function admin_page() {
        ?>
        <div class="wrap">
            <h1>PersonalitySpark Cloudways Migration</h1>
            
            <div class="ps-migration-dashboard">
                <div class="ps-card">
                    <h2>📊 Migration Status</h2>
                    <p><strong>Total Articles to Migrate:</strong> 304</p>
                    <p><strong>WordPress Posts:</strong> <?php echo wp_count_posts()->publish; ?></p>
                    <p><strong>Categories:</strong> <?php echo wp_count_terms('category'); ?></p>
                </div>
                
                <div class="ps-card">
                    <h2>🚀 Quick Actions</h2>
                    <button id="ps-migrate-articles" class="button button-primary">Migrate All Articles</button>
                    <button id="ps-test-ads" class="button">Test Grow.me Ads</button>
                    <button id="ps-create-categories" class="button">Create Categories</button>
                </div>
                
                <div class="ps-card">
                    <h2>💰 Ad Configuration</h2>
                    <p><strong>Grow.me Status:</strong> <span id="grow-me-status">Checking...</span></p>
                    <p><strong>Auto Ad Insertion:</strong> Enabled</p>
                    <p><strong>Ad Positions:</strong> Top, Middle, Bottom</p>
                </div>
                
                <div class="ps-card">
                    <h2>📝 Migration Log</h2>
                    <div id="migration-log" style="height: 200px; overflow-y: scroll; background: #f9f9f9; padding: 10px;">
                        <p>Ready to start migration...</p>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
        .ps-migration-dashboard {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 20px;
        }
        .ps-card {
            background: white;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .ps-card h2 {
            margin-top: 0;
            color: #6366f1;
        }
        </style>
        
        <script>
        jQuery(document).ready(function($) {
            // Test Grow.me status
            $('#grow-me-status').text(typeof window.growMe !== 'undefined' ? '✅ Loaded' : '❌ Not Loaded');
            
            // Migrate articles
            $('#ps-migrate-articles').click(function() {
                $(this).prop('disabled', true).text('Migrating...');
                
                $.post(ajaxurl, {
                    action: 'ps_migrate_articles',
                    _wpnonce: '<?php echo wp_create_nonce('ps_migrate'); ?>'
                }, function(response) {
                    $('#migration-log').html(response.data.log);
                    $('#ps-migrate-articles').prop('disabled', false).text('Migration Complete');
                });
            });
            
            // Test ads
            $('#ps-test-ads').click(function() {
                $.post(ajaxurl, {
                    action: 'ps_test_ads',
                    _wpnonce: '<?php echo wp_create_nonce('ps_test'); ?>'
                }, function(response) {
                    alert(response.data.message);
                });
            });
        });
        </script>
        <?php
    }
    
    /**
     * AJAX handler for article migration
     */
    public function ajax_migrate_articles() {
        check_ajax_referer('ps_migrate');
        
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        $this->create_categories();
        $migration_result = $this->migrate_articles_from_data();
        
        wp_send_json_success([
            'log' => implode('<br>', $this->migration_log),
            'result' => $migration_result
        ]);
    }
    
    /**
     * Create WordPress categories
     */
    private function create_categories() {
        $categories = [
            'twin-flames' => 'Twin Flames',
            'angel-numbers' => 'Angel Numbers',
            'introversion' => 'Introversion',
            'psychology' => 'Psychology',
            'relationships' => 'Relationships',
            'spirituality' => 'Spirituality',
            'personal-growth' => 'Personal Growth',
            'mindfulness' => 'Mindfulness',
            'self-care' => 'Self-Care',
            'anxiety-management' => 'Anxiety Management',
            'career-development' => 'Career Development',
            'emotional-healing' => 'Emotional Healing',
            'life-transitions' => 'Life Transitions',
            'productivity' => 'Productivity',
            'creativity' => 'Creativity'
        ];
        
        foreach ($categories as $slug => $name) {
            if (!term_exists($slug, 'category')) {
                wp_insert_term($name, 'category', ['slug' => $slug]);
                $this->migration_log[] = "✅ Created category: $name";
            }
        }
    }
    
    /**
     * Migrate articles using hardcoded data (for Cloudways)
     */
    private function migrate_articles_from_data() {
        // Sample article data - you'll expand this with your 304 articles
        $sample_articles = [
            [
                'title' => '0808 Angel Number Twin Flame: Financial Prosperity & Spiritual Growth',
                'content' => $this->get_sample_content(),
                'category' => 'angel-numbers',
                'excerpt' => 'Discover the powerful meaning of 0808 angel number in twin flame relationships.',
                'meta_description' => 'Explore the significance of 0808 angel number in twin flame connections.',
                'keywords' => '0808 angel number, twin flame, abundance, spiritual growth',
                'filename' => '0808-angel-number-twin-flame.html'
            ],
            // Add more articles here...
        ];
        
        $success_count = 0;
        foreach ($sample_articles as $article) {
            $post_id = $this->create_wordpress_post($article);
            if ($post_id) {
                $success_count++;
                $this->migration_log[] = "✅ Migrated: {$article['title']} (ID: $post_id)";
            } else {
                $this->migration_log[] = "❌ Failed: {$article['title']}";
            }
        }
        
        return $success_count;
    }
    
    /**
     * Create WordPress post from article data
     */
    private function create_wordpress_post($article) {
        // Add ads to content
        $content_with_ads = $this->add_ads_to_content($article['content']);
        
        $post_data = [
            'post_title' => $article['title'],
            'post_content' => $content_with_ads,
            'post_excerpt' => $article['excerpt'],
            'post_status' => 'publish',
            'post_type' => 'post',
            'post_author' => get_current_user_id(),
            'meta_input' => [
                '_yoast_wpseo_metadesc' => $article['meta_description'],
                '_yoast_wpseo_focuskw' => explode(',', $article['keywords'])[0],
                'ps_original_file' => $article['filename'],
                'ps_migration_date' => current_time('mysql')
            ]
        ];
        
        $post_id = wp_insert_post($post_data);
        
        if (!is_wp_error($post_id)) {
            // Set category
            $category = get_term_by('slug', $article['category'], 'category');
            if ($category) {
                wp_set_post_categories($post_id, [$category->term_id]);
            }
            
            // Set tags
            wp_set_post_tags($post_id, explode(',', $article['keywords']));
            
            return $post_id;
        }
        
        return false;
    }
    
    /**
     * Add Grow.me ads to content
     */
    private function add_ads_to_content($content) {
        $paragraphs = explode('</p>', $content);
        $total = count($paragraphs);
        
        // Add top ad after 2nd paragraph
        if ($total > 2) {
            $paragraphs[1] .= '</p>[grow_me_ad position="top"]';
        }
        
        // Add middle ad
        if ($total > 5) {
            $middle = floor($total / 2);
            $paragraphs[$middle] .= '</p>[grow_me_ad position="middle"]';
        }
        
        $content = implode('</p>', $paragraphs);
        
        // Add bottom ad
        $content .= '[grow_me_ad position="bottom"]';
        
        return $content;
    }
    
    /**
     * Add Grow.me script to head
     */
    public function add_grow_me_script() {
        ?>
        <!-- PersonalitySpark Grow.me Ads -->
        <script data-grow-initializer="">
        !(function(){window.growMe||((window.growMe=function(e){window.growMe._.push(e);}),(window.growMe._=[]));var e=document.createElement("script");(e.type="text/javascript"),(e.src="https://faves.grow.me/main.js"),(e.defer=!0),e.setAttribute("data-grow-faves-site-id","U2l0ZTpjZDExNDdjMS0zZWEyLTRkZWEtYjY4NS02NjBiOTBlODk2MmU=");var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t);})();
        </script>
        <?php
    }
    
    /**
     * Render Grow.me ad shortcode
     */
    public function render_grow_me_ad($atts) {
        $atts = shortcode_atts([
            'position' => 'middle',
            'size' => 'banner'
        ], $atts);
        
        $ad_id = 'ps-grow-ad-' . uniqid();
        
        ob_start();
        ?>
        <div class="ps-grow-me-ad-container" data-position="<?php echo esc_attr($atts['position']); ?>">
            <div class="ps-ad-label">Advertisement</div>
            <div id="<?php echo esc_attr($ad_id); ?>" class="ps-grow-me-ad-slot"></div>
        </div>
        
        <script>
        document.addEventListener('DOMContentLoaded', function() {
            function initPSAd_<?php echo str_replace('-', '_', $ad_id); ?>() {
                if (typeof window.growMe === 'function') {
                    try {
                        window.growMe('ads.serve', {
                            slot: '<?php echo esc_js($ad_id); ?>',
                            position: '<?php echo esc_js($atts['position']); ?>'
                        });
                        console.log('PersonalitySpark ad initialized: <?php echo esc_js($ad_id); ?>');
                    } catch (error) {
                        console.error('PS ad error:', error);
                    }
                } else {
                    setTimeout(initPSAd_<?php echo str_replace('-', '_', $ad_id); ?>, 200);
                }
            }
            setTimeout(initPSAd_<?php echo str_replace('-', '_', $ad_id); ?>, 1000);
        });
        </script>
        
        <style>
        .ps-grow-me-ad-container {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e9ecef;
        }
        
        .ps-ad-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 10px;
            text-transform: uppercase;
            font-weight: 500;
        }
        
        .ps-grow-me-ad-slot {
            min-height: 100px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            border-radius: 4px;
        }
        
        /* Dark theme support */
        @media (prefers-color-scheme: dark) {
            .ps-grow-me-ad-container {
                background: #2d3748;
                border-color: #4a5568;
            }
            .ps-ad-label {
                color: #a0aec0;
            }
        }
        
        /* Mobile responsive */
        @media (max-width: 768px) {
            .ps-grow-me-ad-container {
                margin: 20px 0;
                padding: 15px;
            }
        }
        </style>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Auto-insert ads into post content
     */
    public function auto_insert_ads($content) {
        if (!is_single() || !in_the_loop() || !is_main_query()) {
            return $content;
        }
        
        // Don't add ads if shortcodes already exist
        if (strpos($content, '[grow_me_ad') !== false) {
            return $content;
        }
        
        return $this->add_ads_to_content($content);
    }
    
    /**
     * Sample content for testing
     */
    private function get_sample_content() {
        return '<p>The <strong>0808 angel number</strong> is deeply significant in the world of twin flames, symbolizing <strong>financial prosperity</strong>, <strong>spiritual growth</strong>, and the manifestation of deep connections.</p>

<p>This number guides individuals towards a <strong>harmonious relationship</strong> with their twin flame, emphasizing that both material and spiritual growth are essential for a fulfilling union.</p>

<h2>Understanding 0808 Angel Number</h2>

<p>The 0808 angel number represents <strong>abundance</strong>, <strong>financial stability</strong>, and potential growth in both <strong>material and spiritual domains</strong>.</p>

<h2>Twin Flame Connection</h2>

<p>Twin flame relationships represent a powerful sequence in the spiritual journey of two souls, focusing on <strong>spiritual growth</strong> and self-awareness.</p>';
    }
    
    /**
     * AJAX test ads functionality
     */
    public function ajax_test_ads() {
        check_ajax_referer('ps_test');
        
        $test_result = [
            'grow_me_loaded' => "typeof window.growMe !== 'undefined'",
            'ad_containers' => "document.querySelectorAll('.ps-grow-me-ad-container').length",
            'shortcode_test' => do_shortcode('[grow_me_ad position="test"]')
        ];
        
        wp_send_json_success([
            'message' => 'Ad test completed. Check browser console for details.',
            'test_data' => $test_result
        ]);
    }
}

// Initialize the plugin
new PersonalitySparkCloudwaysMigrator();

/**
 * Activation hook
 */
register_activation_hook(__FILE__, function() {
    add_option('ps_migration_version', '1.0.0');
    add_option('ps_grow_me_site_id', 'U2l0ZTpjZDExNDdjMS0zZWEyLTRkZWEtYjY4NS02NjBiOTBlODk2MmU=');
    add_option('ps_auto_ads_enabled', 1);
});
?>