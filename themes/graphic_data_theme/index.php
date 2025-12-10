
<?php
/**
 * Primary Page Template for Graphic Data Theme
 *
 * This template is designed to display the main content area of the Graphic Data Theme front page within a WordPress theme.
 * It integrates the site header and footer and provides a central container that features an image and detailed text
 * components styled directly within the template. The key elements include:
 *
 * - **Header Inclusion**: Utilizes `get_header()` to embed the standard site-wide header.
 * - **Main Content Container**: A full-width container that aligns the content at the top of the page and
 *   includes both visual and textual elements to engage users:
 *     - An emblem image (logo) for Sanctuary Watch is displayed alongside the site title and a descriptive tagline,
 *       both formatted with specific styles for prominence and readability.
 *     - A detailed description under a styled heading that introduces the Graphic Data platform, explaining its purpose
 *       and functionality in tracking ecosystem conditions through interactive tools.
 * - **Footer Inclusion**: Implements `get_footer()` to attach the standard site-wide footer.
 *
 * The content is primarily focused on delivering information through a clean and interactive layout, using inline styles
 * for specific design needs. This setup ensures that the theme maintains a coherent look while also providing specific
 * functionality and information layout tailored to the 'Sanctuary Watch' theme.
 */

defined( 'ABSPATH' ) || exit;

get_header();

$args = array(
    'post_type'      => 'instance',
    'posts_per_page' => -1, 
);

$instances_query = new WP_Query($args);

$instance_slugs = array(); 
$instance_legacy_urls = [];

if ($instances_query->have_posts()) {
    while ($instances_query->have_posts()) {
        $instances_query->the_post();
        
        $instance_id = get_the_ID();
        $instance_slug = get_post_meta($instance_id, 'instance_slug', true); 
        $instance_overview_scene = get_post_meta($instance_id, 'instance_overview_scene', true); 
        $instance_legacy_content_url = get_post_meta($instance_id, 'instance_legacy_content_url', true);

        if ($instance_slug) {
            $instance_slugs[] = [$instance_slug, $instance_overview_scene]; 
        }
        if ($instance_legacy_content_url){
            $instance_legacy_urls[$instance_id] = $instance_legacy_content_url;
        }
    }
    wp_reset_postdata();
} else {
    // echo 'No instances found.';
}

?>


<body>

<!-- // Google Tags Container ID call from wp_options  index.php-->
<?php
$settings = get_option('graphic_data_settings');
$google_tags_container_id = isset($settings['google_tags_container_id']) ? esc_js($settings['google_tags_container_id']) : '';
?>
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=<?php echo $google_tags_container_id; ?>"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->

<div id="entire_thing"> 
<div class="container-fluid-index">
<!-- <i class="fa fa-clipboard-list" role="presentation" aria-label="clipboard-list icon"></i> -->



<div class="image-center">
        <span class="site-branding-logo">
            <?php 
                echo '<img src="' .  get_site_icon_url(512, get_stylesheet_directory_uri() . '/assets/images/onms-logo-no-text-512.png').  '" alt="Navbar Emblem">';
                ?>
        </span>
        <span class="site-branding-text-container">

        <div class="site-title-main"><?= get_bloginfo('name'); ?></div>
        <?php 
            $site_tagline = get_bloginfo('description');
            if ($site_tagline != "") {
                echo "<div class='site-tagline-main'>$site_tagline</div>";
            }
            ?>
        </span>
    </div>
</div>



<!-- Main container with Bootstrap styling for fluid layout -->

    <?php 


        $front_page_intro = "None";
        $graphic_data_settings = get_option('graphic_data_settings');
        if ($graphic_data_settings && isset($graphic_data_settings['intro_text']) && !empty($graphic_data_settings['intro_text'])) {
            $front_page_intro = $$graphic_data_settings['intro_text'];
        } 
        echo "<div class='container-fluid-index main-container' style='margin-top: 0px;'><h4 style='color:black'>{$front_page_intro}</h3></div>";

$terms = get_terms([
    'taxonomy'   => 'instance_type',
    'hide_empty' => false, // Include terms even if not assigned to posts
]);

if (empty($terms) || is_wp_error($terms)) {
    return; // No terms found or an error occurred
}

// Prepare an array with instance_order
$terms_array = [];
foreach ($terms as $term) {
    $instance_order = get_term_meta($term->term_id, 'instance_order', true);
    $terms_array[] = [
        'id'            => $term->term_id,
        'name'           => $term->name,
        'description'    => $term->description, // Get term description
        'instance_order' => (int) $instance_order, // Ensure numeric sorting
    ];
}

// Sort terms by instance_order
usort($terms_array, function ($a, $b) {
    return $a['instance_order'] - $b['instance_order'];
});


foreach ($terms_array as $term){
    ?>

    <?php 
    echo "<hr class='mobile-separator'>";
    echo "<div class='container-fluid-index main-container'><h2 class ='instance_type_title' style='margin-right: auto;'>{$term['name']}</h2></div>";
    echo "<div class='container-fluid-index main-container' style='margin-top: -30px; display: block'>{$term['description']}</div>";
    echo "<div class='container main-container'>";

    $args = array(
        'post_type'      => 'instance',
        'posts_per_page' => -1,
        'meta_query'     => array(
            array(
                'key'   => 'instance_type',
                'value' => $term["id"],
            ),
            array(
            'key'     => 'instance_status',
            'value'   => 'Draft',
            'compare' => '!='
            ),
        ),
    );
    
    $query = new WP_Query($args);
    
    $instances = array();
    
    if ($query->have_posts()) {
        while ($query->have_posts()) {
            $query->the_post();
            $instances[] = array(
                'id'             => get_the_ID(),
                'post_title'     => get_the_title(),
                'instance_status' => get_post_meta(get_the_ID(), 'instance_status', true),
                'instance_legacy_content' => get_post_meta(get_the_ID(), 'instance_legacy_content', true),
                'instance_legacy_content_url' => get_post_meta(get_the_ID(), 'instance_legacy_content_url', true),     
                'instance_overview_scene'    => get_post_meta(get_the_ID(), 'instance_overview_scene', true),         
            );
        }
        wp_reset_postdata();
    }
    
    // Custom sorting function: alphabetically by instance_status, then alphabetically by post_title
    usort($instances, function ($a, $b) {
        $statusCompare = strcasecmp($a['instance_status'], $b['instance_status']); // Reverse order
        if ($statusCompare !== 0) {
            return $statusCompare;
        }
        return strcasecmp($a['post_title'], $b['post_title']); // Normal order
    });



    $instance_count = count($instances);
    $instance_rows = ceil($instance_count/3);

    for ($i = 0; $i < $instance_rows; $i++){
        echo "<div class ='row justify-content-start' style='padding-bottom: 10px;'>";
        for($j= 0; $j < 3; $j++){
            $current_row = $i*3 + $j;
            $instance = isset($instances[$current_row]) ? $instances[$current_row] : null;

            if ($instance != null) {
                $tile_image = get_post_meta($instance["id"], "instance_tile")[0];
                if ($instance["instance_legacy_content"] == "no") {
                    $instance_slug = get_post_meta($instance["id"], "instance_slug")[0];
                    $instance_overview_scene = get_post_meta($instance["id"], 'instance_overview_scene', true); 
                    $instance_post_name = get_post($instance_overview_scene)->post_name;
                    $instance_link = $instance_slug . "/" . $instance_post_name;
                } else {
                    $instance_link = $instance["instance_legacy_content_url"]; 
                }
                echo '<div class="col-12 col-sm-6 col-md-4 d-flex">';
                echo '<div class="card w-100" >';
                if ($instance["instance_status"] =="Published") { 
                    echo "<a href='{$instance_link}'><img class='card-img-top' src='{$tile_image}' alt='{$instance["post_title"]}'></a>";
                } else {
                    echo "<img class='card-img-top' src='{$tile_image}' alt='{$instance["post_title"]}'>";
                }
                echo '<div class="card-body">';
                if ($instance["instance_status"] =="Published") { 
                echo "<a href='{$instance_link}' class='btn w-100 instance_published_button'>{$instance['post_title']}</a>";
                } else {
                    echo "<a class='btn w-100 instance_draft_button'>{$instance['post_title']}<br>Coming Soon</a>";
                }
                echo "</div>";
        
                echo "</div></div>";
            }

        }

        echo "</div>";
    }
    echo "</div>";
}

?>

</div>
<?php
 get_footer();
?>

</body>


<script>
   // let post_id =  <?php echo $post_id; ?>;
    // let is_logged_in = <?php echo is_user_logged_in(); ?>;
   // let is_logged_in = <?php echo json_encode(is_user_logged_in()); ?>;
</script>