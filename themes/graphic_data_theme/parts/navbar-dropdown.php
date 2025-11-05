<?php
/**
 * Navigation Dropdowns Template
 *
 * This section of the navigation bar template provides dropdown menus for quick access to various parts of the site.
 * These dropdowns are designed to improve user navigation efficiency by categorizing content under common themes.
 * This implementation is essential for a user-friendly navigation setup that allows visitors to find relevant information
 * quickly and efficiently, categorized under intuitive groupings. 
 * 
 */

 $taxonomy_name = 'instance_type'; // The name of your taxonomy
 $terms = get_terms(
     array(
         'taxonomy' => $taxonomy_name,
         'hide_empty' => false, // Set to true if you want to exclude empty terms
     )
 );

 if (is_wp_error($terms) || empty($terms)) {
     return array(); // Return an empty array if there's an error or no terms found
 }

 $term_data = array();
 foreach ($terms as $term) {
     $term_id = $term->term_id;
     $instance_navbar_name = get_term_meta($term_id, 'instance_navbar_name', true);
     $instance_order = get_term_meta($term_id, 'instance_order', true);

     // Ensure instance_order is a number; default to PHP_INT_MAX if not set or invalid.
     $instance_order = is_numeric($instance_order) ? (int) $instance_order : PHP_INT_MAX;

     $term_data[] = array(
         'term_id' => $term_id,
         'instance_navbar_name' => $instance_navbar_name,
         'instance_order' => $instance_order,
     );
 }

 // Sort the array of term data
 usort($term_data, function ($a, $b) {
     // First, compare by instance_order
     if ($a['instance_order'] === $b['instance_order']) {
         // If instance_order is the same, compare by instance_navbar_name
         return strcmp($a['instance_navbar_name'], $b['instance_navbar_name']);
     } else {
         return $a['instance_order'] - $b['instance_order'];
     }
 });

foreach ($term_data as $term_element) {
    $term_element_id = $term_element['term_id'];
    echo "<li class='nav-item dropdown'>";
    $navbar_id = "Component" . $term_element_id;
    echo "<a class='nav-link dropdown-toggle' data-bs-toggle='dropdown' href='#' role='button' id='$navbar_id' aria-haspopup='true' aria-expanded='false'>{$term_element['instance_navbar_name']}</a>";

    $navbar_dropdown_elements = instance_type_array ($term_element_id);
    if (!empty($navbar_dropdown_elements)) {
        echo "<ul class='dropdown-menu' aria-labelledby=$navbar_id>";
        foreach ($navbar_dropdown_elements as $navbar_dropdown_element) {
            if ($navbar_dropdown_element['instance_legacy_content']== "no"){
            $instance_link = $navbar_dropdown_element['scene_permalink'];
            } else {
                $instance_link = $navbar_dropdown_element['instance_legacy_content_url'];
            }
            echo "<li><a class='dropdown-item' href='$instance_link'>{$navbar_dropdown_element['post_title']}</a></li>";
        }
        echo "</ul>";
    }

    echo "</li>";
 }

if (is_user_logged_in() == true) {
    $args = array(
        'post_type' => 'about', // custom post type 
        'post_status' => 'publish',
        'posts_per_page' => 1, // We only need to know if at least one exists
    );
} else {
    $args = array(
        'post_type' => 'about', // custom post type 
        'post_status' => 'publish',
        'posts_per_page' => 1, // We only need to know if at least one exists
        'meta_query' => array( // only show if about_published is published
            array(
                'key' => 'about_published',
                'value' => 'published',
                'compare' => '='
            )
        )
    );
}
$about_query = new WP_Query($args);

if ($about_query->have_posts()) {
    // At least one "about" post exists
    echo '<li class="nav-item ">';
    echo '<a class="nav-link "  href="/about" role="button" aria-haspopup="true" aria-expanded="false">About</a>';
    echo '</li>';
}
wp_reset_postdata();


// return array of instances within an instance type for the navigation bar dropdown
function instance_type_array ($instance_type_id){
    $args = [
        'post_type'      => 'Instance',
        'posts_per_page' => -1, // Get all matching posts
        'meta_query'     => [
            [
                'key'   => 'instance_type',
                'value' => $instance_type_id,
                'compare' => '='
            ],
            [
                'key'   => 'instance_status',
                'value' => 'Published',
                'compare' => '='
            ]
        ],
    ];
    
    $query = new WP_Query($args);
    $instances = [];
    
    if ($query->have_posts()) {
        while ($query->have_posts()) {
            $query->the_post();
            
            $post_id = get_the_ID();
            $post_title = get_the_title();
            $instance_overview_scene = get_post_meta($post_id, 'instance_overview_scene', true);
            $instance_legacy_content = get_post_meta($post_id, 'instance_legacy_content', true);
            $instance_legacy_content_url = get_post_meta($post_id, 'instance_legacy_content_url', true);
            
            // Get the permalink for the post corresponding to instance_overview_scene
            $scene_permalink = !empty($instance_overview_scene) ? get_permalink($instance_overview_scene) : '';
    
            // Store the required fields in the array
            $instances[] = [
                'post_title' => $post_title,
                'instance_overview_scene' => (int) $instance_overview_scene,
                'instance_legacy_content' => $instance_legacy_content,
                'instance_legacy_content_url' => $instance_legacy_content_url,
                'scene_permalink' => $scene_permalink,
            ];
        }
    }
    
    // Sort the array alphabetically by post title
    usort($instances, function ($a, $b) {
        return strcmp($a['post_title'], $b['post_title']);
    });
    
    // Reset post data
    wp_reset_postdata();
    return $instances;

}