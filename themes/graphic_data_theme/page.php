<?php
/**
 * Page template for standard WordPress Pages.
 *
 * This template allows normal WordPress Pages to render block editor content
 * inside the Graphic Data Theme. Without this file, Pages fall back to
 * index.php, which is a custom instance-grid template and does not call
 * the_content().
 *
 * @package Graphic_Data_Theme
 */

defined( 'ABSPATH' ) || exit;

get_header();
?>

<main id="primary" class="site-main graphic-data-page" role="main">
	<?php
	while ( have_posts() ) :
		the_post();
		?>

		<article id="post-<?php the_ID(); ?>" <?php post_class( 'graphic-data-page-article' ); ?>>
			<?php if ( ! is_front_page() ) : ?>
				<header class="graphic-data-page-header">
					<?php the_title( '<h1 class="graphic-data-page-title">', '</h1>' ); ?>
				</header>
			<?php endif; ?>

			<div class="entry-content graphic-data-page-content">
				<?php
				the_content();

				wp_link_pages(
					array(
						'before' => '<nav class="page-links" aria-label="' . esc_attr__( 'Page', 'graphic_data_theme' ) . '">',
						'after'  => '</nav>',
					)
				);
				?>
			</div>
		</article>

	<?php endwhile; ?>
</main>

<?php
get_footer();
