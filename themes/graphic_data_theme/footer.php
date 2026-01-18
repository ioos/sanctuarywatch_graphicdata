<?php
defined('ABSPATH') || exit;
$instance_num =  get_post_meta(get_the_ID(), 'scene_location', true);

$singleInstance = graphic_data_single_instance_check();
if ($singleInstance != false) {
    $instance_num = $singleInstance["instanceID"];
}

$instance_footer = intval(get_post_meta($instance_num, 'instance_footer_columns', true));
$settings = get_option('graphic_data_settings', []);
$sitewide_footer_title = (!empty($settings['sitewide_footer_title'] ?? '')) ? $settings['sitewide_footer_title'] : '';

$sitewide_footer = (!empty($settings['site_footer'] ?? '')) ? $settings['site_footer'] : '';
if ($sitewide_footer_title == '' || $sitewide_footer == ''){
    $sitewide_footer_present = false;
} else {
    $sitewide_footer_present = true;            
}


if ( ($instance_footer > 0 ) || ($sitewide_footer_present == true)) {
    echo '<footer class="site-footer" >';
    echo '<div class="container" style="margin: 0 auto; max-width: 1200px;">';
    echo '<div class="row">';

    if ($sitewide_footer_present == true) {
        // Apply flex styling to .col-sm to center its direct child (the new wrapper)
        echo '<div class="col-sm footer-column">';
        // This wrapper will be centered in .col-sm, and its text content will be left-aligned.
        echo '  <div class="footer-content-wrapper">';
        echo '    <h6 class="footer-column-title">' . $sitewide_footer_title  . '</h6>';
        echo '    <div class="footer_component">';
        echo $sitewide_footer;
        echo '    </div>';
        echo '  </div>'; // Closing footer-content-wrapper
        echo '</div>';
    }

    if ($instance_footer > 0 ) {
        for ($i = 1; $i <= $instance_footer ; $i++) {

            $target_footer_column = "instance_footer_column". $i;

            $instance_footer = get_post_meta($instance_num, $target_footer_column, true);
            if ($instance_footer != ""){
                if ($instance_footer['instance_footer_column_title' . $i ] != "" && $instance_footer['instance_footer_column_content' . $i ] != ""){
                    // Apply flex styling to .col-sm to center its direct child (the new wrapper)
                    echo '<div class="col-sm footer-column">';
                    // This wrapper will be centered in .col-sm, and its text content will be left-aligned.
                    echo '  <div class="footer-content-wrapper">';
                    echo '    <h6 class="footer-column-title">' . $instance_footer['instance_footer_column_title' . $i ] . '</h6>';
                    echo '    <div class="footer_component">';
                    echo $instance_footer['instance_footer_column_content' . $i ];
                    echo '    </div>';
                    echo '  </div>'; // Closing footer-content-wrapper
                    echo '</div>';
                }
            }



        }   
    }

    echo '</div>';
    echo '</div>';
    echo '</footer>';
} 

wp_footer();
echo '</body>';
echo '</html>';