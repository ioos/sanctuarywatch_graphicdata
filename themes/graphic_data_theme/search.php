<?php
/**
 * Graphic Data Theme — Search results page.
 *
 * Aggregates results across four Graphic Data custom post types
 * (about, scene, modal, figure) plus standard posts and pages.
 * CPTs are filtered by their `{cpt}_published` postmeta = 'published'.
 * Search matches post title, post content, post excerpt, and any
 * non-private postmeta value (the latter via the posts_search filter
 * registered in functions.php).
 *
 * @package Graphic_Data_Theme
 */

defined( 'ABSPATH' ) || exit;

get_header();

/**
 * Trim a description for display in search results.
 *
 * Strips shortcodes and HTML first so the character count is meaningful and
 * the output is safe to render as plain text. Truncates to at most 140
 * characters without splitting words: walks back to the last whitespace at
 * or before the limit, then appends a Unicode ellipsis. Multibyte-safe.
 *
 * @param string $text Raw source text.
 * @return string Cleaned, trimmed description, or '' when the source is empty.
 */
function graphic_data_search_trim_description( $text ) {
	$text = (string) $text;
	if ( '' === trim( $text ) ) {
		return '';
	}

	$text = strip_shortcodes( $text );
	$text = wp_strip_all_tags( $text );
	// Collapse any run of whitespace (newlines, tabs, multiple spaces) to
	// a single space so the character budget isn't spent on layout junk.
	$text = trim( preg_replace( '/\s+/u', ' ', $text ) );

	$graphic_data_limit = 140;

	if ( mb_strlen( $text ) <= $graphic_data_limit ) {
		return $text;
	}

	// Take the first $limit characters, then walk back to the last space so
	// we cut on a word boundary. If no space exists in that window (a single
	// long "word"), fall back to a hard cut at the limit.
	$graphic_data_cut  = mb_substr( $text, 0, $graphic_data_limit );
	$graphic_data_last = mb_strrpos( $graphic_data_cut, ' ' );
	if ( false !== $graphic_data_last && $graphic_data_last > 0 ) {
		$graphic_data_cut = mb_substr( $graphic_data_cut, 0, $graphic_data_last );
	}

	return rtrim( $graphic_data_cut, " ,;:.!?-" ) . '…';
}

$graphic_data_search_query = get_search_query();
?>

<div class="container my-4">
	<h1 class="h3 mb-4">
		Search results for &ldquo;<?php echo esc_html( $graphic_data_search_query ); ?>&rdquo;
	</h1>

	<?php
	if ( '' === trim( $graphic_data_search_query ) ) {
		echo '<p>Please enter a search term.</p>';
	} else {

		// CPT config: meta key that must equal 'published', label, and
		// a callback returning the URL for a matched post.
		$graphic_data_cpt_config = array(
			'about'  => array(
				'meta_key' => 'about_published',
				'label'    => 'About',
				'link_cb'  => static function ( $post_id ) {
					return home_url( '/about' );
				},
				'description_cb' => static function ( $post_id ) {
					return get_post_meta( $post_id, 'aboutMain', true );
				},
			),
			'scene'  => array(
				'meta_key' => 'scene_published',
				'label'    => 'Scene',
				'link_cb'  => static function ( $post_id ) {
					return get_permalink( $post_id );
				},
				'description_cb' => static function ( $post_id ) {
					return get_post_meta( $post_id, 'scene_tagline', true );
				},
			),
			'modal'  => array(
				'meta_key' => 'modal_published',
				'label'    => 'Modal',
				'link_cb'  => static function ( $post_id ) {
					$modal_instance = get_post_meta( $post_id, 'modal_location', true );
					$modal_instance_title = get_the_title( $modal_instance );
					$modal_scene = get_post_meta( $post_id, 'modal_scene', true );
					$modal_scene_title = get_the_title( $modal_scene );
					$modal_title = get_the_title( $post_id );
					$relative_link = str_replace( ' ', '-', $modal_instance_title . '/' . $modal_scene_title . '/#' . $modal_title . '/1' );
					return home_url( '/' ) . $relative_link;
				},
				'description_cb' => static function ( $post_id ) {
					return get_post_meta( $post_id, 'modal_tagline', true );
				},
			),
			'figure' => array(
				'meta_key' => 'figure_published',
				'label'    => 'Figure',
				'link_cb'  => static function ( $post_id ) {
					$figure_instance = get_post_meta( $post_id, 'location', true );
					$figure_instance_title = get_the_title( $figure_instance );
					$figure_scene = get_post_meta( $post_id, 'figure_scene', true );
					$figure_scene_title = get_the_title( $figure_scene );
					$figure_modal = get_post_meta( $post_id, 'figure_modal', true );
					$modal_title = get_the_title( $figure_modal );
					$figure_tab = get_post_meta( $post_id, 'figure_tab', true );
					$relative_link = str_replace( ' ', '-', $figure_instance_title . '/' . $figure_scene_title . '/#' . $modal_title . '/' . $figure_tab );
					return home_url( '/' ) . $relative_link;
				},
				'description_cb' => static function ( $post_id ) {
					return get_post_meta( $post_id, 'figure_caption_short', true );
				},
			),
		);

		$graphic_data_results = array();

		/*
		* Ancestry-based visibility filters.
		*
		* For scenes, modals, and figures, a post is only shown if the posts it
		* references via its `*_location`, `*_scene`, and `*_modal` meta keys are
		* themselves in a valid state. Because meta_query can't join across posts,
		* we pre-fetch the eligible parent IDs at each level here and pass them
		* into the CPT queries below as IN() lists.
		*
		* Rules (from spec):
		*   - Instance is eligible if instance_status = "Published" AND
		*     post_title != "Placeholder".
		*   - Scene (as parent) is eligible if scene_status = "published".
		*   - Modal (as parent) is eligible if modal_status = "published".
		*/

		// Eligible instances: instance_status = "Published", then drop "Placeholder" titles.
		$graphic_data_valid_instance_ids = get_posts( array(
			'post_type'      => 'instance',
			'post_status'    => 'publish',
			'posts_per_page' => -1,
			'fields'         => 'ids',
			'no_found_rows'  => true,
			'meta_query'     => array(
				array(
					'key'     => 'instance_status',
					'value'   => 'Published',
					'compare' => '=',
				),
			),
		) );
		$graphic_data_valid_instance_ids = array_values( array_filter(
			$graphic_data_valid_instance_ids,
			static function ( $graphic_data_id ) {
				return 'Placeholder Instance' !== get_the_title( $graphic_data_id );
			}
		) );

		// Eligible scenes: scene_status = "published".
		$graphic_data_valid_scene_ids = get_posts( array(
			'post_type'      => 'scene',
			'post_status'    => 'publish',
			'posts_per_page' => -1,
			'fields'         => 'ids',
			'no_found_rows'  => true,
			'meta_query'     => array(
				array(
					'key'     => 'scene_published',
					'value'   => 'published',
					'compare' => '=',
				),
			),
		) );

		// Eligible modals: modal_status = "published".
		$graphic_data_valid_modal_ids = get_posts( array(
			'post_type'      => 'modal',
			'post_status'    => 'publish',
			'posts_per_page' => -1,
			'fields'         => 'ids',
			'no_found_rows'  => true,
			'meta_query'     => array(
				array(
					'key'     => 'modal_published',
					'value'   => 'published',
					'compare' => '=',
				),
			),
		) );

		/*
		* Per-CPT ancestry rules. Each rule says: "the post's {meta_key} must be one
		* of these {valid_ids}". If any list is empty for a given CPT, that CPT has
		* no possible visible results and its query is skipped entirely.
		*/
		$graphic_data_ancestry_rules = array(
			'about'  => array(),
			'scene'  => array(
				array( 'meta_key' => 'scene_location', 'valid_ids' => $graphic_data_valid_instance_ids ),
			),
			'modal'  => array(
				array( 'meta_key' => 'modal_location', 'valid_ids' => $graphic_data_valid_instance_ids ),
				array( 'meta_key' => 'modal_scene', 'valid_ids' => $graphic_data_valid_scene_ids ),
			),
			'figure' => array(
				array( 'meta_key' => 'location', 'valid_ids' => $graphic_data_valid_instance_ids ),
				array( 'meta_key' => 'figure_scene', 'valid_ids' => $graphic_data_valid_scene_ids ),
				array( 'meta_key' => 'figure_modal', 'valid_ids' => $graphic_data_valid_modal_ids ),
			),
		);

		// Query each Graphic Data custom post type.
		foreach ( $graphic_data_cpt_config as $graphic_data_post_type => $graphic_data_config ) {

			// Base: post's own published-status meta must equal "published".
			$graphic_data_meta_query = array(
				'relation' => 'AND',
				array(
					'key'     => $graphic_data_config['meta_key'],
					'value'   => 'published',
					'compare' => '=',
				),
			);

			// Add ancestry filters: each parent-meta-key must match an eligible ID.
			// If any level has zero eligible parents, skip this CPT entirely.
			$graphic_data_ancestors_ok = true;
			foreach ( $graphic_data_ancestry_rules[ $graphic_data_post_type ] as $graphic_data_rule ) {
				if ( empty( $graphic_data_rule['valid_ids'] ) ) {
					$graphic_data_ancestors_ok = false;
					break;
				}
				$graphic_data_meta_query[] = array(
					'key'     => $graphic_data_rule['meta_key'],
					'value'   => $graphic_data_rule['valid_ids'],
					'compare' => 'IN',
				);
			}
			if ( ! $graphic_data_ancestors_ok ) {
				continue;
			}

			$graphic_data_cpt_args = array(
				'post_type'                => $graphic_data_post_type,
				'post_status'              => 'publish',
				's'                        => $graphic_data_search_query,
				'posts_per_page'           => -1,
				'no_found_rows'            => true,
				'graphic_data_meta_search' => true,
				'meta_query'               => $graphic_data_meta_query,
			);
			$graphic_data_cpt_query = new WP_Query( $graphic_data_cpt_args );
			if ( $graphic_data_cpt_query->have_posts() ) {
				while ( $graphic_data_cpt_query->have_posts() ) {
					$graphic_data_cpt_query->the_post();
					$graphic_data_id        = get_the_ID();
					$graphic_data_results[] = array(
						'title' => get_the_title(),
						'link'  => call_user_func( $graphic_data_config['link_cb'], $graphic_data_id ),
						'label' => $graphic_data_config['label'],
						'description' => graphic_data_search_trim_description(
							call_user_func( $graphic_data_config['description_cb'], $graphic_data_id )
						),
					);
				}
				wp_reset_postdata();
			}
		}

		// Query standard posts and pages (Gutenberg content is in post_content,
		// so the default WP_Query search covers it).
		$graphic_data_std_args = array(
			'post_type'      => array( 'post', 'page' ),
			'post_status'    => 'publish',
			's'              => $graphic_data_search_query,
			'posts_per_page' => -1,
			'no_found_rows'  => true,
		);
		$graphic_data_std_query = new WP_Query( $graphic_data_std_args );
		if ( $graphic_data_std_query->have_posts() ) {
			while ( $graphic_data_std_query->have_posts() ) {
				$graphic_data_std_query->the_post();
				$graphic_data_results[] = array(
					'title' => get_the_title(),
					'link'  => get_permalink( get_the_ID() ),
					'label' => ( 'page' === get_post_type() ) ? 'Page' : 'Post',
					'description' => graphic_data_search_trim_description(
						get_post_field( 'post_content', get_the_ID() )
					),
				);
			}
			wp_reset_postdata();
		}

		if ( empty( $graphic_data_results ) ) {
			echo '<p>No results found.</p>';
		} else {
			echo '<ul class="list-unstyled">';
			foreach ( $graphic_data_results as $graphic_data_result ) {
				echo '<li class="mb-3">';
				echo '<span class="badge bg-secondary me-2">' . esc_html( $graphic_data_result['label'] ) . '</span>';
				echo '<a href="' . esc_url( $graphic_data_result['link'] ) . '">' . esc_html( $graphic_data_result['title'] ) . '</a>';
				if ( '' !== $graphic_data_result['description'] ) {
					echo '<div class="text-muted small mt-1">' . esc_html( $graphic_data_result['description'] ) . '</div>';
				}
				echo '</li>';
			}
			echo '</ul>';
		}
	}
	?>
</div>

<?php
get_footer();