<?php
/**
 * Content Transfer admin page for the Graphic Data plugin.
 *
 * Adds a "Content Transfer" submenu under `graphic-data-search` for moving
 * Graphic Data content between sites. Administrators can export whole
 * Instances (optionally with their tagged pages and the About post) or any
 * selection of Scenes, Modals and Figures, and import packages (see
 * Graphic_Data_Transfer_Importer). Editors can export and import a single
 * Figure.
 *
 * Not to be confused with "Figure Reports" (Graphic_Data_Export_Figures),
 * which turns figure content into documents and slides.
 *
 * @package Graphic_Data_Plugin
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once plugin_dir_path( __DIR__ ) . 'admin/class-transfer-schema.php';
require_once plugin_dir_path( __DIR__ ) . 'admin/class-transfer-exporter.php';
require_once plugin_dir_path( __DIR__ ) . 'admin/class-transfer-importer.php';
require_once plugin_dir_path( __DIR__ ) . 'admin/class-figure-html-rebuild.php';

/**
 * Class Graphic_Data_Content_Transfer.
 *
 * @since 1.10.0
 */
class Graphic_Data_Content_Transfer {

	/**
	 * Nonce action used for all Content Transfer requests.
	 */
	const NONCE_ACTION = 'graphic_data_content_transfer';

	/**
	 * Capability required to open the page.
	 *
	 * `edit_others_posts` is held by the Editor role and above. Editors are
	 * limited to single-figure transfers (and to undoing their own imports);
	 * see FULL_CAPABILITY.
	 */
	const CAPABILITY = 'edit_others_posts';

	/**
	 * Capability required for everything beyond single-figure transfers.
	 */
	const FULL_CAPABILITY = 'manage_options';

	/**
	 * Parent admin menu slug that this page hangs off of.
	 */
	const PARENT_SLUG = 'graphic-data-search';

	/**
	 * This page's admin menu slug.
	 */
	const PAGE_SLUG = 'graphic-data-content-transfer';

	/**
	 * Post types that administrators can pick individually.
	 */
	const SELECTABLE_TYPES = array( 'scene', 'modal', 'figure' );

	/**
	 * Absolute URL to the plugin root (for asset URLs).
	 *
	 * @var string
	 */
	private $plugin_url;

	/**
	 * Version string used for asset cache-busting.
	 *
	 * @var string
	 */
	private $version;

	/**
	 * Full hook suffix for this page (populated once WP registers it).
	 *
	 * @var string
	 */
	private $page_hook = '';

	/**
	 * Constructor.
	 *
	 * @param string $plugin_url Absolute URL to the plugin root, with trailing slash.
	 * @param string $version    Version string for asset URLs.
	 */
	public function __construct( $plugin_url = '', $version = '1.0.0' ) {
		if ( '' === $plugin_url ) {
			$plugin_url = plugin_dir_url( __DIR__ );
		}
		$this->plugin_url = trailingslashit( $plugin_url );
		$this->version    = $version;

		add_action( 'admin_menu', array( $this, 'register_submenu' ), 20 );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
		add_action( 'wp_ajax_graphic_data_transfer_preview', array( $this, 'ajax_preview' ) );
		add_action( 'admin_post_graphic_data_transfer_export', array( $this, 'handle_export' ) );
		add_action( 'wp_ajax_graphic_data_transfer_import_upload', array( $this, 'ajax_import_upload' ) );
		add_action( 'wp_ajax_graphic_data_transfer_import_run', array( $this, 'ajax_import_run' ) );
		add_action( 'wp_ajax_graphic_data_transfer_import_cancel', array( $this, 'ajax_import_cancel' ) );
		add_action( 'wp_ajax_graphic_data_transfer_import_undo', array( $this, 'ajax_import_undo' ) );
		add_action( 'wp_ajax_graphic_data_transfer_html_list', array( $this, 'ajax_html_list' ) );
		add_action( 'wp_ajax_graphic_data_transfer_html_figure', array( $this, 'ajax_html_figure' ) );
		add_action( 'wp_ajax_graphic_data_transfer_html_save', array( $this, 'ajax_html_save' ) );
		add_action( 'wp_ajax_graphic_data_transfer_render_save', array( $this, 'ajax_render_save' ) );
		add_action( 'admin_post_graphic_data_transfer_tsv_template', array( $this, 'handle_tsv_template' ) );
	}

	/**
	 * Register the Content Transfer submenu page.
	 */
	public function register_submenu() {
		$this->page_hook = (string) add_submenu_page(
			self::PARENT_SLUG,
			'Graphic Data Content Transfer',
			'Content Transfer',
			self::CAPABILITY,
			self::PAGE_SLUG,
			array( $this, 'render_page' ),
			35
		);
	}

	/**
	 * Enqueue CSS and the ES module for the Content Transfer page only.
	 *
	 * @param string $hook_suffix Current admin page hook.
	 */
	public function enqueue_assets( $hook_suffix ) {
		if ( '' === $this->page_hook || $hook_suffix !== $this->page_hook ) {
			return;
		}

		wp_enqueue_style(
			'graphic-data-content-transfer',
			$this->plugin_url . 'admin/css/content-transfer.css',
			array(),
			$this->version
		);

		// The standalone figure HTML generator, for rebuilding imported Figures'
		// HTML files. Registered here too because class-admin.php only
		// registers it on post edit screens.
		wp_register_script_module(
			'@graphic-data/tabulator-table',
			$this->plugin_url . 'includes/figures/js/interactive/tabulator-table.js',
			array(),
			$this->version
		);
		wp_register_script_module(
			'@graphic-data/figure-html',
			$this->plugin_url . 'admin/js/figure-html.js',
			array( '@graphic-data/tabulator-table' ),
			$this->version
		);
		// The edit screen's chart builders, for building the saved figure of
		// bulk-imported Interactive figures from their settings.
		wp_register_script_module(
			'@graphic-data/plotly-utility',
			$this->plugin_url . 'includes/figures/js/interactive/plotly-utility.js',
			array(),
			$this->version
		);
		wp_register_script_module(
			'@graphic-data/plotly-bar',
			$this->plugin_url . 'includes/figures/js/interactive/plotly-bar.js',
			array( '@graphic-data/plotly-utility' ),
			$this->version
		);
		wp_register_script_module(
			'@graphic-data/plotly-timeseries-line',
			$this->plugin_url . 'includes/figures/js/interactive/plotly-timeseries-line.js',
			array( '@graphic-data/plotly-utility' ),
			$this->version
		);
		wp_register_script_module(
			'@graphic-data/content-transfer',
			$this->plugin_url . 'admin/js/content-transfer.js',
			array( '@graphic-data/figure-html', '@graphic-data/plotly-bar', '@graphic-data/plotly-timeseries-line' ),
			$this->version
		);
		wp_enqueue_script_module( '@graphic-data/content-transfer' );
	}

	/**
	 * Render the admin page markup.
	 */
	public function render_page() {
		if ( ! current_user_can( self::CAPABILITY ) ) {
			wp_die( 'You do not have permission to access this page.' );
		}

		$full = current_user_can( self::FULL_CAPABILITY );
		?>
		<div class="wrap graphic-data-content-transfer">
			<h1>Graphic Data Content Transfer</h1>
			<p class="description">
				Move Graphic Data content to another site. An export package is a zip file containing the content,
				its images and its figure data files.
			</p>

			<?php if ( ! class_exists( 'ZipArchive' ) ) : ?>
				<div class="notice notice-error inline">
					<p>Exporting and importing require the PHP ZipArchive extension, which is not available on this server.</p>
				</div>
			<?php endif; ?>

			<div class="graphic-data-content-transfer__section">
				<h2>Export</h2>

				<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" id="graphic-data-transfer-export-form">
					<input type="hidden" name="action" value="graphic_data_transfer_export">
					<?php wp_nonce_field( self::NONCE_ACTION ); ?>

					<?php if ( $full ) : ?>
						<fieldset class="graphic-data-content-transfer__scope">
							<legend class="screen-reader-text">What to export</legend>
							<label><input type="radio" name="scope" value="instances" checked> Whole Instances</label>
							<label><input type="radio" name="scope" value="selected"> Selected Scenes, Modals and Figures</label>
						</fieldset>

						<div class="graphic-data-content-transfer__panel" data-scope="instances">
							<p><strong>Instances</strong></p>
							<?php $this->render_instance_checkboxes(); ?>
							<p>
								<label>
									<input type="checkbox" name="include_pages" value="1">
									Include WordPress pages tagged with these Instances
								</label>
							</p>
							<p>
								<label>
									<input type="checkbox" name="include_about" value="1">
									Include the About content (replaces the About content on the destination site)
								</label>
							</p>
						</div>

						<div class="graphic-data-content-transfer__panel" data-scope="selected" hidden>
							<p class="description">
								Ticking a Scene or Modal also ticks everything beneath it; untick any item you want to leave out.
								Links to content that is not selected can be pointed at existing content when the package is imported.
							</p>
							<?php $this->render_content_tree(); ?>
							<p class="graphic-data-content-transfer__selected-count" id="graphic-data-transfer-selected-count" role="status" aria-live="polite"></p>
						</div>
					<?php else : ?>
						<input type="hidden" name="scope" value="single">
						<p>Editors can export one Figure at a time.</p>
						<p>
							<label for="graphic-data-transfer-item-figure"><strong>Figure</strong></label><br>
							<?php $this->render_figure_select(); ?>
						</p>
					<?php endif; ?>

					<p class="graphic-data-content-transfer__actions">
						<button type="button" class="button" id="graphic-data-transfer-preview">Preview export</button>
						<button type="submit" class="button button-primary" <?php disabled( ! class_exists( 'ZipArchive' ) ); ?>>Download export package</button>
					</p>
				</form>

				<div class="graphic-data-content-transfer__status" id="graphic-data-transfer-status" hidden>
					<span class="spinner is-active" aria-hidden="true"></span>
					<span role="status" aria-live="polite">Gathering content…</span>
				</div>

				<div class="graphic-data-content-transfer__preview" id="graphic-data-transfer-preview-output" hidden></div>
			</div>

			<?php $this->render_import_section( $full ); ?>

			<?php $this->render_rebuild_section( $full ); ?>
		</div>
		<?php
	}

	/**
	 * Output the Import section and the import history.
	 *
	 * @param bool $full Whether the user may import any package, rather than
	 *                   a single Figure only.
	 * @return void
	 */
	private function render_import_section( $full ) {
		// Leave headroom below the server limit for the other form fields.
		$chunk_size = (int) floor( min( wp_max_upload_size(), 8 * MB_IN_BYTES ) * 0.9 );
		?>
		<div class="graphic-data-content-transfer__section" id="graphic-data-transfer-import"
			data-nonce="<?php echo esc_attr( wp_create_nonce( self::NONCE_ACTION ) ); ?>"
			data-chunk-size="<?php echo esc_attr( $chunk_size ); ?>">
			<h2>Import</h2>
			<?php if ( $full ) : ?>
				<p class="description">
					Import a package exported from Graphic Data on this or another site. Nothing is changed until you
					have reviewed what the import will do and chosen what its links point to on this site.
				</p>
				<ul class="graphic-data-content-transfer__rules">
					<li>Everything is created new and assigned to you. Content that already exists here is imported as a copy with its Status set to Draft.</li>
					<li>Links to content that is not in the package can be pointed at content on this site. Scenes, Modals and Figures left without their Instance, Scene or Modal are imported with their Status set to Draft and listed as needing attention.</li>
					<li>An About post in the package replaces this site's About content.</li>
					<li>Instance Types with the same slug as an existing one are reused.</li>
				</ul>
				<p>
					<strong>Bulk import from spreadsheets:</strong> instead of a package, you can upload a zip of tab-delimited
					(TSV) spreadsheets, one per content type, with the images and figure data they use. It is checked and imported
					like a package. Pages and the About content cannot be bulk imported.
					<a href="<?php echo esc_url( wp_nonce_url( admin_url( 'admin-post.php?action=graphic_data_transfer_tsv_template' ), self::NONCE_ACTION ) ); ?>">Download the bulk import template</a>
					(its README.tsv describes every column).
				</p>
			<?php else : ?>
				<p class="description">
					Import a single Figure exported from Graphic Data on this or another site. You choose its Instance,
					Scene, Modal and tab before anything is changed.
				</p>
				<ul class="graphic-data-content-transfer__rules">
					<li>The Figure is created new and assigned to you. If it already exists here, it is imported as a copy with its Status set to Draft.</li>
					<li>A Figure left without an Instance, Scene or Modal is imported with its Status set to Draft.</li>
				</ul>
			<?php endif; ?>

			<p>
				<label for="graphic-data-transfer-import-file"><strong><?php echo esc_html( $full ? 'Package or bulk import (.zip)' : 'Package (.zip)' ); ?></strong></label><br>
				<input type="file" id="graphic-data-transfer-import-file" accept=".zip,application/zip">
			</p>
			<p class="graphic-data-content-transfer__actions">
				<button type="button" class="button" id="graphic-data-transfer-import-check" <?php disabled( ! class_exists( 'ZipArchive' ) ); ?>>Upload and check package</button>
			</p>

			<div class="graphic-data-content-transfer__status" id="graphic-data-transfer-import-status" hidden>
				<span class="spinner is-active" aria-hidden="true"></span>
				<span role="status" aria-live="polite" id="graphic-data-transfer-import-status-text"></span>
				<progress id="graphic-data-transfer-import-progress" max="1" value="0" hidden></progress>
			</div>

			<div class="graphic-data-content-transfer__preview" id="graphic-data-transfer-import-output" hidden></div>

			<?php $this->render_import_history( $full ); ?>
		</div>
		<?php
	}

	/**
	 * Output the panel that builds the standalone HTML of imported Figures
	 * (and, for administrators, rebuilds it for every Figure or an Instance).
	 *
	 * @param bool $full Whether the user is an administrator.
	 * @return void
	 */
	private function render_rebuild_section( $full ) {
		$waiting = count( Graphic_Data_Figure_Html_Rebuild::get_queue() );
		?>
		<div class="graphic-data-content-transfer__section" id="graphic-data-transfer-rebuild"
			data-nonce="<?php echo esc_attr( wp_create_nonce( self::NONCE_ACTION ) ); ?>">
			<h2>Standalone figure HTML</h2>
			<p class="description">
				Each published Figure has standalone HTML files, which are opened directly or embedded in an iframe.
				They are built for imported Figures straight after the import; if that was interrupted, finish it here.
			</p>
			<p id="graphic-data-transfer-rebuild-queue">
				<?php if ( $waiting ) : ?>
					<?php echo esc_html( sprintf( 1 === $waiting ? '%d imported Figure is waiting for its standalone HTML.' : '%d imported Figures are waiting for their standalone HTML.', $waiting ) ); ?>
					<button type="button" class="button" data-rebuild="queue">Build now</button>
				<?php else : ?>
					No imported Figures are waiting for their standalone HTML.
				<?php endif; ?>
			</p>
			<?php if ( $full ) : ?>
				<p>
					<label for="graphic-data-transfer-rebuild-scope">Rebuild the standalone HTML of</label>
					<select id="graphic-data-transfer-rebuild-scope">
						<option value="all">every Figure</option>
						<?php foreach ( $this->get_exportable_posts( 'instance' ) as $instance ) : ?>
							<option value="<?php echo esc_attr( $instance->ID ); ?>"><?php echo esc_html( 'Figures in ' . $this->get_display_title( $instance ) ); ?></option>
						<?php endforeach; ?>
					</select>
					<button type="button" class="button" data-rebuild="scope">Rebuild</button>
				</p>
				<p class="description">Useful after the site has moved to a new address. Only Figures whose Status is Published have standalone HTML.</p>
			<?php endif; ?>
			<div class="graphic-data-content-transfer__status" id="graphic-data-transfer-rebuild-status" hidden>
				<span class="spinner is-active" aria-hidden="true"></span>
				<span role="status" aria-live="polite" id="graphic-data-transfer-rebuild-status-text"></span>
				<progress id="graphic-data-transfer-rebuild-progress" max="1" value="0"></progress>
			</div>
			<div class="graphic-data-content-transfer__preview" id="graphic-data-transfer-rebuild-output" hidden></div>
		</div>
		<?php
	}

	/**
	 * Output the list of recent imports, with an Undo button for each.
	 * Editors see only their own imports.
	 *
	 * @param bool $full Whether the user may see and undo every import.
	 * @return void
	 */
	private function render_import_history( $full ) {
		$batches = Graphic_Data_Transfer_Importer::get_batches();
		if ( ! $full ) {
			$batches = array_filter( $batches, array( $this, 'can_undo' ) );
		}
		if ( empty( $batches ) ) {
			return;
		}
		$labels = array(
			'running' => 'Incomplete',
			'done'    => 'Imported',
			'undone'  => 'Undone',
		);
		?>
		<h3>Recent imports</h3>
		<table class="widefat striped graphic-data-content-transfer__history">
			<thead>
				<tr><th>Date</th><th>From</th><th>Result</th><th>Needs attention</th><th><span class="screen-reader-text">Actions</span></th></tr>
			</thead>
			<tbody>
				<?php foreach ( $batches as $batch ) : ?>
					<?php
					$report     = is_array( $batch['report'] ) ? $batch['report'] : array();
					$unassigned = $report['unassigned'] ?? array();
					$user       = get_userdata( (int) $batch['user_id'] );
					?>
					<tr>
						<td>
							<?php echo esc_html( wp_date( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), (int) $batch['started'] ) ); ?>
							<?php if ( $user ) : ?>
								<br><span class="description">by <?php echo esc_html( $user->display_name ); ?></span>
							<?php endif; ?>
						</td>
						<td><?php echo esc_html( Graphic_Data_Transfer_Tsv::PACKAGE_TYPE === $batch['package_type'] ? 'Bulk import from spreadsheets' : $batch['source'] ); ?></td>
						<td>
							<?php echo esc_html( $labels[ $batch['status'] ] ?? $batch['status'] ); ?>
							<?php if ( $report ) : ?>
								<br><span class="description"><?php echo esc_html( sprintf( '%d items', count( $report['created'] ?? array() ) ) ); ?></span>
							<?php endif; ?>
							<?php if ( '' !== (string) $batch['message'] ) : ?>
								<br><span class="description"><?php echo esc_html( $batch['message'] ); ?></span>
							<?php endif; ?>
						</td>
						<td>
							<?php if ( $unassigned && 'done' === $batch['status'] ) : ?>
								<details>
									<summary><?php echo esc_html( sprintf( '%d missing an Instance, Scene or Modal', count( $unassigned ) ) ); ?></summary>
									<ul>
										<?php foreach ( $unassigned as $item ) : ?>
											<li>
												<?php if ( get_post( $item['id'] ) ) : ?>
													<a href="<?php echo esc_url( get_edit_post_link( $item['id'], 'raw' ) ); ?>"><?php echo esc_html( $item['title'] ? $item['title'] : '(no title)' ); ?></a>
												<?php else : ?>
													<?php echo esc_html( $item['title'] ); ?>
												<?php endif; ?>
												<span class="description">(<?php echo esc_html( implode( ', ', array_map( 'ucfirst', $item['missing'] ) ) ); ?>)</span>
											</li>
										<?php endforeach; ?>
									</ul>
								</details>
							<?php else : ?>
								—
							<?php endif; ?>
						</td>
						<td>
							<?php if ( 'undone' !== $batch['status'] ) : ?>
								<button type="button" class="button button-link-delete graphic-data-content-transfer__undo" data-batch="<?php echo esc_attr( $batch['id'] ); ?>">Undo import</button>
							<?php endif; ?>
						</td>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
		<?php
	}

	/**
	 * Output a checkbox for every Instance.
	 *
	 * @return void
	 */
	private function render_instance_checkboxes() {
		$instances = $this->get_exportable_posts( 'instance' );

		if ( empty( $instances ) ) {
			echo '<p>There are no Instances to export.</p>';
			return;
		}

		echo '<ul class="graphic-data-content-transfer__instances">';
		foreach ( $instances as $instance ) {
			printf(
				'<li><label><input type="checkbox" name="instance_ids[]" value="%d"> %s%s</label></li>',
				(int) $instance->ID,
				esc_html( $instance->post_title ),
				'publish' === $instance->post_status ? '' : ' <em>(' . esc_html( $instance->post_status ) . ')</em>'
			);
		}
		echo '</ul>';
	}

	/**
	 * Output a select listing every Figure, grouped by Instance (the
	 * Editor's single-figure export).
	 *
	 * @return void
	 */
	private function render_figure_select() {
		$meta_key = Graphic_Data_Transfer_Schema::get_instance_meta_key( 'figure' );
		$groups   = array();
		foreach ( $this->get_exportable_posts( 'figure' ) as $post ) {
			$instance_id = (int) get_post_meta( $post->ID, $meta_key, true );
			$group       = $instance_id ? get_the_title( $instance_id ) : '';
			$groups[ '' === $group ? 'No Instance' : $group ][] = $post;
		}
		ksort( $groups, SORT_NATURAL | SORT_FLAG_CASE );

		echo '<select name="item_id_figure" id="graphic-data-transfer-item-figure">';
		echo '<option value="">— Select —</option>';
		foreach ( $groups as $group => $group_posts ) {
			printf( '<optgroup label="%s">', esc_attr( $group ) );
			foreach ( $group_posts as $post ) {
				printf(
					'<option value="%d">%s%s</option>',
					(int) $post->ID,
					esc_html( $this->get_display_title( $post ) ),
					'publish' === $post->post_status ? '' : esc_html( ' (' . $post->post_status . ')' )
				);
			}
			echo '</optgroup>';
		}
		echo '</select>';
	}

	/**
	 * Output every Scene, Modal and Figure as a checkbox tree, nested
	 * Instance → Scene → Modal → Figure, with one collapsible group per
	 * Instance. Items whose parent is missing (for example a Modal whose
	 * Scene was deleted) are listed in a final group.
	 *
	 * @return void
	 */
	private function render_content_tree() {
		$parent_types = array(
			'scene'  => 'instance',
			'modal'  => 'scene',
			'figure' => 'modal',
		);
		$parent_keys  = array(
			'scene'  => 'scene_location',
			'modal'  => 'modal_scene',
			'figure' => 'figure_modal',
		);

		$types = array();
		foreach ( $this->get_exportable_posts( 'instance' ) as $instance ) {
			$types[ $instance->ID ] = 'instance';
		}

		$children = array();
		$orphans  = array();
		foreach ( $parent_types as $type => $parent_type ) {
			foreach ( $this->get_exportable_posts( $type ) as $post ) {
				$types[ $post->ID ] = $type;
				$parent_id          = (int) get_post_meta( $post->ID, $parent_keys[ $type ], true );
				if ( isset( $types[ $parent_id ] ) && $parent_type === $types[ $parent_id ] ) {
					$children[ $parent_id ][] = $post;
				} else {
					$orphans[] = $post;
				}
			}
		}

		if ( count( $types ) === count( array_keys( $types, 'instance', true ) ) ) {
			echo '<p>There are no Scenes, Modals or Figures to export.</p>';
			return;
		}

		echo '<div class="graphic-data-content-transfer__tree">';
		foreach ( $this->get_exportable_posts( 'instance' ) as $instance ) {
			if ( ! empty( $children[ $instance->ID ] ) ) {
				$this->render_tree_group( $this->get_display_title( $instance ), $children[ $instance->ID ], $children );
			}
		}
		if ( ! empty( $orphans ) ) {
			$this->render_tree_group( 'Not attached to an Instance, Scene or Modal', $orphans, $children );
		}
		echo '</div>';
	}

	/**
	 * Output one collapsible group of the content tree.
	 *
	 * @param string    $label    Group heading.
	 * @param WP_Post[] $posts    Top-level posts in the group.
	 * @param array     $children Child posts keyed by parent post ID.
	 * @return void
	 */
	private function render_tree_group( $label, $posts, $children ) {
		$count = $this->count_tree_items( $posts, $children );
		?>
		<details class="graphic-data-content-transfer__tree-group">
			<summary>
				<?php echo esc_html( $label ); ?>
				<span class="graphic-data-content-transfer__tree-count">
					(<?php echo esc_html( sprintf( 1 === $count ? '%d item' : '%d items', $count ) ); ?>)
				</span>
			</summary>
			<label class="graphic-data-content-transfer__toggle-all">
				<input type="checkbox" class="graphic-data-content-transfer__toggle-all-input">
				Select everything in this group
			</label>
			<?php $this->render_tree_branch( $posts, $children ); ?>
		</details>
		<?php
	}

	/**
	 * Output a nested list of checkboxes for posts and their descendants.
	 *
	 * @param WP_Post[] $posts    Posts at this level.
	 * @param array     $children Child posts keyed by parent post ID.
	 * @return void
	 */
	private function render_tree_branch( $posts, $children ) {
		$type_labels = array(
			'scene'  => 'Scene',
			'modal'  => 'Modal',
			'figure' => 'Figure',
		);

		echo '<ul>';
		foreach ( $posts as $post ) {
			echo '<li>';
			printf(
				'<label><input type="checkbox" name="post_ids[]" value="%d"> <span class="graphic-data-content-transfer__type">%s</span> %s%s</label>',
				(int) $post->ID,
				esc_html( $type_labels[ $post->post_type ] ),
				esc_html( $this->get_display_title( $post ) ),
				'publish' === $post->post_status ? '' : ' <em>(' . esc_html( $post->post_status ) . ')</em>'
			);
			if ( ! empty( $children[ $post->ID ] ) ) {
				$this->render_tree_branch( $children[ $post->ID ], $children );
			}
			echo '</li>';
		}
		echo '</ul>';
	}

	/**
	 * Count posts and all their descendants.
	 *
	 * @param WP_Post[] $posts    Posts at this level.
	 * @param array     $children Child posts keyed by parent post ID.
	 * @return int
	 */
	private function count_tree_items( $posts, $children ) {
		$count = 0;
		foreach ( $posts as $post ) {
			++$count;
			if ( ! empty( $children[ $post->ID ] ) ) {
				$count += $this->count_tree_items( $children[ $post->ID ], $children );
			}
		}
		return $count;
	}

	/**
	 * Every exportable post of a type, sorted by title. Cached per request
	 * because the page lists Instances more than once.
	 *
	 * @param string $post_type Post type.
	 * @return WP_Post[]
	 */
	private function get_exportable_posts( $post_type ) {
		static $cache = array();
		if ( ! isset( $cache[ $post_type ] ) ) {
			$cache[ $post_type ] = get_posts(
				array(
					'post_type'      => $post_type,
					'post_status'    => Graphic_Data_Transfer_Schema::get_exportable_statuses(),
					'posts_per_page' => -1,
					'orderby'        => 'title',
					'order'          => 'ASC',
				)
			);
		}
		return $cache[ $post_type ];
	}

	/**
	 * Post title, or a placeholder for untitled posts.
	 *
	 * @param WP_Post $post Post.
	 * @return string
	 */
	private function get_display_title( $post ) {
		return '' === $post->post_title ? '(no title)' : $post->post_title;
	}

	// ---------------------------------------------------------------------
	// Request handling
	// ---------------------------------------------------------------------

	/**
	 * Handle AJAX: describe what an export would contain without creating it.
	 */
	public function ajax_preview() {
		check_ajax_referer( self::NONCE_ACTION );

		$selection = $this->get_selection_from_request();
		if ( is_wp_error( $selection ) ) {
			wp_send_json_error( array( 'message' => $selection->get_error_message() ) );
		}

		$exporter = new Graphic_Data_Transfer_Exporter( $selection );
		$result   = $exporter->build();
		if ( is_wp_error( $result ) ) {
			wp_send_json_error( array( 'message' => $result->get_error_message() ) );
		}

		wp_send_json_success( $exporter->get_summary() );
	}

	/**
	 * Handle admin-post.php: build the package and send it as a download.
	 */
	public function handle_export() {
		check_admin_referer( self::NONCE_ACTION );

		$selection = $this->get_selection_from_request();
		if ( is_wp_error( $selection ) ) {
			$this->die_with_error( $selection );
		}

		$exporter = new Graphic_Data_Transfer_Exporter( $selection );
		$zip_path = wp_tempnam( 'graphic-data-export' );
		$result   = $exporter->write_zip( $zip_path );
		if ( is_wp_error( $result ) ) {
			wp_delete_file( $zip_path );
			$this->die_with_error( $result );
		}

		// Discard anything already buffered so it cannot corrupt the zip.
		while ( ob_get_level() ) {
			ob_end_clean();
		}

		nocache_headers();
		header( 'Content-Type: application/zip' );
		header( 'Content-Disposition: attachment; filename="' . $exporter->get_file_name() . '"' );
		header( 'Content-Length: ' . filesize( $zip_path ) );

		readfile( $zip_path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_readfile -- Streaming a large binary download.
		wp_delete_file( $zip_path );
		exit;
	}

	/**
	 * Handle AJAX: receive one chunk of an import package. The first chunk
	 * starts a job; once the last arrives, the package is checked and the
	 * dry-run report is returned.
	 */
	public function ajax_import_upload() {
		$this->check_import_request();

		// phpcs:disable WordPress.Security.NonceVerification.Missing -- Verified by check_import_request().
		$offset = isset( $_POST['offset'] ) ? absint( wp_unslash( $_POST['offset'] ) ) : 0;
		$size   = isset( $_POST['size'] ) ? absint( wp_unslash( $_POST['size'] ) ) : 0;
		$token  = isset( $_POST['token'] ) ? sanitize_key( wp_unslash( $_POST['token'] ) ) : '';
		// phpcs:enable WordPress.Security.NonceVerification.Missing

		// phpcs:ignore WordPress.Security.NonceVerification.Missing, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Verified above; tmp_name is checked with is_uploaded_file().
		$chunk = isset( $_FILES['chunk']['tmp_name'] ) ? $_FILES['chunk']['tmp_name'] : '';
		if ( ! $size || ! $chunk || ! is_uploaded_file( $chunk ) ) {
			wp_send_json_error( array( 'message' => 'The upload did not arrive. The file may be larger than this server accepts in one request.' ) );
		}

		if ( 0 === $offset ) {
			$token = Graphic_Data_Transfer_Importer::create_job( $size, ! current_user_can( self::FULL_CAPABILITY ) );
			if ( is_wp_error( $token ) ) {
				wp_send_json_error( array( 'message' => $token->get_error_message() ) );
			}
		}
		$importer = $this->load_importer( $token );

		$result = $importer->append_chunk( $chunk, $offset );
		if ( is_wp_error( $result ) ) {
			$importer->cancel();
			wp_send_json_error( array( 'message' => $result->get_error_message() ) );
		}
		if ( ! $importer->is_uploaded() ) {
			wp_send_json_success( array( 'token' => $importer->get_token() ) );
		}

		$plan = $importer->check();
		if ( is_wp_error( $plan ) ) {
			$importer->cancel();
			$data = $plan->get_error_data();
			wp_send_json_error(
				array(
					'message' => $plan->get_error_message(),
					// Every problem found in a bulk import's spreadsheets.
					'errors'  => is_array( $data ) && isset( $data['errors'] ) ? array_values( (array) $data['errors'] ) : array(),
				)
			);
		}
		wp_send_json_success(
			array(
				'token' => $importer->get_token(),
				'plan'  => $plan,
			)
		);
	}

	/**
	 * Handle AJAX: run the next step of an import. The first request also
	 * carries the user's link and tab choices as JSON.
	 */
	public function ajax_import_run() {
		$this->check_import_request();
		// phpcs:disable WordPress.Security.NonceVerification.Missing -- Verified by check_import_request().
		$token   = isset( $_POST['token'] ) ? sanitize_key( wp_unslash( $_POST['token'] ) ) : '';
		$choices = null;
		if ( isset( $_POST['choices'] ) ) {
			// Decoded values are validated by the importer: keys are matched against its targets and IDs cast to integers.
			$choices = json_decode( wp_unslash( $_POST['choices'] ), true ); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		}
		// phpcs:enable WordPress.Security.NonceVerification.Missing
		$importer = $this->load_importer( $token );

		$result = $importer->run_step( is_array( $choices ) ? $choices : null );
		if ( is_wp_error( $result ) ) {
			wp_send_json_error( array( 'message' => $result->get_error_message() ) );
		}
		wp_send_json_success( $result );
	}

	/**
	 * Handle AJAX: abandon an import that has not started.
	 */
	public function ajax_import_cancel() {
		$this->check_import_request();
		$token    = isset( $_POST['token'] ) ? sanitize_key( wp_unslash( $_POST['token'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Verified by check_import_request().
		$importer = $this->load_importer( $token );
		$importer->cancel();
		wp_send_json_success();
	}

	/**
	 * Handle AJAX: undo an import.
	 */
	public function ajax_import_undo() {
		$this->check_import_request();
		$batch_id = isset( $_POST['batch'] ) ? sanitize_text_field( wp_unslash( $_POST['batch'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Verified by check_import_request().

		$batches = Graphic_Data_Transfer_Importer::get_batches();
		if ( isset( $batches[ $batch_id ] ) && ! $this->can_undo( $batches[ $batch_id ] ) ) {
			wp_send_json_error( array( 'message' => 'You can only undo your own single-Figure imports.' ), 403 );
		}

		$result = Graphic_Data_Transfer_Importer::undo( $batch_id, 'Undone by ' . wp_get_current_user()->display_name . '.' );
		if ( is_wp_error( $result ) ) {
			wp_send_json_error( array( 'message' => $result->get_error_message() ) );
		}
		wp_send_json_success( $result );
	}

	/**
	 * Handle AJAX: list the Figures whose standalone HTML should be built:
	 * the queue of imported Figures, or (administrators only) every Figure
	 * or those in one Instance.
	 */
	public function ajax_html_list() {
		$this->check_import_request();
		$scope = isset( $_POST['scope'] ) ? sanitize_key( wp_unslash( $_POST['scope'] ) ) : 'queue'; // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Verified by check_import_request().

		if ( 'queue' === $scope ) {
			$ids = Graphic_Data_Figure_Html_Rebuild::get_queue();
		} elseif ( ! current_user_can( self::FULL_CAPABILITY ) ) {
			wp_send_json_error( array( 'message' => 'Only administrators can rebuild the HTML of existing Figures.' ), 403 );
		} else {
			$ids = Graphic_Data_Figure_Html_Rebuild::get_buildable_figures( 'all' === $scope ? 0 : absint( $scope ) );
		}

		$figures = array();
		foreach ( $ids as $id ) {
			if ( current_user_can( 'edit_post', $id ) ) {
				$figures[] = array(
					'id'    => $id,
					'title' => get_the_title( $id ),
				);
			}
		}
		wp_send_json_success( $figures );
	}

	/**
	 * Handle AJAX: what the browser needs to build one Figure's HTML.
	 */
	public function ajax_html_figure() {
		$this->check_import_request();
		$figure_id = $this->get_rebuild_figure();
		wp_send_json_success( Graphic_Data_Figure_Html_Rebuild::get_build_data( $figure_id ) );
	}

	/**
	 * Handle AJAX: save one Figure's two HTML files.
	 */
	public function ajax_html_save() {
		$this->check_import_request();
		$figure_id = $this->get_rebuild_figure();

		// The HTML arrives as files: browsers turn line breaks in ordinary
		// form fields into CRLF, which the edit screen's files do not have.
		$html = array();
		foreach ( array( 'full_html', 'figure_only_html' ) as $field ) {
			// phpcs:ignore WordPress.Security.NonceVerification.Missing, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Verified by check_import_request(); tmp_name is checked with is_uploaded_file().
			$tmp = isset( $_FILES[ $field ]['tmp_name'] ) ? $_FILES[ $field ]['tmp_name'] : '';
			// Standalone figure HTML is a full document with scripts, as written by the Figure edit screen.
			$html[ $field ] = $tmp && is_uploaded_file( $tmp ) ? (string) file_get_contents( $tmp ) : ''; // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		}
		$full_html        = $html['full_html'];
		$figure_only_html = $html['figure_only_html'];

		$result = Graphic_Data_Figure_Html_Rebuild::save( $figure_id, $full_html, $figure_only_html );
		if ( is_wp_error( $result ) ) {
			wp_send_json_error( array( 'message' => $result->get_error_message() ) );
		}
		wp_send_json_success();
	}

	/**
	 * Handle AJAX: save a bulk-imported Interactive figure's saved figure,
	 * built in the browser from its settings.
	 */
	public function ajax_render_save() {
		$this->check_import_request();
		$figure_id = $this->get_rebuild_figure();

		// Sent as a file, like the HTML, so the browser keeps it as it is.
		// phpcs:ignore WordPress.Security.NonceVerification.Missing, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Verified by check_import_request(); tmp_name is checked with is_uploaded_file().
		$tmp = isset( $_FILES['rendered']['tmp_name'] ) ? $_FILES['rendered']['tmp_name'] : '';
		// Cleaned by save_render() as the edit screen cleans the field.
		$rendered = $tmp && is_uploaded_file( $tmp ) ? (string) file_get_contents( $tmp ) : ''; // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents

		$result = Graphic_Data_Figure_Html_Rebuild::save_render( $figure_id, $rendered );
		if ( is_wp_error( $result ) ) {
			wp_send_json_error( array( 'message' => $result->get_error_message() ) );
		}
		wp_send_json_success();
	}

	/**
	 * Handle admin-post.php: send the bulk import template.
	 */
	public function handle_tsv_template() {
		check_admin_referer( self::NONCE_ACTION );
		if ( ! current_user_can( self::FULL_CAPABILITY ) ) {
			wp_die( 'Only administrators can make bulk imports.', 403 );
		}

		$zip_path = wp_tempnam( 'graphic-data-bulk-import-template' );
		$result   = Graphic_Data_Transfer_Tsv::write_template( $zip_path );
		if ( is_wp_error( $result ) ) {
			wp_delete_file( $zip_path );
			$this->die_with_error( $result );
		}

		while ( ob_get_level() ) {
			ob_end_clean();
		}
		nocache_headers();
		header( 'Content-Type: application/zip' );
		header( 'Content-Disposition: attachment; filename="graphic-data-bulk-import-template.zip"' );
		header( 'Content-Length: ' . filesize( $zip_path ) );
		readfile( $zip_path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_readfile -- Streaming a binary download.
		wp_delete_file( $zip_path );
		exit;
	}

	/**
	 * The Figure named in a rebuild request, if the user may rebuild it:
	 * administrators any Figure they can edit, Editors only queued Figures.
	 *
	 * @return int Figure ID.
	 */
	private function get_rebuild_figure() {
		$figure_id = isset( $_POST['figure'] ) ? absint( wp_unslash( $_POST['figure'] ) ) : 0; // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Verified by check_import_request().
		if ( ! Graphic_Data_Figure_Html_Rebuild::is_buildable( $figure_id ) ) {
			wp_send_json_error( array( 'message' => 'This Figure does not have standalone HTML (it may have been deleted, or its Status is not Published).' ) );
		}
		$allowed = current_user_can( self::FULL_CAPABILITY ) || in_array( $figure_id, Graphic_Data_Figure_Html_Rebuild::get_queue(), true );
		if ( ! $allowed || ! current_user_can( 'edit_post', $figure_id ) ) {
			wp_send_json_error( array( 'message' => 'You do not have permission to rebuild this Figure.' ), 403 );
		}
		return $figure_id;
	}

	/**
	 * Stop an import request that lacks a valid nonce or the capability.
	 *
	 * Editors may make requests too: their jobs only accept single-Figure
	 * packages (see Graphic_Data_Transfer_Importer::create_job()), and they
	 * can only undo their own imports (see can_undo()).
	 *
	 * @return void
	 */
	private function check_import_request() {
		check_ajax_referer( self::NONCE_ACTION );
		if ( ! current_user_can( self::CAPABILITY ) ) {
			wp_send_json_error( array( 'message' => 'You do not have permission to import content.' ), 403 );
		}
		if ( function_exists( 'set_time_limit' ) ) {
			set_time_limit( 120 ); // phpcs:ignore Squiz.PHP.DiscouragedFunctions.Discouraged -- Media and content steps can be slow.
		}
	}

	/**
	 * Whether the current user may undo an import: administrators can undo
	 * any; Editors only their own single-Figure imports.
	 *
	 * @param array $batch Import record.
	 * @return bool
	 */
	private function can_undo( $batch ) {
		if ( current_user_can( self::FULL_CAPABILITY ) ) {
			return true;
		}
		return get_current_user_id() === (int) $batch['user_id'] && 'figure' === $batch['package_type'];
	}

	/**
	 * Load an import job or stop with an error.
	 *
	 * @param string $token Job token.
	 * @return Graphic_Data_Transfer_Importer
	 */
	private function load_importer( $token ) {
		$importer = Graphic_Data_Transfer_Importer::load( $token );
		if ( is_wp_error( $importer ) ) {
			wp_send_json_error( array( 'message' => $importer->get_error_message() ) );
		}
		return $importer;
	}

	/**
	 * Read and validate the export selection from the submitted form,
	 * enforcing what the current user is allowed to export.
	 *
	 * @return array|WP_Error Normalised selection.
	 */
	private function get_selection_from_request() {
		if ( ! current_user_can( self::CAPABILITY ) ) {
			return new WP_Error( 'graphic_data_transfer_forbidden', 'You do not have permission to export content.' );
		}
		$full = current_user_can( self::FULL_CAPABILITY );

		// phpcs:disable WordPress.Security.NonceVerification.Missing -- Verified by the callers.
		$scope = isset( $_POST['scope'] ) ? sanitize_key( wp_unslash( $_POST['scope'] ) ) : '';

		if ( 'instances' === $scope ) {
			if ( ! $full ) {
				return new WP_Error( 'graphic_data_transfer_forbidden', 'Only administrators can export whole Instances.' );
			}
			$instance_ids = isset( $_POST['instance_ids'] ) ? array_values( array_filter( array_map( 'absint', (array) wp_unslash( $_POST['instance_ids'] ) ) ) ) : array();
			if ( empty( $instance_ids ) ) {
				return new WP_Error( 'graphic_data_transfer_empty', 'Select at least one Instance to export.' );
			}
			return array(
				'scope'         => 'instances',
				'instance_ids'  => $instance_ids,
				'include_pages' => ! empty( $_POST['include_pages'] ),
				'include_about' => ! empty( $_POST['include_about'] ),
			);
		}

		if ( 'selected' === $scope ) {
			if ( ! $full ) {
				return new WP_Error( 'graphic_data_transfer_forbidden', 'Editors can only export one Figure at a time.' );
			}
			$post_ids = isset( $_POST['post_ids'] ) ? array_values( array_unique( array_filter( array_map( 'absint', (array) wp_unslash( $_POST['post_ids'] ) ) ) ) ) : array();
			if ( empty( $post_ids ) ) {
				return new WP_Error( 'graphic_data_transfer_empty', 'Select at least one Scene, Modal or Figure to export.' );
			}
			foreach ( $post_ids as $post_id ) {
				$error = $this->check_selectable_post( $post_id, self::SELECTABLE_TYPES );
				if ( $error ) {
					return $error;
				}
			}
			return array(
				'scope'    => 'selected',
				'post_ids' => $post_ids,
			);
		}

		// The Editor's single-figure form; also usable by administrators.
		if ( 'single' === $scope ) {
			$post_id = isset( $_POST['item_id_figure'] ) ? absint( wp_unslash( $_POST['item_id_figure'] ) ) : 0;
			$error   = $this->check_selectable_post( $post_id, array( 'figure' ) );
			if ( $error ) {
				return $error;
			}
			return array(
				'scope'    => 'selected',
				'post_ids' => array( $post_id ),
			);
		}
		// phpcs:enable WordPress.Security.NonceVerification.Missing

		return new WP_Error( 'graphic_data_transfer_invalid', 'Choose what to export.' );
	}

	/**
	 * Check that a submitted post ID is an allowed type that the current
	 * user may export.
	 *
	 * @param int      $post_id Post ID.
	 * @param string[] $types   Allowed post types.
	 * @return WP_Error|null Error, or null if the post is acceptable.
	 */
	private function check_selectable_post( $post_id, $types ) {
		if ( ! $post_id || ! in_array( get_post_type( $post_id ), $types, true ) ) {
			return new WP_Error( 'graphic_data_transfer_invalid', 'Choose the item to export.' );
		}
		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return new WP_Error( 'graphic_data_transfer_forbidden', sprintf( 'You do not have permission to export "%s".', get_the_title( $post_id ) ) );
		}
		return null;
	}

	/**
	 * Stop a non-AJAX request with an error message and a link back.
	 *
	 * @param WP_Error $error Error to show.
	 * @return void
	 */
	private function die_with_error( $error ) {
		wp_die(
			esc_html( $error->get_error_message() ),
			'Export failed',
			array(
				'response'  => 400,
				'back_link' => true,
			)
		);
	}
}
