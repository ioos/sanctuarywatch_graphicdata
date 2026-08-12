<?php
/**
 * Generates standalone figure preview HTML files for programmatically-created figures.
 *
 * This is a PHP port of the client-side generator in admin/js/admin-preview-buttons.js
 * (createFigureHtml, saveHtmlToServer) and the Plotly trace builders in
 * includes/figures/js/interactive/plotly-timeseries-line.js and plotly-bar.js. It exists
 * because create_tutorial_figures() creates "figure" posts with pure server-side PHP (no
 * browser present), so the normal browser-driven HTML-generation flow never runs for them.
 *
 * @package Graphic_Data_Plugin
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Graphic_Data_Tutorial_Figure_Preview
 */
class Graphic_Data_Tutorial_Figure_Preview {

	// =====================================================================
	// Public entry points.
	// =====================================================================

	/**
	 * Generates and saves the "full_figure" and "figure_only" standalone HTML files
	 * for a figure post, and updates the associated post meta.
	 *
	 * @param int        $post_id                  Figure post ID.
	 * @param array      $info_obj_full             Info object for the full_figure variant.
	 * @param array      $info_obj_figure_only      Info object for the figure_only variant.
	 * @param array|null $saved_figure              Interactive figure data (data/layout/config), or null.
	 * @return void
	 */
	public static function generate_and_save_figure_previews( $post_id, array $info_obj_full, array $info_obj_figure_only, $saved_figure = null ) {
		$root_url = home_url();

		$full_result = self::generate_figure_html( $post_id, $root_url, $info_obj_full, $saved_figure );
		if ( ! empty( $full_result['filename'] ) ) {
			self::save_figure_html_file( $post_id, $full_result['filename'], $full_result['html'] );
		}

		$figure_only_result = self::generate_figure_html( $post_id, $root_url, $info_obj_figure_only, $saved_figure );
		if ( ! empty( $figure_only_result['filename'] ) ) {
			self::save_figure_html_file( $post_id, $figure_only_result['filename'], $figure_only_result['html'] );
		}

		if ( ! empty( $full_result['path'] ) ) {
			update_post_meta( $post_id, 'figure_iframe_code', $full_result['path'] );
		}
	}

	/**
	 * PHP port of producePlotlyLineFigure() / producePlotlyBarFigure() + injectOverlays().
	 *
	 * Builds the pre-render Plotly {data, layout, config} for an Interactive figure from its
	 * raw figure_interactive_arguments and its data file. This is the PHP analog of what the
	 * browser stores into the figure_interactive_args_rendered hidden field.
	 *
	 * @param array  $interactive_arguments_pairs Raw [[key, value], ...] pairs, as stored in figure_interactive_arguments.
	 * @param string $json_data_path              Absolute filesystem path to the figure's data .json file.
	 * @return array{data: array, layout: array, config: array}
	 */
	public static function build_interactive_figure_data( array $interactive_arguments_pairs, $json_data_path ) {
		$args = self::flatten_interactive_arguments( $interactive_arguments_pairs );

		$data_to_be_plotted = array();
		if ( is_string( $json_data_path ) && file_exists( $json_data_path ) ) {
			// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
			$raw     = file_get_contents( $json_data_path );
			$decoded = json_decode( $raw, true );
			if ( is_array( $decoded ) && isset( $decoded['data'] ) && is_array( $decoded['data'] ) ) {
				$data_to_be_plotted = $decoded['data'];
			}
		}

		$graph_type = isset( $args['graphType'] ) ? $args['graphType'] : '';

		if ( 'Plotly bar graph' === $graph_type ) {
			list( $main_traces, $layout, $config ) = self::build_bar_chart_traces_and_layout( $args, $data_to_be_plotted );
			$x_axis_type_when_no_x                  = ( isset( $args['XAxis'] ) && 'None' === $args['XAxis'] ) ? 'category' : 'date';
		} else {
			list( $main_traces, $layout, $config ) = self::build_line_chart_traces_and_layout( $args, $data_to_be_plotted );
			$x_axis_type_when_no_x                  = 'date';
		}

		$overlay_traces = self::inject_overlays( $layout, $main_traces, $args, $data_to_be_plotted, $x_axis_type_when_no_x );

		return array(
			'data'   => array_merge( $overlay_traces, $main_traces ),
			'layout' => $layout,
			'config' => $config,
		);
	}

	// =====================================================================
	// createFigureHtml() port.
	// =====================================================================

	/**
	 * PHP port of createFigureHtml() (admin/js/admin-preview-buttons.js).
	 *
	 * @param int        $post_id      Figure post ID.
	 * @param string     $root_url     Site root URL.
	 * @param array      $info_obj     Info object (status, figureType, captions, links, etc).
	 * @param array|null $saved_figure Interactive figure data (data/layout/config), or null.
	 * @param string     $figure_type  Fallback figure type if info_obj has none. Default 'Interactive'.
	 * @return array{html: string, filename: ?string, path: ?string}
	 */
	private static function generate_figure_html( $post_id, $root_url, array $info_obj, $saved_figure = null, $figure_type = 'Interactive' ) {
		$normalized_figure_id = (string) $post_id;
		$normalized_root_url  = rtrim( trim( (string) $root_url ), '/' );

		$status = isset( $info_obj['status'] ) ? $info_obj['status'] : null;

		$filename = null;
		$path     = null;
		if ( 'full_figure' === $status ) {
			$filename = "figure-{$normalized_figure_id}";
			$path     = "{$normalized_root_url}/wp-content/data/figure_{$normalized_figure_id}/{$filename}.html";
		}
		if ( 'figure_only' === $status ) {
			$filename = "figure-{$normalized_figure_id}_figure_only";
			$path     = "{$normalized_root_url}/wp-content/data/figure_{$normalized_figure_id}/{$filename}.html";
		}

		$figure_content_element_id = "figure-content-{$normalized_figure_id}";

		$figure_title = self::get_info_value( $info_obj, array( 'figureTitle', 'figure_title', 'title' ), '' );

		$requested_figure_type = self::get_info_value( $info_obj, array( 'figureType', 'figure_type' ), $figure_type );

		$supported_figure_types = array(
			'interactive' => 'Interactive',
			'internal'    => 'Internal',
			'external'    => 'External',
			'code'        => 'Code',
		);
		$requested_lower         = strtolower( trim( (string) $requested_figure_type ) );
		$normalized_figure_type  = isset( $supported_figure_types[ $requested_lower ] )
			? $supported_figure_types[ $requested_lower ]
			: trim( (string) $requested_figure_type );

		$source_url  = self::get_info_value( $info_obj, array( 'scienceLink', 'scienceURL', 'sourceLink', 'sourceURL', 'figureScienceLink', 'figure_science_link_url' ), '' );
		$source_text = self::get_info_value( $info_obj, array( 'scienceText', 'sourceText', 'figureScienceLinkText', 'figure_science_link_text' ), 'Source' );
		$data_url    = self::get_info_value( $info_obj, array( 'dataLink', 'dataURL', 'figureDataLink', 'figure_data_link_url' ), '' );
		$data_text   = self::get_info_value( $info_obj, array( 'dataText', 'figureDataLinkText', 'figure_data_link_text' ), 'Data' );

		$short_caption = self::get_info_value( $info_obj, array( 'caption', 'shortCaption', 'captionShort', 'figureCaptionShort', 'figure_caption_short' ), '' );
		$long_caption  = self::get_info_value( $info_obj, array( 'extendedCaption', 'longCaption', 'captionLong', 'figureCaptionLong', 'figure_caption_long' ), '' );

		$image_url = self::get_info_value(
			$info_obj,
			array( 'imageLink', 'imageURL', 'imageUrl', 'image_link', 'figureImage', 'figure_image', 'externalURL', 'externalUrl', 'figureExternalURL', 'figure_external_url' ),
			''
		);
		$image_alt = self::get_info_value( $info_obj, array( 'externalAlt', 'external_alt', 'imageAlt', 'image_alt', 'figureExternalAlt', 'figure_external_alt' ), '' );

		$embed_code = self::get_info_value( $info_obj, array( 'code', 'embedCode', 'embed_code', 'figureCode', 'figure_code' ), '' );

		$desktop_css = self::get_info_value( $info_obj, array( 'desktopCSS', 'desktopCss', 'desktop_css' ), '' );
		$mobile_css  = self::get_info_value( $info_obj, array( 'mobileCSS', 'mobileCss', 'mobile_css' ), '' );

		switch ( $normalized_figure_type ) {
			case 'Internal':
				$figure_content_html = self::build_image_figure_html( 'Internal', $normalized_figure_id, $image_url, $image_alt, $normalized_root_url );
				break;
			case 'External':
				$figure_content_html = self::build_image_figure_html( 'External', $normalized_figure_id, $image_url, $image_alt, $normalized_root_url );
				break;
			case 'Code':
				$figure_content_html = self::build_code_figure_html( $normalized_figure_id, $embed_code );
				break;
			case 'Interactive':
				$figure_content_html = self::build_interactive_figure_html( $figure_content_element_id, $figure_title, $saved_figure );
				break;
			default:
				$figure_content_html = '<div class="figure-error" role="alert">Unsupported figure type: ' . self::escape_html( $normalized_figure_type ) . '</div>';
				break;
		}

		$source_link_html = self::build_information_link( $source_url, $source_text, "\u{1F4CB}", 'source-link' );
		$data_link_html    = self::build_information_link( $data_url, $data_text, "\u{1F4C1}", 'data-link' );

		$information_bar_html = '';
		if ( $source_link_html || $data_link_html ) {
			$information_bar_html = <<<HTML
				<div class="figure-information-bar">
					<div class="figure-information-left">
						{$source_link_html}
					</div>

					<div class="figure-information-right">
						{$data_link_html}
					</div>
				</div>
				HTML;
		}

		$short_caption_html = '';
		if ( $short_caption ) {
			$short_caption_html = <<<HTML
				<div class="caption figure-caption-short">
					{$short_caption}
				</div>
				HTML;
		}

		$long_caption_html = '';
		if ( $long_caption ) {
			$long_caption_html = <<<HTML
				<div class="caption figure-caption-long">
					{$long_caption}
				</div>
				HTML;
		}

		$long_caption_container_html = '';
		if ( $long_caption_html ) {
			$long_caption_container_html = <<<HTML
				<details class="figure-long-caption-container">
					<summary class="figure-long-caption-toggle">
						Details
					</summary>

					<div class="figure-long-caption-content">
						{$long_caption_html}
					</div>
				</details>
				HTML;
		}

		$figure_type_class = preg_replace( '/[^a-z0-9_-]/', '-', strtolower( (string) $normalized_figure_type ) );

		// Precompute every escaped/serialized value used by the static template below.
		$title_esc             = self::escape_html( $figure_title );
		$desktop_css_raw       = (string) $desktop_css;
		$mobile_css_raw        = (string) $mobile_css;
		$figure_id_json        = self::serialize_for_script( $normalized_figure_id );
		$figure_id_esc         = self::escape_html( $normalized_figure_id );
		$figure_type_esc       = self::escape_html( $normalized_figure_type );
		$figure_type_class_esc = self::escape_html( $figure_type_class );
		$aria_label_esc        = self::escape_html( "{$normalized_figure_type} figure" );
		$root_url_safe         = self::safe_url( $normalized_root_url );
		$root_url_esc          = self::escape_html( $normalized_root_url );

		$fig_iframe_html = <<<HTML
			<!doctype html>

			<html lang="en">
				<head>
					<meta charset="utf-8">

					<meta
						name="viewport"
						content="width=device-width, initial-scale=1"
					>

					<title>{$title_esc}</title>

					<style>
						* {
							box-sizing: border-box;
						}

						html,
						body {
							width: 100%;
							min-height: 100%;
							margin: 0;
							padding: 0;
						}

						body {
							overflow-x: hidden;
							background: #ffffff;
							color: #222222;
							font-family:
								Arial,
								Helvetica,
								sans-serif;
						}

						a {
							color: inherit;
						}

						img,
						svg,
						canvas,
						video,
						iframe {
							max-width: 100%;
						}

						.figure-embed-document {
							width: 100%;
							max-width: none;
							margin: 0 auto;
							padding: 12px;
						}

						.figure-information-bar {
							display: flex;
							justify-content: space-between;
							align-items: center;
							gap: 16px;
							width: 100%;
							margin: 0 auto;
							padding: 10px;
							border: 1px solid lightgrey;
							border-radius: 6px;
							background: rgba(227, 227, 227, 0.33);
							font-size: 1.2rem;
						}

						.figure-information-left,
						.figure-information-right {
							display: flex;
							align-items: center;
							min-width: 0;
						}

						.figure-information-right {
							margin-left: auto;
							text-align: right;
						}

						.figure-information-link {
							display: inline-flex;
							align-items: center;
							gap: 6px;
							text-decoration: none;
						}

						.figure-information-link:hover,
						.figure-information-link:focus {
							text-decoration: underline;
						}

						.figureTitle {
							margin-top: 15px;
							margin-bottom: 2px;
							text-align: center;
							font-size: 1rem;
							font-weight: 500;
						}

						.figure-type {
							position: absolute;
							width: 1px;
							height: 1px;
							padding: 0;
							margin: -1px;
							overflow: hidden;
							clip: rect(0, 0, 0, 0);
							white-space: nowrap;
							border: 0;
						}

						.figure-content-wrapper {
							position: relative;
							display: block;
							width: 100%;
							margin-top: 2%;
						}

						.figure-content-interactive {
							min-height: 400px;
						}

						.figure-image-container {
							display: flex;
							justify-content: center;
							align-items: center;
							width: 100%;
						}

						.figure-image {
							display: block;
							width: auto;
							max-width: 100%;
							height: auto;
							margin: 0 auto;
						}

						.plotly-figure {
							position: relative;
							display: block;
							width: 100%;
							height: 450px;
							min-height: 400px;
							margin: 0;
						}

						.plotly-figure .plot-container,
						.plotly-figure .svg-container,
						.plotly-figure .main-svg {
							width: 100% !important;
							max-width: none !important;
						}

						.modebar-container {
							top: -20px !important;
						}

						.code-display-window {
							display: flex;
							justify-content: center;
							align-items: center;
							width: 100%;
							min-height: 300px;
							padding: 10px;
							overflow: auto;
							background: #ffffff;
						}

						.code-display-window > * {
							max-width: 100%;
						}

						.figure-error {
							margin: 1rem;
							padding: 1rem;
							border: 1px solid #b32d2e;
							border-radius: 4px;
							color: #b32d2e;
							text-align: center;
						}

						.figure-short-caption-container {
							width: 100%;
							margin-top: 10px;
							margin-bottom: 10px;
						}

						.figure-short-caption-container:empty {
							display: none;
						}

						.caption {
							width: 100%;
							line-height: 1.5;
						}

						.figure-caption-short {
							margin-top: 0;
						}

						.figure-caption-long {
							margin-top: 0;
						}

						.figure-long-caption-container {
							width: 100%;
							margin-top: 12px;
						}

						.figure-long-caption-toggle {
							padding: 10px 12px;
							color: rgba(0, 0, 0, 0.8);
							font-size: 1rem;
							font-weight: 500;
							cursor: pointer;
							user-select: none;
						}

						.figure-long-caption-toggle:hover,
						.figure-long-caption-toggle:focus {
							color: rgba(68, 68, 68, 1);
							background: rgba(227, 227, 227, 0.3);
						}

						.figure-long-caption-content {
							padding: 0 12px 12px;
							line-height: 1.5;
						}

						.figure-long-caption-content > :first-child {
							margin-top: 0;
						}

						.figure-long-caption-content > :last-child {
							margin-bottom: 0;
						}

						.figure-footer {
							width: 100%;
							margin-top: 24px;
							padding-top: 12px;
						}

						.figure-footer-links {
							display: flex;
							justify-content: flex-end;
							align-items: center;
							flex-wrap: wrap;
							gap: 16px;
						}

						.figure-footer-link {
							color: rgba(68, 68, 68, 0.55);
							font-size: 0.8rem;
							text-decoration: none;
						}

						.figure-footer-link:hover,
						.figure-footer-link:focus {
							color: rgba(68, 68, 68, 0.9);
							text-decoration: underline;
						}

						{$desktop_css_raw}

						@media screen and (max-width: 767px) {
							.figure-embed-document {
								padding: 8px;
							}

							.figure-information-bar {
								align-items: flex-start;
								flex-direction: column;
								gap: 8px;
								font-size: 1rem;
							}

							.figure-information-right {
								margin-left: 0;
								text-align: left;
							}

							.plotly-figure {
								height: 400px;
							}

							.code-display-window {
								min-height: 250px;
								padding: 6px;
							}

							.figure-footer-links {
								justify-content: center;
							}

							{$mobile_css_raw}
						}
					</style>
				</head>

				<body>
					<script>
						(function () {
							"use strict";

							const figureID =
								{$figure_id_json};

							function sendHeight() {
								const documentHeight = Math.max(
									document.body.scrollHeight,
									document.body.offsetHeight,
									document.documentElement.clientHeight,
									document.documentElement.scrollHeight,
									document.documentElement.offsetHeight
								);

								window.parent.postMessage(
									{
										type: "figure-embed-resize",
										figureID: figureID,
										height: documentHeight
									},
									"*"
								);
							}

							window.graphicDataFigureEmbed = {
								sendHeight: sendHeight
							};

							if (
								typeof ResizeObserver !== "undefined"
							) {
								const documentResizeObserver =
									new ResizeObserver(
										function () {
											sendHeight();
										}
									);

								documentResizeObserver.observe(
									document.body
								);
							}

							window.addEventListener(
								"load",
								function () {
									sendHeight();

									requestAnimationFrame(
										sendHeight
									);
								}
							);

							window.addEventListener(
								"resize",
								sendHeight
							);

							sendHeight();
						})();
					</script>

					<main
						class="figure-embed-document"
						data-figure-id="{$figure_id_esc}"
						data-figure-type="{$figure_type_esc}"
					>
						{$information_bar_html}

						<header>
							<div class="figureTitle">
								{$title_esc}
							</div>

							<span class="figure-type">
								{$figure_type_esc}
							</span>
						</header>

						<section
							class="figure-content-wrapper figure-content-{$figure_type_class_esc}"
							aria-label="{$aria_label_esc}"
						>
							{$figure_content_html}
						</section>

						<div class="figure-short-caption-container">
							{$short_caption_html}
						</div>

						{$long_caption_container_html}

						<footer class="figure-footer">
							<nav
								class="figure-footer-links"
								aria-label="Figure resources"
							>
								<a
									href="{$root_url_safe}"
									target="_blank"
									rel="noopener noreferrer"
									class="figure-footer-link"
								>
									{$root_url_esc}
								</a>

								<a
									href="https://ioos.github.io/sanctuarywatch_graphicdata/"
									target="_blank"
									rel="noopener noreferrer"
									class="figure-footer-link"
								>
									Graphic Data
								</a>
							</nav>
						</footer>
					</main>
				</body>
			</html>
			HTML;

		return array(
			'html'     => $fig_iframe_html,
			'filename' => $filename,
			'path'     => $path,
		);
	}

	/**
	 * PHP port of buildImageFigureHTML() (Internal/External figure types).
	 *
	 * @param string $image_type            'Internal' or 'External'.
	 * @param string $normalized_figure_id  Figure ID as a string.
	 * @param string $image_url             Image URL.
	 * @param string $image_alt             Image alt text.
	 * @param string $normalized_root_url   Site root URL.
	 * @return string
	 */
	private static function build_image_figure_html( $image_type, $normalized_figure_id, $image_url, $image_alt, $normalized_root_url ) {
		$image_element_id = "img_{$normalized_figure_id}";
		$error_element_id = "{$image_element_id}-error";

		if ( empty( $image_url ) ) {
			return '<div class="figure-error" role="alert">No image URL was supplied for this ' . self::escape_html( $image_type ) . ' figure.</div>';
		}

		$should_retrieve_alt_text = ( 'Internal' === $image_type ) && empty( $image_alt );

		$alt_text_script = '';
		if ( $should_retrieve_alt_text ) {
			$site_root_json = self::serialize_for_script( $normalized_root_url );

			$alt_text_script = <<<JS
						const siteRoot =
							{$site_root_json};

						const altTextEndpoint =
							siteRoot +
							"/wp-json/graphic_data/v1/" +
							"media/alt-text-by-url?image_url=" +
							encodeURIComponent(image.src);

						fetch(
							altTextEndpoint,
							{
								credentials: "same-origin"
							}
						)
							.then(function (response) {
								if (!response.ok) {
									throw new Error(
										"Alt-text request failed " +
										"with status " +
										response.status
									);
								}

								return response.json();
							})
							.then(function (data) {
								if (
									data &&
									data.alt_text
								) {
									image.alt =
										data.alt_text;
								}
							})
							.catch(function (error) {
								console.error(
									"Unable to retrieve image alt text:",
									error
								);
							});
				JS;
		}

		$image_element_id_esc  = self::escape_html( $image_element_id );
		$error_element_id_esc  = self::escape_html( $error_element_id );
		$image_src              = self::safe_image_url( $image_url );
		$image_alt_esc          = self::escape_html( $image_alt );
		$image_element_id_json = self::serialize_for_script( $image_element_id );
		$error_element_id_json = self::serialize_for_script( $error_element_id );

		return <<<HTML
				<div class="figure-image-container">
					<img
						id="{$image_element_id_esc}"
						class="figure-image"
						src="{$image_src}"
						alt="{$image_alt_esc}"
						loading="lazy"
						decoding="async"
					>

					<p
						id="{$error_element_id_esc}"
						class="figure-error"
						role="alert"
						hidden
					>
						The figure image could not be loaded.
					</p>
				</div>

				<script>
					(function () {
						"use strict";

						const imageElementID =
							{$image_element_id_json};

						const errorElementID =
							{$error_element_id_json};

						const image =
							document.getElementById(
								imageElementID
							);

						const errorElement =
							document.getElementById(
								errorElementID
							);

						const sendDocumentHeight =
							window.graphicDataFigureEmbed &&
							window.graphicDataFigureEmbed.sendHeight;

						if (!image) {
							console.error(
								"Figure image element was not found:",
								imageElementID
							);

							if (sendDocumentHeight) {
								sendDocumentHeight();
							}

							return;
						}

						function handleImageLoaded() {
							image.hidden = false;

							if (errorElement) {
								errorElement.hidden = true;
							}

							if (sendDocumentHeight) {
								sendDocumentHeight();

								requestAnimationFrame(
									sendDocumentHeight
								);
							}
						}

						function handleImageError() {
							console.error(
								"Unable to load figure image:",
								image.src
							);

							image.hidden = true;

							if (errorElement) {
								errorElement.hidden = false;
							}

							if (sendDocumentHeight) {
								sendDocumentHeight();
							}
						}

						image.addEventListener(
							"load",
							handleImageLoaded
						);

						image.addEventListener(
							"error",
							handleImageError
						);

						{$alt_text_script}

						if (image.complete) {
							if (image.naturalWidth > 0) {
								handleImageLoaded();
							} else {
								handleImageError();
							}
						}
					})();
				</script>
				HTML;
	}

	/**
	 * PHP port of buildInteractiveFigureHTML().
	 *
	 * @param string     $figure_content_element_id Target element ID for the Plotly chart.
	 * @param string     $figure_title              Figure title (used for aria-label).
	 * @param array|null $saved_figure              {data, layout, config} array, or null.
	 * @return string
	 */
	private static function build_interactive_figure_html( $figure_content_element_id, $figure_title, $saved_figure ) {
		$data   = ( is_array( $saved_figure ) && isset( $saved_figure['data'] ) && is_array( $saved_figure['data'] ) ) ? $saved_figure['data'] : array();
		$layout = ( is_array( $saved_figure ) && isset( $saved_figure['layout'] ) && is_array( $saved_figure['layout'] ) ) ? $saved_figure['layout'] : array();
		$config = ( is_array( $saved_figure ) && isset( $saved_figure['config'] ) && is_array( $saved_figure['config'] ) ) ? $saved_figure['config'] : array();

		unset( $layout['width'], $layout['height'] );
		$layout['autosize']   = true;
		$config['responsive'] = true;

		$clean_figure = array(
			'data'   => $data,
			'layout' => $layout,
			'config' => $config,
		);

		$figure_json                    = self::serialize_for_script( $clean_figure );
		$target_id_json                 = self::serialize_for_script( $figure_content_element_id );
		$figure_content_element_id_esc = self::escape_html( $figure_content_element_id );
		$figure_title_esc               = self::escape_html( $figure_title );

		return <<<HTML
				<div
					id="{$figure_content_element_id_esc}"
					class="plotly-figure"
					role="img"
					aria-label="{$figure_title_esc}"
				></div>

				<script>
					(function () {
						"use strict";

						const chartID = {$target_id_json};

						const chart =
							document.getElementById(chartID);

						const fig = {$figure_json};

						const sendDocumentHeight =
							window.graphicDataFigureEmbed &&
							window.graphicDataFigureEmbed.sendHeight;

						if (!chart) {
							console.error(
								"Plotly figure target was not found:",
								chartID
							);

							if (sendDocumentHeight) {
								sendDocumentHeight();
							}

							return;
						}

						function resizePlot() {
							if (
								typeof Plotly === "undefined" ||
								!chart.classList.contains(
									"js-plotly-plot"
								)
							) {
								return;
							}

							Plotly.Plots.resize(chart);

							if (sendDocumentHeight) {
								sendDocumentHeight();
							}
						}

						function renderPlot() {
							Plotly.react(
								chart,
								fig.data || [],
								fig.layout || {},
								fig.config || {}
							)
								.then(function () {
									resizePlot();

									requestAnimationFrame(
										resizePlot
									);
								})
								.catch(function (error) {
									console.error(
										"Unable to render Plotly figure:",
										error
									);

									chart.innerHTML =
										'<p class="figure-error">' +
										'The interactive figure ' +
										'could not be loaded.' +
										'</p>';

									if (sendDocumentHeight) {
										sendDocumentHeight();
									}
								});
						}

						function loadPlotly() {
							if (
								typeof Plotly !== "undefined"
							) {
								renderPlot();
								return;
							}

							const existingScript =
								document.querySelector(
									'script[data-plotly-library="true"]'
								);

							if (existingScript) {
								existingScript.addEventListener(
									"load",
									renderPlot,
									{ once: true }
								);

								return;
							}

							const plotlyScript =
								document.createElement(
									"script"
								);

							plotlyScript.src =
								"https://cdn.plot.ly/" +
								"plotly-2.35.2.min.js";

							plotlyScript.async = true;

							plotlyScript.dataset.plotlyLibrary =
								"true";

							plotlyScript.addEventListener(
								"load",
								renderPlot,
								{ once: true }
							);

							plotlyScript.addEventListener(
								"error",
								function () {
									chart.innerHTML =
										'<p class="figure-error">' +
										'The Plotly library ' +
										'could not be loaded.' +
										'</p>';

									if (sendDocumentHeight) {
										sendDocumentHeight();
									}
								},
								{ once: true }
							);

							document.head.appendChild(
								plotlyScript
							);
						}

						let resizeTimer = null;

						window.addEventListener(
							"resize",
							function () {
								window.clearTimeout(
									resizeTimer
								);

								resizeTimer =
									window.setTimeout(
										resizePlot,
										100
									);
							}
						);

						loadPlotly();

						if (sendDocumentHeight) {
							sendDocumentHeight();
						}
					})();
				</script>
				HTML;
	}

	/**
	 * PHP port of buildCodeFigureHTML().
	 *
	 * @param string $normalized_figure_id Figure ID as a string.
	 * @param string $embed_code           Raw embed HTML/CSS/JS.
	 * @return string
	 */
	private static function build_code_figure_html( $normalized_figure_id, $embed_code ) {
		$code_element_id       = "code-display-window-{$normalized_figure_id}";
		$code_json              = self::serialize_for_script( (string) $embed_code );
		$code_element_id_esc   = self::escape_html( $code_element_id );
		$code_element_id_json  = self::serialize_for_script( $code_element_id );

		return <<<HTML
				<div
					id="{$code_element_id_esc}"
					class="code-display-window"
				></div>

				<script>
					(async function () {
						"use strict";

						const codeElementID =
							{$code_element_id_json};

						const codeDisplay =
							document.getElementById(
								codeElementID
							);

						const suppliedCode = {$code_json};

						const sendDocumentHeight =
							window.graphicDataFigureEmbed &&
							window.graphicDataFigureEmbed.sendHeight;

						if (!codeDisplay) {
							console.error(
								"Code figure target was not found:",
								codeElementID
							);

							if (sendDocumentHeight) {
								sendDocumentHeight();
							}

							return;
						}

						if (!suppliedCode.trim()) {
							codeDisplay.innerHTML =
								'<p class="figure-error">' +
								'No embed code was supplied ' +
								'for this figure.' +
								'</p>';

							if (sendDocumentHeight) {
								sendDocumentHeight();
							}

							return;
						}

						async function appendExecutableNode(
							parent,
							sourceNode
						) {
							if (
								sourceNode.nodeType ===
									Node.ELEMENT_NODE &&
								sourceNode.tagName === "SCRIPT"
							) {
								const executableScript =
									document.createElement(
										"script"
									);

								Array.from(
									sourceNode.attributes
								).forEach(function (attribute) {
									if (
										attribute.name === "src" ||
										attribute.name === "async"
									) {
										return;
									}

									executableScript.setAttribute(
										attribute.name,
										attribute.value
									);
								});

								const scriptSource =
									sourceNode.getAttribute("src");

								if (scriptSource) {
									await new Promise(
										function (resolve) {
											executableScript.async =
												false;

											executableScript.addEventListener(
												"load",
												resolve,
												{ once: true }
											);

											executableScript.addEventListener(
												"error",
												function () {
													console.error(
														"Unable to load " +
														"code-figure script:",
														scriptSource
													);

													resolve();
												},
												{ once: true }
											);

											executableScript.src =
												scriptSource;

											parent.appendChild(
												executableScript
											);
										}
									);

									return;
								}

								executableScript.textContent =
									sourceNode.textContent;

								parent.appendChild(
									executableScript
								);

								return;
							}

							if (
								sourceNode.nodeType ===
								Node.ELEMENT_NODE
							) {
								const clonedElement =
									sourceNode.cloneNode(false);

								parent.appendChild(
									clonedElement
								);

								const childNodes =
									Array.from(
										sourceNode.childNodes
									);

								for (
									const childNode of childNodes
								) {
									await appendExecutableNode(
										clonedElement,
										childNode
									);
								}

								return;
							}

							parent.appendChild(
								sourceNode.cloneNode(true)
							);
						}

						try {
							const template =
								document.createElement(
									"template"
								);

							template.innerHTML = suppliedCode;

							codeDisplay.replaceChildren();

							const sourceNodes =
								Array.from(
									template.content.childNodes
								);

							for (
								const sourceNode of sourceNodes
							) {
								await appendExecutableNode(
									codeDisplay,
									sourceNode
								);
							}

							if (sendDocumentHeight) {
								sendDocumentHeight();

								requestAnimationFrame(
									sendDocumentHeight
								);
							}
						} catch (error) {
							console.error(
								"Unable to render code figure:",
								error
							);

							codeDisplay.innerHTML =
								'<p class="figure-error">' +
								'The code figure could not ' +
								'be rendered.' +
								'</p>';

							if (sendDocumentHeight) {
								sendDocumentHeight();
							}
						}
					})();
				</script>
				HTML;
	}

	/**
	 * Writes a generated figure HTML string to disk and updates upload-related post meta.
	 *
	 * Mirrors custom_file_upload_handler() (includes/admin-figure.php), but writes directly
	 * instead of going through $_FILES/AJAX since this runs entirely server-side.
	 *
	 * @param int    $post_id      Figure post ID.
	 * @param string $filename     Filename without extension (e.g. "figure-42").
	 * @param string $html_content HTML document content.
	 * @return string Absolute path the file was written to.
	 */
	private static function save_figure_html_file( $post_id, $filename, $html_content ) {
		$upload_dir = ABSPATH . 'wp-content/data/figure_' . $post_id . '/';

		if ( ! file_exists( $upload_dir ) ) {
			wp_mkdir_p( $upload_dir );
		}

		$destination = $upload_dir . $filename . '.html';

		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		file_put_contents( $destination, $html_content );

		update_post_meta( $post_id, 'uploaded_path_html', $destination );
		update_post_meta( $post_id, 'uploaded_html_file', $filename . '.html' );

		return $destination;
	}

	// =====================================================================
	// Small helpers ported 1:1 from the JS helpers in createFigureHtml().
	// =====================================================================

	/**
	 * PHP port of escapeHtml().
	 *
	 * @param mixed $value Value to escape.
	 * @return string
	 */
	private static function escape_html( $value ) {
		return htmlspecialchars( (string) ( $value ?? '' ), ENT_QUOTES, 'UTF-8' );
	}

	/**
	 * PHP port of safeUrl().
	 *
	 * @param mixed  $value    URL value.
	 * @param string $fallback Fallback URL.
	 * @return string
	 */
	private static function safe_url( $value, $fallback = '#' ) {
		$url = trim( (string) ( $value ?? '' ) );

		if ( '' === $url ) {
			return self::escape_html( $fallback );
		}

		$allowed = (bool) preg_match( '~^(https?:|mailto:|tel:|/|#|\./|\.\./)~i', $url );

		return self::escape_html( $allowed ? $url : $fallback );
	}

	/**
	 * PHP port of safeImageUrl().
	 *
	 * @param mixed  $value    Image URL value.
	 * @param string $fallback Fallback image URL.
	 * @return string
	 */
	private static function safe_image_url( $value, $fallback = '' ) {
		$url = trim( (string) ( $value ?? '' ) );

		if ( '' === $url ) {
			return self::escape_html( $fallback );
		}

		$allowed = (bool) preg_match( '~^(https?:|//|blob:|data:image/|/|\./|\.\./)~i', $url );

		return self::escape_html( $allowed ? $url : $fallback );
	}

	/**
	 * PHP port of serializeForScript().
	 *
	 * @param mixed $value Value to serialize.
	 * @return string
	 */
	private static function serialize_for_script( $value ) {
		$json = wp_json_encode( $value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE );

		return preg_replace( '~</script~i', '<\\/script', $json );
	}

	/**
	 * PHP port of buildInformationLink().
	 *
	 * @param string $url        Link URL.
	 * @param string $text       Link text.
	 * @param string $icon       Display icon.
	 * @param string $class_name Additional CSS class.
	 * @return string
	 */
	private static function build_information_link( $url, $text, $icon, $class_name ) {
		if ( empty( $url ) ) {
			return '';
		}

		$url_attr  = self::safe_url( $url );
		$class_esc = self::escape_html( $class_name );
		$icon_esc  = self::escape_html( $icon );
		$text_esc  = self::escape_html( $text );

		return <<<HTML
				<a
					href="{$url_attr}"
					target="_blank"
					rel="noopener noreferrer"
					class="figure-information-link {$class_esc}"
				>
					<span aria-hidden="true">{$icon_esc}</span>
					<span>{$text_esc}</span>
				</a>
				HTML;
	}

	/**
	 * PHP port of getInfoValue(). Returns the first populated property found in $info_obj.
	 *
	 * @param array  $info_obj Info object.
	 * @param array  $keys     Property names to check, in priority order.
	 * @param mixed  $fallback Default value.
	 * @return mixed
	 */
	private static function get_info_value( array $info_obj, array $keys, $fallback = '' ) {
		foreach ( $keys as $key ) {
			if ( array_key_exists( $key, $info_obj ) && null !== $info_obj[ $key ] && '' !== $info_obj[ $key ] ) {
				return $info_obj[ $key ];
			}
		}

		return $fallback;
	}

	// =====================================================================
	// Plotly trace/layout builders, ported from plotly-timeseries-line.js /
	// plotly-bar.js. Optional feature branches (StdDev, Percentiles, Mean,
	// ErrorBars, overlays) replicate the source's quirks (e.g. inconsistent
	// NA-filtering / denominator handling) rather than "fixing" them.
	// =====================================================================

	/**
	 * Flattens figure_interactive_arguments' [[key, value], ...] pairs into an assoc array,
	 * matching JS's Object.fromEntries(JSON.parse(interactive_arguments)).
	 *
	 * @param array $pairs Array of [key, value] pairs.
	 * @return array
	 */
	private static function flatten_interactive_arguments( array $pairs ) {
		$args = array();

		foreach ( $pairs as $pair ) {
			if ( is_array( $pair ) && array_key_exists( 0, $pair ) ) {
				$args[ $pair[0] ] = array_key_exists( 1, $pair ) ? $pair[1] : '';
			}
		}

		return $args;
	}

	/**
	 * Default Plotly config object, identical for line and bar charts.
	 *
	 * @return array
	 */
	private static function default_plotly_config() {
		return array(
			'responsive'             => true,
			'renderer'               => 'svg',
			'displayModeBar'         => true,
			'displaylogo'            => false,
			'modeBarButtonsToRemove' => array(
				'zoom2d',
				'lasso2d',
				'autoScale2d',
				'hoverClosestCartesian',
				'hoverCompareCartesian',
			),
		);
	}

	/**
	 * PHP port of producePlotlyLineFigure()'s trace/layout construction.
	 *
	 * @param array $args               Flattened figure_interactive_arguments.
	 * @param array $data_to_be_plotted Column-oriented data (column name => array of values).
	 * @return array{0: array, 1: array, 2: array} [main traces, layout, config]
	 */
	private static function build_line_chart_traces_and_layout( array $args, array $data_to_be_plotted ) {
		$number_of_lines = isset( $args['NumberOfLines'] ) ? (int) $args['NumberOfLines'] : 0;

		$show_grid_bool = ( isset( $args['showGrid'] ) && 'on' === $args['showGrid'] );

		$graph_ticks = isset( $args['graphTicks'] ) ? $args['graphTicks'] : null;
		if ( 'on' === $graph_ticks ) {
			$graph_tick_mode_bool     = '';
			$graph_tick_position_bool = '';
		} else {
			$graph_tick_mode_bool     = 'auto';
			$graph_tick_position_bool = 'outside';
		}

		$all_lines_plotly = array();

		for ( $i = 1; $i <= $number_of_lines; $i++ ) {
			$target_line_column = 'Line' . $i;
			$column_x_header     = isset( $args['XAxis'] ) ? $args['XAxis'] : null;
			$column_y_header     = isset( $args[ $target_line_column ] ) ? $args[ $target_line_column ] : null;

			$plotly_x = isset( $data_to_be_plotted[ $column_x_header ] ) && is_array( $data_to_be_plotted[ $column_x_header ] ) ? $data_to_be_plotted[ $column_x_header ] : array();
			$plotly_y = isset( $data_to_be_plotted[ $column_y_header ] ) && is_array( $data_to_be_plotted[ $column_y_header ] ) ? $data_to_be_plotted[ $column_y_header ] : array();

			$std_dev = self::compute_standard_deviation( $plotly_y );

			$date_format = isset( $args['XAxisFormat'] ) ? $args['XAxisFormat'] : null;
			switch ( $date_format ) {
				case 'YYYY':
					$x_hover_format = '%Y';
					break;
				case 'YYYY-MM':
					$x_hover_format = '%Y-%m';
					break;
				case 'YYYY-MM-DD':
					$x_hover_format = '%Y-%m-%d';
					break;
				default:
					$x_hover_format = '';
			}
			$x_hover_value = $x_hover_format ? "%{x|{$x_hover_format}}" : '%{x}';

			// JS has a shadowing no-op bug here (an inner `const lineType='solid'` that never
			// escapes its `if` block); replicate by leaving $line_type null when unset rather
			// than defaulting to 'solid' (Plotly itself defaults to a solid line client-side).
			$line_type = isset( $args[ $target_line_column . 'LineType' ] ) ? $args[ $target_line_column . 'LineType' ] : null;

			$marker_type = isset( $args[ $target_line_column . 'MarkerType' ] ) ? $args[ $target_line_column . 'MarkerType' ] : null;
			$marker_size = self::js_parse_int( isset( $args[ $target_line_column . 'MarkerSize' ] ) ? $args[ $target_line_column . 'MarkerSize' ] : null );

			$remove_line        = isset( $args[ $target_line_column . 'RemoveLine' ] ) ? $args[ $target_line_column . 'RemoveLine' ] : null;
			$graph_mode_setting = ( 'on' === $remove_line ) ? 'markers' : 'lines+markers';

			$show_legend      = isset( $args[ $target_line_column . 'Legend' ] ) ? $args[ $target_line_column . 'Legend' ] : null;
			$show_legend_bool = ( 'on' === $show_legend );

			$connect_gaps_opt = ( isset( $args[ $target_line_column . 'ConnectGaps' ] ) && 'on' === $args[ $target_line_column . 'ConnectGaps' ] );

			$show_error                  = isset( $args[ $target_line_column . 'ErrorBars' ] ) ? $args[ $target_line_column . 'ErrorBars' ] : null;
			$show_error_input_values_opt = isset( $args[ $target_line_column . 'ErrorBarsInputValues' ] ) ? $args[ $target_line_column . 'ErrorBarsInputValues' ] : null;

			$error_bar_y = array();
			if ( 'on' === $show_error ) {
				if ( 'auto' === $show_error_input_values_opt ) {
					$error_bar_y = array(
						'type'      => 'data',
						'array'     => array_fill( 0, count( $plotly_y ), $std_dev ),
						'visible'   => true,
						'color'     => isset( $args[ $target_line_column . 'ErrorBarsColor' ] ) ? $args[ $target_line_column . 'ErrorBarsColor' ] : null,
						'thickness' => 1.5,
						'width'     => 8,
					);
				} else {
					$raw_values  = isset( $data_to_be_plotted[ $show_error_input_values_opt ] ) ? $data_to_be_plotted[ $show_error_input_values_opt ] : array();
					$filtered    = self::filter_out_empty_string( $raw_values );
					$error_bar_y = array(
						'type'      => 'data',
						'array'     => array_map( array( __CLASS__, 'js_parse_float' ), $filtered ),
						'visible'   => true,
						'color'     => isset( $args[ $target_line_column . 'ErrorBarsColor' ] ) ? $args[ $target_line_column . 'ErrorBarsColor' ] : null,
						'thickness' => 1.5,
						'width'     => 8,
					);
				}
			}

			$all_lines_plotly[] = array(
				'x'             => array_values( $plotly_x ),
				'y'             => array_values( $plotly_y ),
				'mode'          => $graph_mode_setting,
				'type'          => 'scatter',
				'name'          => isset( $args[ $target_line_column . 'Title' ] ) ? $args[ $target_line_column . 'Title' ] : '',
				'showlegend'    => $show_legend_bool,
				'line'          => array( 'dash' => $line_type ),
				'marker'        => array(
					'color'  => isset( $args[ $target_line_column . 'Color' ] ) ? $args[ $target_line_column . 'Color' ] : null,
					'symbol' => $marker_type,
					'size'   => $marker_size,
				),
				'error_y'       => $error_bar_y,
				'connectgaps'   => $connect_gaps_opt,
				'hovertemplate' => ( isset( $args['XAxisTitle'] ) ? $args['XAxisTitle'] : '' ) . ": {$x_hover_value}<br>" . ( isset( $args['YAxisTitle'] ) ? $args['YAxisTitle'] : '' ) . ': %{y}<extra></extra>',
			);

			// Standard deviation band (auto).
			$show_sd                  = isset( $args[ $target_line_column . 'StdDev' ] ) ? $args[ $target_line_column . 'StdDev' ] : null;
			$show_sd_input_values_opt = isset( $args[ $target_line_column . 'StdDevInputValues' ] ) ? $args[ $target_line_column . 'StdDevInputValues' ] : null;
			$sd_color                 = isset( $args[ $target_line_column . 'StdDevColor' ] ) ? $args[ $target_line_column . 'StdDevColor' ] : null;
			$sd_title                 = isset( $args[ $target_line_column . 'Title' ] ) ? $args[ $target_line_column . 'Title' ] : '';

			if ( 'on' === $show_sd && 'auto' === $show_sd_input_values_opt ) {
				$mean               = self::mean_treating_na_as_zero( $plotly_y );
				$mean_value         = null !== $mean ? $mean : 0;
				$upper_y            = array_fill( 0, count( $plotly_y ), $mean_value + $std_dev );
				$lower_y            = array_fill( 0, count( $plotly_y ), $mean_value - $std_dev );
				$filtered_x         = self::filter_out_empty_string( $plotly_x );
				$legend_group_name  = "{$sd_title} \u{00B1}1 SD";

				$all_lines_plotly[] = array(
					'x'          => $filtered_x,
					'y'          => $upper_y,
					'type'       => 'scatter',
					'mode'       => 'lines',
					'name'       => $legend_group_name,
					'legendgroup' => $legend_group_name,
					'line'       => array( 'dash' => 'dash', 'color' => $sd_color ),
					'hoverinfo'  => 'skip',
					'showlegend' => $show_legend_bool,
					'visible'    => true,
				);
				$all_lines_plotly[] = array(
					'x'          => $filtered_x,
					'y'          => $lower_y,
					'type'       => 'scatter',
					'mode'       => 'lines',
					'name'       => $legend_group_name,
					'legendgroup' => $legend_group_name,
					'line'       => array( 'dash' => 'dash', 'color' => $sd_color ),
					'hoverinfo'  => 'skip',
					'showlegend' => false,
					'visible'    => true,
				);
			}

			// Standard deviation band (spreadsheet column). Numerator excludes the literal
			// string "NA"; denominator uses the ORIGINAL unfiltered column length — this
			// mismatch exists in the source and is replicated here on purpose.
			if ( 'on' === $show_sd && 'auto' !== $show_sd_input_values_opt ) {
				$raw_sd_source      = isset( $data_to_be_plotted[ $show_sd_input_values_opt ] ) ? $data_to_be_plotted[ $show_sd_input_values_opt ] : array();
				$filtered_sd_source = array_values(
					array_filter(
						$raw_sd_source,
						function ( $v ) {
							return 'NA' !== $v;
						}
					)
				);
				$sd_sum             = array_sum(
					array_map(
						function ( $v ) {
							return is_numeric( $v ) ? (float) $v : 0;
						},
						$filtered_sd_source
					)
				);
				$std_single_value   = count( $raw_sd_source ) > 0 ? $sd_sum / count( $raw_sd_source ) : 0;

				$mean               = self::mean_treating_na_as_zero( $plotly_y );
				$mean_value         = null !== $mean ? $mean : 0;
				$upper_y            = array_fill( 0, count( $plotly_y ), $mean_value + $std_single_value );
				$lower_y            = array_fill( 0, count( $plotly_y ), $mean_value - $std_single_value );
				$filtered_x         = self::filter_out_empty_string( $plotly_x );
				$legend_group_name  = "{$sd_title} \u{00B1}1 SD";

				$all_lines_plotly[] = array(
					'x'          => $filtered_x,
					'y'          => $upper_y,
					'type'       => 'scatter',
					'mode'       => 'lines',
					'name'       => $legend_group_name,
					'legendgroup' => $legend_group_name,
					'line'       => array( 'dash' => 'dash', 'color' => $sd_color ),
					'hoverinfo'  => 'skip',
					'showlegend' => $show_legend_bool,
					'visible'    => true,
				);
				$all_lines_plotly[] = array(
					'x'          => $filtered_x,
					'y'          => $lower_y,
					'type'       => 'scatter',
					'mode'       => 'lines',
					'name'       => $legend_group_name,
					'legendgroup' => $legend_group_name,
					'line'       => array( 'dash' => 'dash', 'color' => $sd_color ),
					'hoverinfo'  => 'skip',
					'showlegend' => false,
					'visible'    => true,
				);
			}

			// Percentiles and mean.
			$show_percentiles     = isset( $args[ $target_line_column . 'Percentiles' ] ) ? $args[ $target_line_column . 'Percentiles' ] : null;
			$show_mean            = isset( $args[ $target_line_column . 'Mean' ] ) ? $args[ $target_line_column . 'Mean' ] : null;
			$show_mean_values_opt = isset( $args[ $target_line_column . 'MeanField' ] ) ? $args[ $target_line_column . 'MeanField' ] : null;

			if ( 'on' === $show_percentiles || 'on' === $show_mean ) {
				$p10               = self::compute_percentile( $plotly_y, 10 );
				$p90                = self::compute_percentile( $plotly_y, 90 );
				$filtered_x         = self::filter_out_empty_string( $plotly_x );
				$x_min_percentile   = ! empty( $filtered_x ) ? min( $filtered_x ) : null;
				$x_max_percentile   = ! empty( $filtered_x ) ? max( $filtered_x ) : null;

				$color = isset( $args[ $target_line_column . 'Color' ] ) ? $args[ $target_line_column . 'Color' ] : '';
				$title = isset( $args[ $target_line_column . 'Title' ] ) ? $args[ $target_line_column . 'Title' ] : '';

				if ( 'on' === $show_percentiles ) {
					$all_lines_plotly[] = array(
						'x'          => array( $x_min_percentile, $x_max_percentile ),
						'y'          => array( $p10, $p10 ),
						'mode'       => 'lines',
						'line'       => array( 'dash' => 'dot', 'color' => $color . '60' ),
						'name'       => "{$title} 10th Percentile (Bottom)",
						'type'       => 'scatter',
						'visible'    => true,
						'showlegend' => false,
					);
					$all_lines_plotly[] = array(
						'x'          => array( $x_min_percentile, $x_max_percentile ),
						'y'          => array( $p90, $p90 ),
						'mode'       => 'lines',
						'line'       => array( 'dash' => 'dot', 'color' => $color . '60' ),
						'name'       => "{$title} 10th & 90th Percentile",
						'type'       => 'scatter',
						'visible'    => true,
						'showlegend' => $show_legend_bool,
					);
				}

				if ( 'auto' === $show_mean_values_opt && 'on' === $show_mean ) {
					$mean               = self::mean_treating_na_as_zero( $plotly_y );
					$filtered_x2        = self::filter_out_empty_string( $plotly_x );
					$x_min              = ! empty( $filtered_x2 ) ? min( $filtered_x2 ) : null;
					$x_max              = ! empty( $filtered_x2 ) ? max( $filtered_x2 ) : null;
					$all_lines_plotly[] = array(
						'x'          => array( $x_min, $x_max ),
						'y'          => array( $mean, $mean ),
						'mode'       => 'lines',
						'line'       => array( 'dash' => 'solid', 'color' => $color . '60' ),
						'name'       => "{$title} Mean",
						'type'       => 'scatter',
						'visible'    => true,
						'showlegend' => $show_legend_bool,
					);
				}

				if ( 'auto' !== $show_mean_values_opt && 'on' === $show_mean ) {
					$existing_mean_values = self::filter_out_empty_string( isset( $data_to_be_plotted[ $show_mean_values_opt ] ) ? $data_to_be_plotted[ $show_mean_values_opt ] : array() );
					$numeric_existing     = array_map(
						function ( $v ) {
							return is_numeric( $v ) ? (float) $v : 0;
						},
						$existing_mean_values
					);
					$mean                 = ! empty( $numeric_existing ) ? array_sum( $numeric_existing ) / count( $numeric_existing ) : null;
					$filtered_x2          = self::filter_out_empty_string( $plotly_x );
					$x_min                = ! empty( $filtered_x2 ) ? min( $filtered_x2 ) : null;
					$x_max                = ! empty( $filtered_x2 ) ? max( $filtered_x2 ) : null;
					$all_lines_plotly[]   = array(
						'x'          => array( $x_min, $x_max ),
						'y'          => array( $mean, $mean ),
						'mode'       => 'lines',
						'line'       => array( 'dash' => 'solid', 'color' => $color . '60' ),
						'name'       => "{$title} Mean",
						'type'       => 'scatter',
						'visible'    => true,
						'showlegend' => $show_legend_bool,
					);
				}
			}
		}

		$layout = array(
			'xaxis'      => array(
				'title'     => array( 'text' => isset( $args['XAxisTitle'] ) ? $args['XAxisTitle'] : null ),
				'linecolor' => 'black',
				'linewidth' => 1,
				'range'     => array(
					isset( $args['XAxisLowBound'] ) ? $args['XAxisLowBound'] : null,
					isset( $args['XAxisHighBound'] ) ? $args['XAxisHighBound'] : null,
				),
				'tickmode'  => $graph_tick_mode_bool,
				'ticks'     => $graph_tick_position_bool,
				'showgrid'  => $show_grid_bool,
			),
			'yaxis'      => array(
				'title'     => array( 'text' => isset( $args['YAxisTitle'] ) ? $args['YAxisTitle'] : null ),
				'linecolor' => 'black',
				'linewidth' => 1,
				'range'     => array(
					isset( $args['YAxisLowBound'] ) ? $args['YAxisLowBound'] : null,
					isset( $args['YAxisHighBound'] ) ? $args['YAxisHighBound'] : null,
				),
				'tickmode'  => $graph_tick_mode_bool,
				'ticks'     => $graph_tick_position_bool,
				'showgrid'  => $show_grid_bool,
			),
			'legend'     => array(
				'orientation' => 'h',
				'y'           => 1.1,
				'x'           => 0.5,
				'xanchor'     => 'center',
				'yanchor'     => 'bottom',
			),
			'autosize'   => true,
			'margin'     => array(
				't' => 60,
				'b' => 60,
				'l' => 60,
				'r' => 60,
			),
			'hovermode'  => 'closest',
			'cliponaxis' => true,
		);

		$config = self::default_plotly_config();

		return array( $all_lines_plotly, $layout, $config );
	}

	/**
	 * PHP port of producePlotlyBarFigure()'s trace/layout construction.
	 *
	 * @param array $args               Flattened figure_interactive_arguments.
	 * @param array $data_to_be_plotted Column-oriented data (column name => array of values).
	 * @return array{0: array, 1: array, 2: array} [main traces, layout, config]
	 */
	private static function build_bar_chart_traces_and_layout( array $args, array $data_to_be_plotted ) {
		$number_of_bars   = isset( $args['NumberOfBars'] ) ? (int) $args['NumberOfBars'] : 0;
		$bar_stacked_by_x = ( isset( $args['StackedBarColumns'] ) && 'on' === $args['StackedBarColumns'] );

		$show_grid_bool = ( isset( $args['showGrid'] ) && 'on' === $args['showGrid'] );

		$graph_ticks = isset( $args['graphTicks'] ) ? $args['graphTicks'] : null;
		if ( 'on' === $graph_ticks ) {
			$graph_tick_mode_bool     = '';
			$graph_tick_position_bool = '';
		} else {
			$graph_tick_mode_bool     = 'auto';
			$graph_tick_position_bool = 'outside';
		}

		$all_bars_plotly = array();

		for ( $i = 1; $i <= $number_of_bars; $i++ ) {
			$target_bar_column = 'Bar' . $i;
			$column_x_header    = isset( $args['XAxis'] ) ? $args['XAxis'] : null;
			$column_y_header    = isset( $args[ $target_bar_column ] ) ? $args[ $target_bar_column ] : null;

			$is_stacked              = isset( $args[ $target_bar_column . 'Stacked' ] ) ? $args[ $target_bar_column . 'Stacked' ] : null;
			$stacked_separator_color = isset( $args[ $target_bar_column . 'StackedSeparatorLineColor' ] ) ? $args[ $target_bar_column . 'StackedSeparatorLineColor' ] : null;
			$show_legend_bool        = ( isset( $args[ $target_bar_column . 'Legend' ] ) && 'on' === $args[ $target_bar_column . 'Legend' ] );
			$fill_type               = isset( $args[ $target_bar_column . 'FillType' ] ) ? $args[ $target_bar_column . 'FillType' ] : null;

			$date_format = isset( $args['XAxisFormat'] ) ? $args['XAxisFormat'] : null;
			switch ( $date_format ) {
				case 'YYYY':
					$x_hover_format = '%Y';
					break;
				case 'YYYY-MM':
					$x_hover_format = '%Y-%m';
					break;
				case 'YYYY-MM-DD':
					$x_hover_format = '%Y-%m-%d';
					break;
				default:
					$x_hover_format = '';
			}
			$x_hover_value = $x_hover_format ? "%{x|{$x_hover_format}}" : '%{x}';

			$plotly_x = null;
			$plotly_y = null;

			if ( 'on' === $is_stacked && 'None' !== $column_x_header ) {
				$categories = isset( $data_to_be_plotted[ $column_x_header ] ) ? $data_to_be_plotted[ $column_x_header ] : array();
				$values     = array_map( array( __CLASS__, 'js_parse_float' ), isset( $data_to_be_plotted[ $column_y_header ] ) ? $data_to_be_plotted[ $column_y_header ] : array() );

				$group_map = array();
				foreach ( array_values( $categories ) as $idx => $cat ) {
					if ( ! array_key_exists( $cat, $group_map ) ) {
						$group_map[ $cat ] = 0;
					}
					$val                = isset( $values[ $idx ] ) ? $values[ $idx ] : null;
					$group_map[ $cat ] += ( null !== $val ) ? $val : 0;
				}

				$x_value = ( isset( $args[ $target_bar_column . 'Title' ] ) && '' !== $args[ $target_bar_column . 'Title' ] ) ? $args[ $target_bar_column . 'Title' ] : "Bar {$i}";

				$j = 0;
				foreach ( $group_map as $stack_category => $val ) {
					$all_bars_plotly[] = array(
						'x'          => array( $x_value ),
						'y'          => array( $val ),
						'type'       => 'bar',
						'name'       => "{$stack_category} {$x_value}",
						'showlegend' => $show_legend_bool,
						'marker'     => array(
							'color'   => self::lighten_color( isset( $args[ $target_bar_column . 'Color' ] ) ? $args[ $target_bar_column . 'Color' ] : '#000000', $j * 0.05 ),
							'line'    => array(
								'width' => 1,
								'color' => $stacked_separator_color,
							),
							'pattern' => array(
								'shape'    => $fill_type,
								'size'     => 4,
								'solidity' => 0.5,
							),
						),
						'hovertemplate' => ( ( isset( $args['XAxisTitle'] ) && '' !== $args['XAxisTitle'] ) ? $args['XAxisTitle'] : $column_x_header ) . ": {$x_hover_value}<br>" . ( isset( $args['YAxisTitle'] ) ? $args['YAxisTitle'] : '' ) . ': %{y}<extra></extra>',
					);
					++$j;
				}
			} elseif ( 'None' === $column_x_header ) {
				$title    = ( isset( $args[ $target_bar_column . 'Title' ] ) && '' !== $args[ $target_bar_column . 'Title' ] ) ? $args[ $target_bar_column . 'Title' ] : "Bar {$i}";
				$plotly_x = array( $title );

				$raw_y = isset( $data_to_be_plotted[ $column_y_header ] ) ? $data_to_be_plotted[ $column_y_header ] : array();
				$sum_y = 0;
				foreach ( $raw_y as $v ) {
					$parsed = self::js_parse_float( $v );
					if ( null !== $parsed ) {
						$sum_y += $parsed;
					}
				}
				$plotly_y = array( $sum_y );
			} else {
				// Both the "stacked across columns by X axis" and "separate columns
				// side-by-side" branches build plotlyX/plotlyY identically in the source.
				$categories = isset( $data_to_be_plotted[ $column_x_header ] ) ? $data_to_be_plotted[ $column_x_header ] : array();
				$values     = array_map( array( __CLASS__, 'js_parse_float' ), isset( $data_to_be_plotted[ $column_y_header ] ) ? $data_to_be_plotted[ $column_y_header ] : array() );

				$group_map = array();
				foreach ( array_values( $categories ) as $idx => $cat ) {
					if ( ! array_key_exists( $cat, $group_map ) ) {
						$group_map[ $cat ] = 0;
					}
					$val                = isset( $values[ $idx ] ) ? $values[ $idx ] : null;
					$group_map[ $cat ] += ( null !== $val ) ? $val : 0;
				}

				$plotly_x = array_keys( $group_map );
				$plotly_y = array_values( $group_map );
			}

			// Percentiles and mean.
			$show_percentiles     = isset( $args[ $target_bar_column . 'Percentiles' ] ) ? $args[ $target_bar_column . 'Percentiles' ] : null;
			$show_mean            = isset( $args[ $target_bar_column . 'Mean' ] ) ? $args[ $target_bar_column . 'Mean' ] : null;
			$show_mean_values_opt = isset( $args[ $target_bar_column . 'MeanField' ] ) ? $args[ $target_bar_column . 'MeanField' ] : null;

			if ( ( 'on' === $show_percentiles || 'on' === $show_mean ) && is_array( $plotly_y ) && is_array( $plotly_x ) ) {
				$p10             = self::compute_percentile( $plotly_y, 10 );
				$p90             = self::compute_percentile( $plotly_y, 90 );
				$filtered_x      = self::filter_out_empty_string( $plotly_x );
				$x_min_percentile = ! empty( $filtered_x ) ? min( $filtered_x ) : null;
				$x_max_percentile = ! empty( $filtered_x ) ? max( $filtered_x ) : null;

				$color = isset( $args[ $target_bar_column . 'Color' ] ) ? $args[ $target_bar_column . 'Color' ] : '';
				$title = isset( $args[ $target_bar_column . 'Title' ] ) ? $args[ $target_bar_column . 'Title' ] : '';

				if ( 'on' === $show_percentiles ) {
					$all_bars_plotly[] = array(
						'x'          => array( $x_min_percentile, $x_max_percentile ),
						'y'          => array( $p10, $p10 ),
						'mode'       => 'lines',
						'line'       => array( 'dash' => 'dot', 'color' => $color . '60' ),
						'name'       => "{$title} 10th Percentile (Bottom)",
						'type'       => 'scatter',
						'visible'    => true,
						'showlegend' => false,
					);
					$all_bars_plotly[] = array(
						'x'          => array( $x_min_percentile, $x_max_percentile ),
						'y'          => array( $p90, $p90 ),
						'mode'       => 'lines',
						'line'       => array( 'dash' => 'dot', 'color' => $color . '60' ),
						'name'       => "{$title} 10th & 90th Percentile",
						'type'       => 'scatter',
						'visible'    => true,
						'showlegend' => $show_legend_bool,
					);
				}

				if ( 'auto' === $show_mean_values_opt && 'on' === $show_mean ) {
					$mean              = self::mean_treating_na_as_zero( $plotly_y );
					$filtered_x2       = self::filter_out_empty_string( $plotly_x );
					$x_min             = ! empty( $filtered_x2 ) ? min( $filtered_x2 ) : null;
					$x_max             = ! empty( $filtered_x2 ) ? max( $filtered_x2 ) : null;
					$all_bars_plotly[] = array(
						'x'          => array( $x_min, $x_max ),
						'y'          => array( $mean, $mean ),
						'mode'       => 'lines',
						'line'       => array( 'dash' => 'solid', 'color' => $color . '60' ),
						'name'       => "{$title} Mean",
						'type'       => 'scatter',
						'visible'    => true,
						'showlegend' => $show_legend_bool,
					);
				}

				if ( 'auto' !== $show_mean_values_opt && 'on' === $show_mean ) {
					$existing_mean_values = self::filter_out_empty_string( isset( $data_to_be_plotted[ $show_mean_values_opt ] ) ? $data_to_be_plotted[ $show_mean_values_opt ] : array() );
					$numeric_existing     = array_map(
						function ( $v ) {
							return is_numeric( $v ) ? (float) $v : 0;
						},
						$existing_mean_values
					);
					$mean                 = ! empty( $numeric_existing ) ? array_sum( $numeric_existing ) / count( $numeric_existing ) : null;
					$filtered_x2          = self::filter_out_empty_string( $plotly_x );
					$x_min                = ! empty( $filtered_x2 ) ? min( $filtered_x2 ) : null;
					$x_max                = ! empty( $filtered_x2 ) ? max( $filtered_x2 ) : null;
					$all_bars_plotly[]    = array(
						'x'          => array( $x_min, $x_max ),
						'y'          => array( $mean, $mean ),
						'mode'       => 'lines',
						'line'       => array( 'dash' => 'solid', 'color' => $color . '60' ),
						'name'       => "{$title} Mean",
						'type'       => 'scatter',
						'visible'    => true,
						'showlegend' => $show_legend_bool,
					);
				}
			}

			// Error bars.
			$show_error       = isset( $args[ $target_bar_column . 'ErrorBars' ] ) ? $args[ $target_bar_column . 'ErrorBars' ] : null;
			$error_array_raw  = null;
			if ( 'on' === $show_error ) {
				$error_input_opt = isset( $args[ $target_bar_column . 'ErrorBarsInputValues' ] ) ? $args[ $target_bar_column . 'ErrorBarsInputValues' ] : null;
				if ( 'auto' === $error_input_opt ) {
					$error_array_raw = array_fill( 0, is_array( $plotly_y ) ? count( $plotly_y ) : 0, self::compute_standard_deviation( is_array( $plotly_y ) ? $plotly_y : array() ) );
				} else {
					$raw             = isset( $data_to_be_plotted[ $error_input_opt ] ) ? $data_to_be_plotted[ $error_input_opt ] : array();
					$error_array_raw = array();
					foreach ( $raw as $v ) {
						$parsed = self::js_parse_float( $v );
						if ( null !== $parsed ) {
							$error_array_raw[] = $parsed;
						}
					}
				}
			}

			$error_y = null;
			if ( null !== $error_array_raw ) {
				$error_y = array(
					'type'      => 'data',
					'array'     => $error_array_raw,
					'visible'   => true,
					'color'     => ( isset( $args[ $target_bar_column . 'ErrorBarsColor' ] ) && '' !== $args[ $target_bar_column . 'ErrorBarsColor' ] ) ? $args[ $target_bar_column . 'ErrorBarsColor' ] : '#000',
					'thickness' => 1,
					'width'     => 5,
				);
			}

			if ( ! ( 'on' === $is_stacked && 'None' !== $column_x_header ) ) {
				$trace = array(
					'x'             => is_array( $plotly_x ) ? array_values( $plotly_x ) : $plotly_x,
					'y'             => is_array( $plotly_y ) ? array_values( $plotly_y ) : $plotly_y,
					'type'          => 'bar',
					'name'          => isset( $args[ $target_bar_column . 'Title' ] ) ? $args[ $target_bar_column . 'Title' ] : '',
					'showlegend'    => $show_legend_bool,
					'marker'        => array(
						'color'   => isset( $args[ $target_bar_column . 'Color' ] ) ? $args[ $target_bar_column . 'Color' ] : null,
						'pattern' => array(
							'shape'    => $fill_type,
							'size'     => 4,
							'solidity' => 0.5,
						),
					),
					'hovertemplate' => ( ( isset( $args['XAxisTitle'] ) && '' !== $args['XAxisTitle'] ) ? $args['XAxisTitle'] : $column_x_header ) . ": {$x_hover_value}<br>" . ( isset( $args['YAxisTitle'] ) ? $args['YAxisTitle'] : '' ) . ': %{y}<extra></extra>',
				);
				if ( null !== $error_y ) {
					$trace['error_y'] = $error_y;
				}
				$all_bars_plotly[] = $trace;
			}
		}

		$y_low       = isset( $args['YAxisLowBound'] ) ? $args['YAxisLowBound'] : '';
		$y_high      = isset( $args['YAxisHighBound'] ) ? $args['YAxisHighBound'] : '';
		$y_autorange = ( '' === $y_low && '' === $y_high );
		$y_range     = ( '' !== $y_low && '' !== $y_high ) ? array( self::js_parse_float( $y_low ), self::js_parse_float( $y_high ) ) : null;

		$layout = array(
			'barmode'    => $bar_stacked_by_x ? 'stack' : 'group',
			'xaxis'      => array(
				'title'      => array( 'text' => isset( $args['XAxisTitle'] ) ? $args['XAxisTitle'] : '' ),
				'linecolor'  => 'black',
				'linewidth'  => 1,
				'tickangle'  => -45,
				'automargin' => true,
				'range'      => array(
					isset( $args['XAxisLowBound'] ) ? $args['XAxisLowBound'] : null,
					isset( $args['XAxisHighBound'] ) ? $args['XAxisHighBound'] : null,
				),
				'tickmode'   => $graph_tick_mode_bool,
				'ticks'      => $graph_tick_position_bool,
			),
			'yaxis'      => array(
				'title'     => array( 'text' => isset( $args['YAxisTitle'] ) ? $args['YAxisTitle'] : '' ),
				'linecolor' => 'black',
				'linewidth' => 1,
				'rangemode' => 'tozero',
				'autorange' => $y_autorange,
				'range'     => $y_range,
				'tickmode'  => $graph_tick_mode_bool,
				'ticks'     => $graph_tick_position_bool,
				'showgrid'  => $show_grid_bool,
			),
			'legend'     => array(
				'orientation' => 'h',
				'y'           => 1.1,
				'x'           => 0.5,
				'xanchor'     => 'center',
				'yanchor'     => 'bottom',
			),
			'autosize'   => true,
			'margin'     => array(
				't' => 60,
				'b' => 60,
				'l' => 60,
				'r' => 60,
			),
			'cliponaxis' => true,
		);

		$config = self::default_plotly_config();

		return array( $all_bars_plotly, $layout, $config );
	}

	/**
	 * PHP port of injectOverlays(). Mutates $layout by reference (axis types, shapes) and
	 * returns the overlay traces array (evaluation-period shading, event-marker lines).
	 *
	 * Unlike the source, which relies on Plotly's live post-render autorange resolution to
	 * populate layout.yaxis.range before this runs, this PHP port has no live render pass.
	 * When no explicit y-axis range is available, it falls back to the min/max of the main
	 * traces' y-values as an approximation — a documented, minor divergence from Plotly's
	 * real (undocumented) autorange padding, acceptable for demo/tutorial content.
	 *
	 * @param array  $layout                  Layout array (by reference).
	 * @param array  $main_traces             Main data traces (for the autorange fallback).
	 * @param array  $args                    Flattened figure_interactive_arguments.
	 * @param array  $data_to_be_plotted      Column-oriented data.
	 * @param string $x_axis_type_when_no_x   'category' or 'date' — what layout.xaxis.type
	 *                                        should be when XAxis === 'None' (bar charts only;
	 *                                        line charts always use 'date').
	 * @return array Overlay traces.
	 */
	private static function inject_overlays( array &$layout, array $main_traces, array $args, array $data_to_be_plotted, $x_axis_type_when_no_x = 'date' ) {
		if ( empty( $layout['yaxis']['range'] ) ) {
			$all_y = array();
			foreach ( $main_traces as $trace ) {
				if ( isset( $trace['y'] ) && is_array( $trace['y'] ) ) {
					foreach ( $trace['y'] as $v ) {
						if ( is_numeric( $v ) ) {
							$all_y[] = (float) $v;
						}
					}
				}
			}

			if ( empty( $all_y ) ) {
				// Matches the source: overlays are skipped entirely when no y-axis range
				// can be resolved.
				return array();
			}

			$layout['yaxis']         = isset( $layout['yaxis'] ) && is_array( $layout['yaxis'] ) ? $layout['yaxis'] : array();
			$layout['yaxis']['range'] = array( min( $all_y ), max( $all_y ) );
		}

		$column_x_header = isset( $args['XAxis'] ) ? $args['XAxis'] : null;
		$plotly_x         = isset( $data_to_be_plotted[ $column_x_header ] ) ? $data_to_be_plotted[ $column_x_header ] : array();

		$layout['xaxis']         = isset( $layout['xaxis'] ) && is_array( $layout['xaxis'] ) ? $layout['xaxis'] : array();
		$layout['xaxis']['type'] = ( 'None' === $column_x_header ) ? $x_axis_type_when_no_x : 'date';

		$layout['yaxis']         = isset( $layout['yaxis'] ) && is_array( $layout['yaxis'] ) ? $layout['yaxis'] : array();
		$layout['yaxis']['type'] = 'linear';

		$y_min = isset( $layout['yaxis']['range'][0] ) ? $layout['yaxis']['range'][0] : 0;
		$y_max = isset( $layout['yaxis']['range'][1] ) ? $layout['yaxis']['range'][1] : 1;

		$date_format = isset( $args['XAxisFormat'] ) ? $args['XAxisFormat'] : null;
		switch ( $date_format ) {
			case 'YYYY':
				$x_hover_format = '%Y';
				break;
			case 'YYYY-MM':
				$x_hover_format = '%Y-%m';
				break;
			case 'YYYY-MM-DD':
				$x_hover_format = '%Y-%m-%d';
				break;
			default:
				$x_hover_format = '';
		}
		$x_hover_value = $x_hover_format ? "%{x|{$x_hover_format}}" : '%{x}';

		$overlays = array();

		if ( isset( $args['EvaluationPeriod'] ) && 'on' === $args['EvaluationPeriod'] ) {
			$start             = isset( $args['EvaluationPeriodStartDate'] ) ? $args['EvaluationPeriodStartDate'] : null;
			$end                = isset( $args['EvaluationPeriodEndDate'] ) ? $args['EvaluationPeriodEndDate'] : null;
			$fill_color         = ( isset( $args['EvaluationPeriodFillColor'] ) && '' !== $args['EvaluationPeriodFillColor'] ? $args['EvaluationPeriodFillColor'] : '#999' ) . '15';
			$eval_display_text  = isset( $args['EvaluationPeriodText'] ) ? $args['EvaluationPeriodText'] : null;

			$overlays[] = array(
				'x'          => array( $start, $end, $end, $start ),
				'y'          => array( $y_max, $y_max, $y_min, $y_min ),
				'fill'       => 'toself',
				'fillcolor'  => $fill_color,
				'type'       => 'scatter',
				'mode'       => 'lines',
				'line'       => array(
					'color' => $fill_color,
					'width' => 0,
				),
				'name'       => $eval_display_text,
				'showlegend' => true,
				'yaxis'      => 'y',
				'xaxis'      => 'x',
			);
		}

		$event_markers_field = isset( $args['EventMarkersField'] ) ? (int) $args['EventMarkersField'] : 0;

		for ( $i = 0; $i <= $event_markers_field; $i++ ) {
			if ( isset( $args['EventMarkers'] ) && 'on' === $args['EventMarkers'] ) {
				$axis_type = isset( $args[ "EventMarkersEventAxis{$i}" ] ) ? $args[ "EventMarkersEventAxis{$i}" ] : null;
				$label     = isset( $args[ "EventMarkersEventText{$i}" ] ) ? $args[ "EventMarkersEventText{$i}" ] : null;
				$color     = ( isset( $args[ "EventMarkersEventColor{$i}" ] ) && '' !== $args[ "EventMarkersEventColor{$i}" ] ) ? $args[ "EventMarkersEventColor{$i}" ] : '#000';
				$line_type = ( isset( $args[ "EventMarkersLineType{$i}" ] ) && '' !== $args[ "EventMarkersLineType{$i}" ] ) ? $args[ "EventMarkersLineType{$i}" ] : 'solid';

				if ( 'x' === $axis_type ) {
					$date       = isset( $args[ "EventMarkersEventDate{$i}" ] ) ? $args[ "EventMarkersEventDate{$i}" ] : null;
					$overlays[] = array(
						'x'             => array( $date, $date ),
						'y'             => array( $y_min, $y_max ),
						'type'          => 'scatter',
						'mode'          => 'lines',
						'line'          => array(
							'color' => $color,
							'width' => 2,
							'dash'  => $line_type,
						),
						'name'          => $label,
						'showlegend'    => true,
						'yaxis'         => 'y',
						'xaxis'         => 'x',
						'hovertemplate' => "{$label}: {$x_hover_value}<extra></extra>",
					);
				}

				if ( 'y' === $axis_type ) {
					$y_value    = self::js_parse_float( isset( $args[ "EventMarkersEventYValue{$i}" ] ) ? $args[ "EventMarkersEventYValue{$i}" ] : null );
					$y_array    = array_fill( 0, is_array( $plotly_x ) ? count( $plotly_x ) : 0, $y_value );
					$overlays[] = array(
						'x'             => is_array( $plotly_x ) ? array_values( $plotly_x ) : array(),
						'y'             => $y_array,
						'type'          => 'scatter',
						'mode'          => 'lines',
						'line'          => array(
							'color' => $color,
							'width' => 2,
							'dash'  => $line_type,
						),
						'name'          => $label,
						'showlegend'    => true,
						'yaxis'         => 'y',
						'xaxis'         => 'x',
						'hovertemplate' => "{$label}: %{y}<extra></extra>",
					);
				}

				if ( 'x' === $axis_type ) {
					$date               = isset( $args[ "EventMarkersEventDate{$i}" ] ) ? $args[ "EventMarkersEventDate{$i}" ] : null;
					$layout['shapes']   = isset( $layout['shapes'] ) ? $layout['shapes'] : array();
					$layout['shapes'][] = array(
						'type' => 'line',
						'xref' => 'x',
						'yref' => 'paper',
						'x0'   => $date,
						'x1'   => $date,
						'y0'   => 0,
						'y1'   => 1,
						'line' => array(
							'color' => $color,
							'width' => 2,
							'dash'  => $line_type,
						),
					);
				}

				if ( 'y' === $axis_type ) {
					$y_value            = self::js_parse_float( isset( $args[ "EventMarkersEventYValue{$i}" ] ) ? $args[ "EventMarkersEventYValue{$i}" ] : null );
					$layout['shapes']   = isset( $layout['shapes'] ) ? $layout['shapes'] : array();
					$layout['shapes'][] = array(
						'type' => 'line',
						'xref' => 'paper',
						'yref' => 'y',
						'x0'   => 0,
						'x1'   => 1,
						'y0'   => $y_value,
						'y1'   => $y_value,
						'line' => array(
							'color' => $color,
							'width' => 2,
							'dash'  => $line_type,
						),
					);
				}
			}
		}

		return $overlays;
	}

	/**
	 * PHP port of computeStandardDeviation().
	 *
	 * @param array $values Raw values.
	 * @return float
	 */
	private static function compute_standard_deviation( array $values ) {
		$numeric = array();
		foreach ( $values as $v ) {
			if ( null !== $v && '' !== $v && ! ( is_string( $v ) && 'NA' === strtoupper( trim( $v ) ) ) && is_numeric( $v ) ) {
				$numeric[] = (float) $v;
			}
		}

		if ( empty( $numeric ) ) {
			return 0.0;
		}

		$n        = count( $numeric );
		$mean     = array_sum( $numeric ) / $n;
		$variance = 0.0;
		foreach ( $numeric as $v ) {
			$variance += ( $v - $mean ) ** 2;
		}
		$variance /= $n;

		return sqrt( $variance );
	}

	/**
	 * PHP port of computePercentile().
	 *
	 * @param array $values     Raw values.
	 * @param float $percentile Percentile (0-100).
	 * @return float|null
	 */
	private static function compute_percentile( array $values, $percentile ) {
		$arr   = array_values( $values );
		$count = count( $arr );

		if ( 0 === $count ) {
			return null;
		}
		if ( 1 === $count ) {
			return $arr[0];
		}

		sort( $arr, SORT_NUMERIC );

		$index = ( $percentile / 100 ) * ( $count - 1 );
		$lower = (int) floor( $index );
		$upper = (int) ceil( $index );

		if ( $lower === $upper ) {
			return $arr[ $lower ];
		}

		return $arr[ $lower ] + ( $index - $lower ) * ( $arr[ $upper ] - $arr[ $lower ] );
	}

	/**
	 * Mean of $values, treating null/''/case-insensitive-"NA"/non-numeric entries as 0 in the
	 * numerator while excluding only null and the exact literal "NA" from the denominator.
	 * This numerator/denominator inconsistency exists in the source and is replicated here.
	 *
	 * @param array $values Raw values.
	 * @return float|null
	 */
	private static function mean_treating_na_as_zero( array $values ) {
		$sum = 0.0;
		foreach ( $values as $v ) {
			$is_na_like = ( null === $v || '' === $v || ( is_string( $v ) && 'NA' === strtoupper( trim( $v ) ) ) || ! is_numeric( $v ) );
			$sum       += $is_na_like ? 0.0 : (float) $v;
		}

		$denominator = 0;
		foreach ( $values as $v ) {
			if ( null !== $v && 'NA' !== $v ) {
				++$denominator;
			}
		}

		return $denominator > 0 ? $sum / $denominator : null;
	}

	/**
	 * PHP port of the repeated `.filter(item => item !== "")` pattern.
	 *
	 * @param array $values Raw values.
	 * @return array
	 */
	private static function filter_out_empty_string( array $values ) {
		return array_values(
			array_filter(
				$values,
				function ( $v ) {
					return '' !== $v;
				}
			)
		);
	}

	/**
	 * PHP port of the `lightenColor()` helper in plotly-bar.js.
	 *
	 * @param string $hex    Hex color (e.g. "#0c7d83").
	 * @param float  $factor Lightening factor.
	 * @return string
	 */
	private static function lighten_color( $hex, $factor = 0.2 ) {
		$hex = ltrim( (string) $hex, '#' );

		if ( 6 !== strlen( $hex ) || ! ctype_xdigit( $hex ) ) {
			return $hex ? "#{$hex}" : '#000000';
		}

		$rgb = hexdec( $hex );
		$r   = min( 255, (int) floor( ( ( $rgb >> 16 ) & 0xff ) + 255 * $factor ) );
		$g   = min( 255, (int) floor( ( ( $rgb >> 8 ) & 0xff ) + 255 * $factor ) );
		$b   = min( 255, (int) floor( ( $rgb & 0xff ) + 255 * $factor ) );

		return "rgb({$r},{$g},{$b})";
	}

	/**
	 * Approximates JS's parseFloat(): parses a leading numeric portion of a string, or returns
	 * null (JSON.stringify(NaN) serializes to null in JS, so null is the faithful equivalent).
	 *
	 * @param mixed $value Value to parse.
	 * @return float|null
	 */
	private static function js_parse_float( $value ) {
		if ( is_int( $value ) || is_float( $value ) ) {
			return (float) $value;
		}
		if ( is_string( $value ) && preg_match( '/^\s*[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/', $value, $m ) ) {
			return (float) $m[0];
		}
		return null;
	}

	/**
	 * Approximates JS's parseInt(value, 10). Returns null (JSON-equivalent of NaN) when the
	 * value has no leading integer portion.
	 *
	 * @param mixed $value Value to parse.
	 * @return int|null
	 */
	private static function js_parse_int( $value ) {
		if ( is_int( $value ) ) {
			return $value;
		}
		if ( is_string( $value ) && preg_match( '/^\s*[+-]?\d+/', $value, $m ) ) {
			return (int) $m[0];
		}
		if ( is_float( $value ) ) {
			return (int) $value;
		}
		return null;
	}
}
