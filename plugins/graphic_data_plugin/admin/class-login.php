<?php
/**
 * Register class that has the functions used to modify the login WordPress scene
 */
class Graphic_Data_Login {

	 /**
	  * Change the WordPress default logo at the admin login screen to the Sanctuary Watch logo.
	  *
	  * @since    1.0.0
	  */
	public function login_logo() {
		if ( ! has_site_icon() ) {
			$site_logo = plugin_dir_url( __FILE__ ) . 'images/graphic_data_logo-850.png';
		} else {
			$site_logo = get_site_icon_url( 150 );
		}
		?>
		<style type="text/css">
			#login h1 a, .login h1 a {
				background-image: url(<?php echo esc_url( $site_logo ); ?>);
				height:250px;
				width:250px;
				background-size: 250px 250px;
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
	public function logo_url() {
		return home_url();
	}

	/**
	 * Modify the WordPress login screen page title to use Sanctuary Watch branding.
	 *
	 * Replaces the default WordPress login page title formatting by substituting
	 * the left-pointing angle quote with a bullet and '&#8212; WordPress' with
	 * 'Sanctuary Watch'.
	 *
	 * @since 1.0.0
	 *
	 * @param string $login_title The default login page title.
	 * @return string The modified login page title with Sanctuary Watch branding.
	 */
	public function custom_login_title( $login_title ) {
		return str_replace( array( ' &lsaquo;', ' &#8212; WordPress' ), array( ' &bull;', ' Sanctuary Watch' ), $login_title );
	}
}