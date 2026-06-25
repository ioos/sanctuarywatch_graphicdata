<?php defined('ABSPATH') or die("Cannot access pages directly."); ?>
<?php
$handsIcon =   "<img class='wdt-icon-hands' src='" . WDT_ROOT_URL . "assets/img/hands.png' alt=''>";
$smileIcon =   "<img class='wdt-icon-smile' src='" . WDT_ROOT_URL . "assets/img/smile.png' alt=''>";
if( isset($allTables) && $allTables > 100 ) {
    $messageTables = sprintf(__("Awesome! %s You are a wpDataTables Master! %s You’ve created more than 100 tables!", "wpdatatables"), $handsIcon, $smileIcon);
} else if( isset($allTables) && $allTables > 50 ) {
    $messageTables = sprintf(__("Well done! %s You’ve created more than 50 tables - you are a wpDataTables Professional! %s", "wpdatatables"), $handsIcon, $smileIcon);
} else if( isset($allTables) && $allTables > 10 ) {
    $messageTables = sprintf(__("Nice job! %s You created more than 10 tables. %s", "wpdatatables"), $handsIcon, $smileIcon);
} else if( isset($allTables) && $allTables > 5 ) {
    $messageTables = sprintf(__("We hope you’ve enjoyed using wpDataTables.", "wpdatatables"), $handsIcon, $smileIcon);
}
?>
<div class="wdt-rating-notice notice notice-success">
    <div class="wdt-float-left">
        <img class="wdt-icon-rating" src="<?php echo WDT_ROOT_URL ?>assets/img/review.png" alt="">
    </div>
    <div class="wdt-float-left">
        <p class="wdt-rating-massage"><?php echo $messageTables; ?></p>
        <h1 class="wdt-rating-heading"><?php esc_html_e("Would you consider leaving us a review on WordPress.org?", "wpdatatables") ?></h1>
        <a href="https://wordpress.org/support/plugin/wpdatatables/reviews/?rate=5&filter=5#new-post"
           class="wdt-rating-button wdt-first-btn btn-primary" target="_new"
        ><i class="wpdt-icon-heart"></i><?php esc_html_e("Sure! I Like wpDataTables", "wpdatatables") ?></a>
    </div>

    <div class="wdt-dismiss"><i class="wpdt-icon-times-full"></i></div>

    <ul class="wdt-rating-buttons">
        <li><a href="javascript:void(0);" class="wdt-rating-button wdt-hide-rating wdt-other-btn"><?php esc_html_e("I've already left a review", "wpdatatables") ?></a></li>
        <li><a href="javascript:void(0);" class="wdt-rating-button wdt-other-btn wdt-dismiss"><?php esc_html_e("Maybe Later", "wpdatatables") ?></a></li>
        <li><a href="javascript:void(0);" class="wdt-rating-button wdt-hide-rating wdt-other-btn"><?php esc_html_e("Never show again", "wpdatatables") ?></a></li>
    </ul>
    <div class="clear"></div>
</div>
