<?php
/**
 * Plugin Name: PersonalitySpark Grow.me Ads
 * Plugin URI: https://personalityspark.com
 * Description: Integrates Grow.me advertising network for PersonalitySpark monetization
 * Version: 1.0.0
 * Author: PersonalitySpark
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class PersonalitySparkGrowMeAds {
    
    public function __construct() {
        add_action('wp_head', [$this, 'add_grow_me_script']);
        add_shortcode('grow_me_ad', [$this, 'render_ad_container']);
        add_filter('the_content', [$this, 'auto_insert_ads']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_ad_styles']);
    }
    
    /**
     * Add Grow.me script to head
     */
    public function add_grow_me_script() {
        ?>
        <!-- Grow.me Ad Script -->
        <script data-grow-initializer="">
        !(function(){window.growMe||((window.growMe=function(e){window.growMe._.push(e);}),(window.growMe._=[]));var e=document.createElement("script");(e.type="text/javascript"),(e.src="https://faves.grow.me/main.js"),(e.defer=!0),e.setAttribute("data-grow-faves-site-id","U2l0ZTpjZDExNDdjMS0zZWEyLTRkZWEtYjY4NS02NjBiOTBlODk2MmU=");var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t);})();
        </script>
        <?php
    }
    
    /**
     * Render ad container shortcode
     */
    public function render_ad_container($atts) {
        $atts = shortcode_atts([
            'position' => 'middle',
            'size' => 'banner'
        ], $atts);
        
        $ad_id = 'journey-ad-slot-' . uniqid();
        
        ob_start();
        ?>
        <div class="grow-me-ad-container" data-position="<?php echo esc_attr($atts['position']); ?>">
            <div class="ad-label">Advertisement</div>
            <div id="<?php echo esc_attr($ad_id); ?>" class="grow-me-ad-slot"></div>
        </div>
        
        <script>
        document.addEventListener('DOMContentLoaded', function() {
            function initializeGrowMeAd_<?php echo $ad_id; ?>() {
                if (typeof window.growMe === 'function') {
                    try {
                        window.growMe('ads.serve', {
                            slot: '<?php echo $ad_id; ?>',
                            position: '<?php echo esc_js($atts['position']); ?>'
                        });
                        console.log('Grow.me ad initialized: <?php echo $ad_id; ?>');
                    } catch (error) {
                        console.error('Grow.me ad initialization error:', error);
                    }
                } else {
                    setTimeout(initializeGrowMeAd_<?php echo $ad_id; ?>, 200);
                }
            }
            setTimeout(initializeGrowMeAd_<?php echo $ad_id; ?>, 1000);
        });
        </script>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Auto-insert ads into content
     */
    public function auto_insert_ads($content) {
        // Only on single posts and pages
        if (!is_single() && !is_page()) {
            return $content;
        }
        
        // Split content into paragraphs
        $paragraphs = explode('</p>', $content);
        $paragraph_count = count($paragraphs);
        
        // Insert ad after 2nd paragraph (top position)
        if ($paragraph_count > 2) {
            $paragraphs[1] .= '</p>' . $this->render_ad_container(['position' => 'top']);
        }
        
        // Insert ad in middle
        $middle_pos = floor($paragraph_count / 2);
        if ($middle_pos > 2 && $middle_pos < $paragraph_count - 1) {
            $paragraphs[$middle_pos] .= '</p>' . $this->render_ad_container(['position' => 'middle']);
        }
        
        // Rejoin content
        $content = implode('</p>', $paragraphs);
        
        // Add bottom ad
        $content .= $this->render_ad_container(['position' => 'bottom']);
        
        return $content;
    }
    
    /**
     * Enqueue ad styles
     */
    public function enqueue_ad_styles() {
        $css = "
        .grow-me-ad-container {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e9ecef;
        }
        
        .grow-me-ad-container .ad-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 10px;
            text-transform: uppercase;
            font-weight: 500;
        }
        
        .grow-me-ad-slot {
            min-height: 100px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        /* Dark theme support */
        @media (prefers-color-scheme: dark) {
            .grow-me-ad-container {
                background: #2d3748;
                border-color: #4a5568;
            }
            
            .grow-me-ad-container .ad-label {
                color: #a0aec0;
            }
        }
        
        /* Mobile responsive */
        @media (max-width: 768px) {
            .grow-me-ad-container {
                margin: 20px 0;
                padding: 15px;
            }
        }
        ";
        
        wp_add_inline_style('wp-block-library', $css);
    }
}

// Initialize the plugin
new PersonalitySparkGrowMeAds();

/**
 * Plugin activation hook
 */
register_activation_hook(__FILE__, function() {
    // Create options for ad settings
    add_option('grow_me_site_id', 'U2l0ZTpjZDExNDdjMS0zZWEyLTRkZWEtYjY4NS02NjBiOTBlODk2MmU=');
    add_option('grow_me_auto_ads', 1);
    add_option('grow_me_ad_frequency', 3); // Every 3 paragraphs
});

/**
 * Plugin deactivation hook
 */
register_deactivation_hook(__FILE__, function() {
    // Clean up if needed
});

?>