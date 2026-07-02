<?php
/**
 * Admin search page for custom post type content stored in postmeta.
 *
 * Provides a single admin screen that performs a text search across
 * the title and postmeta values of all Graphic Data custom post types
 * (about, instance, scene, modal, figure), returning a clickable,
 * sortable list that links directly to each post's edit screen.
 *
 * Users with the Author role are restricted to results associated
 * with the Instances listed in their 'assigned_instances' usermeta.
 *
 * @package Graphic_Data_Plugin
 */

defined( 'ABSPATH' ) || exit;

/**
 * Class Graphic_Data_Search
 *
 * Registers and renders the "Search All Content" top-level admin page.
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
	 * Maps post type to the postmeta key that stores the related Instance post ID.
	 *
	 * The 'about' type has no Instance relationship, and 'instance' posts
	 * are their own Instance, so neither appears here.
	 *
	 * @since 1.0.0
	 * @var array<string,string>
	 */
	private static $instance_meta_keys = array(
		'scene'  => 'scene_location',
		'modal'  => 'modal_location',
		'figure' => 'location',
	);

	/**
	 * In-request cache of resolved Instance titles, keyed by Instance post ID.
	 * Avoids repeated get_the_title() calls when multiple results share an Instance.
	 *
	 * @since 1.0.0
	 * @var array<int,string>
	 */
	private static $instance_title_cache = array();

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
	 * Register "Search All Content" as a top-level admin menu page.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public static function register_menu() {
		add_menu_page(
			'Graphic Data Search',
			'Graphic Data Search',
			'edit_posts',
			'graphic-data-search',
			array( __CLASS__, 'render_page' ),
			'dashicons-search',
			135
		);
	}

	/**
	 * Render the search form and results table.
	 *
	 * Reads the search term and sort parameters from $_GET, runs the
	 * query, resolves each row's Instance value, applies the Author
	 * instance-assignment restriction, sorts in PHP, and outputs the
	 * admin markup with sortable column headers.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public static function render_page() {
		if ( ! current_user_can( 'edit_posts' ) ) {
			wp_die( 'You do not have permission to access this page.' );
		}

		$search_term = isset( $_GET['s'] ) ? sanitize_text_field( wp_unslash( $_GET['s'] ) ) : '';

		// Whitelist orderby/order to prevent arbitrary values reaching the sort logic.
		$allowed_orderby = array( 'title', 'post_type', 'instance' );
		$orderby          = isset( $_GET['orderby'] ) ? sanitize_key( wp_unslash( $_GET['orderby'] ) ) : 'title';
		$orderby          = in_array( $orderby, $allowed_orderby, true ) ? $orderby : 'title';

		$order = isset( $_GET['order'] ) ? strtolower( sanitize_key( wp_unslash( $_GET['order'] ) ) ) : 'asc';
		$order = 'desc' === $order ? 'desc' : 'asc';

		$results = array();

		if ( '' !== $search_term ) {
			$results = self::search_content( $search_term );

			foreach ( $results as &$row ) {
				$instance_id      = self::get_instance_id( $row['ID'], $row['post_type'] );
				$row['instance_id'] = $instance_id;
				$row['instance']    = self::get_instance_title( $instance_id, $row['post_type'], $row['title'] );
			}
			unset( $row );

			if ( self::is_restricted_author() ) {
				$results = self::filter_by_assigned_instances( $results );
			}

			self::sort_results( $results, $orderby, $order );
		}
		?>
		<div class="wrap">
			<h1>Search Graphic Data Content</h1>

			<form method="get" action="">
				<input type="hidden" name="page" value="graphic-data-search" />
				<p>
					<input
						type="text"
						name="s"
						value="<?php echo esc_attr( $search_term ); ?>"
						class="regular-text"
					/>
					<?php submit_button( 'Search', 'primary', 'submit', false ); ?>
				</p>
			</form>

			<?php if ( '' !== $search_term ) : ?>
				<h2><?php echo esc_html( count( $results ) . ' result(s) for "' . $search_term . '"' ); ?></h2>

				<?php if ( ! empty( $results ) ) : ?>
					<table class="wp-list-table widefat fixed striped">
						<thead>
							<tr>
								<?php
								self::sortable_column_header( 'Title', 'title', $search_term, $orderby, $order );
								self::sortable_column_header( 'Post Type', 'post_type', $search_term, $orderby, $order );
								self::sortable_column_header( 'Instance', 'instance', $search_term, $orderby, $order );
								?>
							</tr>
						</thead>
						<tbody>
							<?php foreach ( $results as $row ) : ?>
								<tr>
									<td>
										<a href="<?php echo esc_url( get_edit_post_link( $row['ID'] ) ); ?>">
											<?php echo esc_html( $row['title'] ? $row['title'] : '(no title)' ); ?>
										</a>
									</td>
									<td><?php echo esc_html( $row['post_type'] ); ?></td>
									<td><?php echo esc_html( $row['instance'] ); ?></td>
								</tr>
							<?php endforeach; ?>
						</tbody>
					</table>
				<?php else : ?>
					<p>No matching posts found.</p>
				<?php endif; ?>
			<?php endif; ?>
		</div>
		<?php
	}

	/**
	 * Output a single <th> with a sort toggle link, preserving the current search term.
	 *
	 * @since 1.0.0
	 *
	 * @param string $label       Visible column label.
	 * @param string $column_key  Key used in the orderby query arg (must be in $allowed_orderby).
	 * @param string $search_term Current search term, preserved across the sort link.
	 * @param string $orderby     Currently active orderby column.
	 * @param string $order       Currently active order ('asc'|'desc').
	 * @return void
	 */
	private static function sortable_column_header( $label, $column_key, $search_term, $orderby, $order ) {
		// Clicking the already-active column flips the direction; otherwise default to asc.
		$next_order = ( $orderby === $column_key && 'asc' === $order ) ? 'desc' : 'asc';

		$url = add_query_arg(
			array(
				'page'    => 'graphic-data-search',
				's'       => $search_term,
				'orderby' => $column_key,
				'order'   => $next_order,
			),
			admin_url( 'admin.php' )
		);

		$indicator = '';
		if ( $orderby === $column_key ) {
			$indicator = 'asc' === $order ? ' &uarr;' : ' &darr;';
		}

		echo '<th><a href="' . esc_url( $url ) . '">' . esc_html( $label ) . '</a>' . wp_kses( $indicator, array() ) . '</th>';
	}

	/**
	 * Sort the results array in place by the requested column and direction.
	 *
	 * Sorting is done in PHP rather than SQL because the Instance value
	 * is resolved after the initial query (it requires a per-row postmeta
	 * lookup and, for scene/modal/figure, a second post title lookup).
	 *
	 * @since 1.0.0
	 *
	 * @param array[] $results Results array, passed by reference. Each row has
	 *                         'ID', 'title', 'post_type', 'instance_id', 'instance' keys.
	 * @param string  $orderby One of 'title', 'post_type', 'instance'.
	 * @param string  $order   'asc' or 'desc'.
	 * @return void
	 */
	private static function sort_results( array &$results, $orderby, $order ) {
		usort(
			$results,
			static function ( $a, $b ) use ( $orderby, $order ) {
				$key_map = array(
					'title'     => 'title',
					'post_type' => 'post_type',
					'instance'  => 'instance',
				);
				$key     = $key_map[ $orderby ];

				$result = strcasecmp( (string) $a[ $key ], (string) $b[ $key ] );

				return 'desc' === $order ? -$result : $result;
			}
		);
	}

	/**
	 * Resolve the Instance post ID for a single result row.
	 *
	 * Behavior varies by post type:
	 * - about:    no Instance relationship, always returns 0.
	 * - instance: the post IS an Instance, so its own ID is returned.
	 * - scene:    resolved via the 'scene_location' postmeta.
	 * - modal:    resolved via the 'modal_location' postmeta.
	 * - figure:   resolved via the 'location' postmeta.
	 *
	 * @since 1.0.0
	 *
	 * @param int    $post_id   The result row's post ID.
	 * @param string $post_type The result row's post type.
	 * @return int Instance post ID, or 0 if not applicable/not found.
	 */
	private static function get_instance_id( $post_id, $post_type ) {
		if ( 'instance' === $post_type ) {
			return (int) $post_id;
		}

		if ( ! isset( self::$instance_meta_keys[ $post_type ] ) ) {
			return 0;
		}

		$meta_key = self::$instance_meta_keys[ $post_type ];

		return (int) get_post_meta( $post_id, $meta_key, true );
	}

	/**
	 * Resolve the Instance display title for a single result row.
	 *
	 * @since 1.0.0
	 *
	 * @param int    $instance_id   Instance post ID as resolved by get_instance_id().
	 * @param string $post_type     The result row's post type.
	 * @param string $current_title The result row's own title (used when post type is 'instance').
	 * @return string Instance title, or empty string if not applicable/not found.
	 */
	private static function get_instance_title( $instance_id, $post_type, $current_title ) {
		if ( 'about' === $post_type ) {
			return '';
		}

		if ( 'instance' === $post_type ) {
			return $current_title;
		}

		if ( ! $instance_id ) {
			return '';
		}

		if ( ! isset( self::$instance_title_cache[ $instance_id ] ) ) {
			self::$instance_title_cache[ $instance_id ] = get_the_title( $instance_id );
		}

		return self::$instance_title_cache[ $instance_id ];
	}

	/**
	 * Determine whether the current user should be restricted to their assigned Instances.
	 *
	 * Restriction applies to users holding the 'author' role who do not
	 * also hold a higher-privilege role (administrator or editor), so an
	 * Author who has additionally been granted Editor is not restricted.
	 *
	 * @since 1.0.0
	 *
	 * @return bool True if the current user should be limited to assigned Instances.
	 */
	private static function is_restricted_author() {
		$user = wp_get_current_user();

		if ( ! $user || ! in_array( 'author', (array) $user->roles, true ) ) {
			return false;
		}

		$higher_roles = array( 'administrator', 'editor' );
		if ( array_intersect( $higher_roles, (array) $user->roles ) ) {
			return false;
		}

		return true;
	}

	/**
	 * Filter results down to only those whose Instance is in the current user's assigned list.
	 *
	 * Reads 'assigned_instances' from wp_usermeta for the current user,
	 * which is expected to be an array of Instance post IDs. Rows with
	 * no Instance (e.g. 'about' posts, or an unresolved location meta)
	 * are excluded, since they cannot be matched to an assignment.
	 *
	 * @since 1.0.0
	 *
	 * @param array[] $results Results array, each row containing an 'instance_id' key.
	 * @return array[] Filtered results.
	 */
	private static function filter_by_assigned_instances( array $results ) {
		$raw_assigned = get_user_meta( get_current_user_id(), 'assigned_instances', true );

		// Defensive normalization: usermeta arrays can come back malformed or empty.
		$assigned_instances = array();
		if ( is_array( $raw_assigned ) ) {
			$assigned_instances = array_map( 'intval', $raw_assigned );
		}

		if ( empty( $assigned_instances ) ) {
			return array();
		}

		return array_values(
			array_filter(
				$results,
				static function ( $row ) use ( $assigned_instances ) {
					return ! empty( $row['instance_id'] ) && in_array( $row['instance_id'], $assigned_instances, true );
				}
			)
		);
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
	 *     @type int    $ID        Post ID.
	 *     @type string $title     Post title (may be empty).
	 *     @type string $post_type Post type slug.
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
			SELECT DISTINCT p.ID, p.post_title, p.post_type
			FROM {$wpdb->posts} p
			LEFT JOIN {$wpdb->postmeta} pm ON pm.post_id = p.ID
			WHERE p.post_status != 'trash'
				AND p.post_type IN ( {$post_type_placeholders} )
				AND ( p.post_title LIKE %s OR pm.meta_value LIKE %s )
			ORDER BY p.post_title ASC
		";
		// phpcs:enable WordPress.DB.PreparedSQL.NotPrepared

		// Parameter order must match the %s placeholders left-to-right in $sql above:
		// 1) post_type IN (...), 2) title LIKE, 3) meta_value LIKE.
		$params = array_merge( self::$post_types, array( $like, $like ) );
		$query  = $wpdb->prepare( $sql, $params ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared

		// Direct query is required here; no WP API covers cross-table postmeta search.
		$rows = $wpdb->get_results( $query, ARRAY_A ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		$results = array();
		foreach ( $rows as $row ) {
			$results[] = array(
				'ID'        => (int) $row['ID'],
				'title'     => $row['post_title'],
				'post_type' => $row['post_type'],
			);
		}

		return $results;
	}
}