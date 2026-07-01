<?php
/**
 * Admin search page for custom post type content stored in postmeta.
 *
 * Provides a single admin screen that performs a text search across
 * the title and postmeta values of all Graphic Data custom post types
 * (about, instance, scene, modal, figure), returning a clickable list
 * that links directly to each post's edit screen.
 *
 * @package Graphic_Data_Plugin
 */

defined( 'ABSPATH' ) || exit;

/**
 * Class Graphic_Data_Admin_Search
 *
 * Registers and renders the "Search All Content" admin submenu page.
 *
 * @since 1.0.0
 */
class Graphic_Data_Search {

	/**
	 * Custom post types included in the search.
	 *
	 * @since 1.0.0
	 * @var string[]
	 */
	private static $post_types = array( 'about', 'instance', 'scene', 'modal', 'figure' );

	/**
	 * Hook the admin menu registration.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'register_menu' ) );
	}

	/**
	 * Register the "Search All Content" submenu page.
	 *
	 * Attached under the Scene CPT menu; adjust the parent slug if a
	 * different top-level menu location is preferred.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public static function register_menu() {
		add_submenu_page(
			'edit.php?post_type=scene', // Parent menu slug.
			__( 'Search All Content', 'graphic-data-plugin' ), // Page title.
			__( 'Search All Content', 'graphic-data-plugin' ), // Menu title.
			'edit_posts',                                      // Required capability.
			'graphic-data-search',                              // Menu slug.
			array( __CLASS__, 'render_page' )                   // Callback.
		);
	}

	/**
	 * Render the search form and results table.
	 *
	 * Handles the POST submission, verifies the nonce, sanitizes the
	 * search term, runs the query, and outputs the admin markup.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public static function render_page() {
		// Bail early if the current user lacks edit capabilities.
		if ( ! current_user_can( 'edit_posts' ) ) {
			wp_die( esc_html__( 'You do not have permission to access this page.', 'graphic-data-plugin' ) );
		}

		$search_term = '';
		$results     = array();

		// Only process the query if the form was submitted with a valid nonce.
		if ( isset( $_POST['graphic_data_search_nonce'] )
			&& wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['graphic_data_search_nonce'] ) ), 'graphic_data_search' )
		) {
			if ( isset( $_POST['graphic_data_search_term'] ) ) {
				$search_term = sanitize_text_field( wp_unslash( $_POST['graphic_data_search_term'] ) );
			}

			// Skip the query entirely on an empty search term.
			if ( '' !== $search_term ) {
				$results = self::search_content( $search_term );
			}
		}
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Search All Content', 'graphic-data-plugin' ); ?></h1>

			<?php // Search form. Submits back to the same admin page via POST. ?>
			<form method="post" action="">
				<?php wp_nonce_field( 'graphic_data_search', 'graphic_data_search_nonce' ); ?>
				<p>
					<input
						type="text"
						name="graphic_data_search_term"
						value="<?php echo esc_attr( $search_term ); ?>"
						class="regular-text"
						placeholder="<?php esc_attr_e( 'Search titles and content…', 'graphic-data-plugin' ); ?>"
					/>
					<?php submit_button( __( 'Search', 'graphic-data-plugin' ), 'primary', 'submit', false ); ?>
				</p>
			</form>

			<?php if ( '' !== $search_term ) : ?>
				<h2>
					<?php
					printf(
						/* translators: 1: number of results, 2: search term */
						esc_html__( '%1$d result(s) for "%2$s"', 'graphic-data-plugin' ),
						count( $results ),
						esc_html( $search_term )
					);
					?>
				</h2>

				<?php // Results table. Empty state handled in the else branch below. ?>
				<?php if ( ! empty( $results ) ) : ?>
					<table class="wp-list-table widefat fixed striped">
						<thead>
							<tr>
								<th><?php esc_html_e( 'Title', 'graphic-data-plugin' ); ?></th>
								<th><?php esc_html_e( 'Post Type', 'graphic-data-plugin' ); ?></th>
								<th><?php esc_html_e( 'Matched On', 'graphic-data-plugin' ); ?></th>
							</tr>
						</thead>
						<tbody>
							<?php foreach ( $results as $row ) : ?>
								<tr>
									<td>
										<a href="<?php echo esc_url( get_edit_post_link( $row['ID'] ) ); ?>">
											<?php echo esc_html( $row['title'] ? $row['title'] : __( '(no title)', 'graphic-data-plugin' ) ); ?>
										</a>
									</td>
									<td><?php echo esc_html( $row['post_type'] ); ?></td>
									<td><?php echo esc_html( $row['matched_on'] ); ?></td>
								</tr>
							<?php endforeach; ?>
						</tbody>
					</table>
				<?php else : ?>
					<p><?php esc_html_e( 'No matching posts found.', 'graphic-data-plugin' ); ?></p>
				<?php endif; ?>
			<?php endif; ?>
		</div>
		<?php
	}

	/**
	 * Search post titles and postmeta values for the given term.
	 *
	 * Runs a single query joining wp_posts to wp_postmeta so both the
	 * title and any custom field value can match. DISTINCT is required
	 * because a post typically has many postmeta rows, and without it
	 * a single matching post would be returned once per matching row.
	 *
	 * @since 1.0.0
	 *
	 * @param string $search_term Sanitized search term (raw text, not yet LIKE-escaped).
	 * @return array[] {
	 *     Indexed array of matching post rows.
	 *
	 *     @type int    $ID         Post ID.
	 *     @type string $title      Post title (may be empty).
	 *     @type string $post_type  Post type slug.
	 *     @type string $matched_on Human-readable match source: 'Title' or 'Content field'.
	 * }
	 */
	private static function search_content( $search_term ) {
		global $wpdb;

		// esc_like() escapes % and _ so user input can't inject wildcard behavior.
		$like = '%' . $wpdb->esc_like( $search_term ) . '%';

		// Build one %s placeholder per post type for the IN() clause.
		$post_type_placeholders = implode( ', ', array_fill( 0, count( self::$post_types ), '%s' ) );

		// phpcs:disable WordPress.DB.PreparedSQL.NotPrepared -- interpolated pieces are placeholders only, values go through prepare().
		$sql = "
			SELECT DISTINCT p.ID, p.post_title, p.post_type,
				CASE WHEN p.post_title LIKE %s THEN 'title' ELSE 'meta' END AS matched_on
			FROM {$wpdb->posts} p
			LEFT JOIN {$wpdb->postmeta} pm ON pm.post_id = p.ID
			WHERE p.post_status != 'trash'
				AND p.post_type IN ( {$post_type_placeholders} )
				AND ( p.post_title LIKE %s OR pm.meta_value LIKE %s )
			ORDER BY p.post_title ASC
		";
		// phpcs:enable WordPress.DB.PreparedSQL.NotPrepared

		// Parameter order must match the %s placeholders left-to-right in $sql above:
		// 1) CASE WHEN title LIKE, 2) post_type IN (...), 3) title LIKE, 4) meta_value LIKE.
		$params = array_merge( array( $like ), self::$post_types, array( $like, $like ) );
		$query  = $wpdb->prepare( $sql, $params ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared

		// Direct query is required here; no WP API covers cross-table postmeta search.
		$rows = $wpdb->get_results( $query, ARRAY_A ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		$results = array();
		foreach ( $rows as $row ) {
			$results[] = array(
				'ID'         => (int) $row['ID'],
				'title'      => $row['post_title'],
				'post_type'  => $row['post_type'],
				'matched_on' => 'title' === $row['matched_on']
					? __( 'Title', 'graphic-data-plugin' )
					: __( 'Content field', 'graphic-data-plugin' ),
			);
		}

		return $results;
	}
}