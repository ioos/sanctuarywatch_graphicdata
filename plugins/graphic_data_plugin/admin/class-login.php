<?php
/**
 * Register class that has the functions used to modify the login WordPress scene
 */
class Webcr_Login {

     /**
	 * Change the WordPress default logo at the admin login screen to the Sanctuary Watch logo.
	 *
	 * @since    1.0.0
	 */
    public function webcr_login_logo() { 
        if (!has_site_icon()) {
            $site_logo = plugin_dir_url( __FILE__ ) . 'images/onms-logo-800.png';
        } else {
            $site_logo = get_site_icon_url( 150 );
        }
        ?>
        <style type="text/css">
            #login h1 a, .login h1 a {
                background-image: url(<?php echo $site_logo; ?>);
            height:150px;
            width:150px;
            background-size: 150px 150px;
            background-repeat: no-repeat;
                padding-bottom: 1px;
            }
        </style>
        <?php
    }

    /**
	 * Change the URL associated with the logo on the login admin screen to the front page of the site
	 *
	 * @since    1.0.0
	 */
    public function webcr_logo_url() {
        return home_url();
    }

    /**
	 * Change the header text on the login screen to Sanctuary Watch
	 *
	 * @since    1.0.0
	 */
    public function webcr_logo_url_title() {
        return 'Sanctuary Watch';
    }

    /**
	 * Change WordPress login screen page title to Sanctuary Watch
	 *
	 * @since    1.0.0
	 */
    public function custom_login_title( $login_title ) {
        return str_replace(array( ' &lsaquo;', ' &#8212; WordPress'), array( ' &bull;', ' Sanctuary Watch'),$login_title );
    }



}