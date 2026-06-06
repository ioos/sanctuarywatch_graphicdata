<?php
/**
 * Fix <a> tags: ensure target="_blank" and rel="noopener" on all links
 * in targeted post meta fields across scene, modal, and figure CPTs.
 *
 * Usage:
 *   wp eval-file fix-links.php              # dry run (no changes written)
 *   wp eval-file fix-links.php -- --commit  # write changes to DB
 */

// ── Configure: post_type => [ meta_key, ... ] ────────────────────────────────
$targets = [
    'scene'  => [ 'scene_tagline' ],
    'modal'  => [ 'modal_tagline' ],
    'figure' => [ 'figure_caption_short', 'figure_caption_long' ],
];
// ─────────────────────────────────────────────────────────────────────────────

$commit   = in_array( '--commit', $args, true );
$dry_run  = ! $commit;

WP_CLI::log( $dry_run
    ? '=== DRY RUN — no changes will be written. Pass -- --commit to apply. ==='
    : '=== COMMIT MODE — changes will be written to the database. ==='
);

$total_posts_checked = 0;
$total_fields_patched = 0;
$total_links_patched  = 0;

foreach ( $targets as $post_type => $meta_keys ) {

    $posts = get_posts( [
        'post_type'      => $post_type,
        'post_status'    => 'any',
        'posts_per_page' => -1,
        'fields'         => 'ids',
    ] );

    WP_CLI::log( sprintf( "\n[%s] %d post(s) found.", $post_type, count( $posts ) ) );

    foreach ( $posts as $post_id ) {
        $total_posts_checked++;

        foreach ( $meta_keys as $meta_key ) {
            $original = get_post_meta( $post_id, $meta_key, true );

            if ( ! $original || ! is_string( $original ) ) {
                continue;
            }

            // Skip fields with no <a> tags at all — nothing to do.
            if ( stripos( $original, '<a ' ) === false && stripos( $original, '<a>' ) === false ) {
                continue;
            }

            $patched = patch_links( $original );

            if ( $patched === $original ) {
                continue; // No changes needed.
            }

            $total_fields_patched++;

            // Count how many links actually changed in this field.
            $links_changed = count_link_diff( $original, $patched );
            $total_links_patched += $links_changed;

            WP_CLI::log( sprintf(
                '  post %d | %s | %d link(s) patched',
                $post_id, $meta_key, $links_changed
            ) );

            if ( ! $dry_run ) {
                update_post_meta( $post_id, $meta_key, $patched );
            }
        }
    }
}

WP_CLI::success( sprintf(
    "\nDone. Posts checked: %d | Fields patched: %d | Links patched: %d%s",
    $total_posts_checked,
    $total_fields_patched,
    $total_links_patched,
    $dry_run ? ' (DRY RUN — rerun with -- --commit to apply)' : ''
) );

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Walk every <a> tag in an HTML fragment and ensure it has
 * target="_blank" and rel="noopener". Returns the modified string.
 */
function patch_links( string $html ): string {
    // Wrap in a known root so DOMDocument doesn't add <html>/<body>.
    $wrapped = '<div id="__patch_root__">' . $html . '</div>';

    $dom = new DOMDocument();
    // Suppress warnings from HTML5 entities / partial fragments.
    libxml_use_internal_errors( true );
    // UTF-8 declaration prevents DOMDocument from mangling multibyte chars.
    $dom->loadHTML( '<?xml encoding="UTF-8">' . $wrapped, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );
    libxml_clear_errors();

    $anchors = $dom->getElementsByTagName( 'a' );

    foreach ( $anchors as $a ) {
        // target="_blank"
        if ( $a->getAttribute( 'target' ) !== '_blank' ) {
            $a->setAttribute( 'target', '_blank' );
        }

        // rel — preserve existing values, just ensure "noopener" is present.
        $rel   = $a->getAttribute( 'rel' );
        $parts = $rel ? preg_split( '/\s+/', trim( $rel ) ) : [];

        if ( ! in_array( 'noopener', $parts, true ) ) {
            $parts[] = 'noopener';
            $a->setAttribute( 'rel', implode( ' ', $parts ) );
        }
    }

    // Extract only the content of our wrapper div.
    $root   = $dom->getElementById( '__patch_root__' );
    $output = '';
    foreach ( $root->childNodes as $child ) {
        $output .= $dom->saveHTML( $child );
    }

    return $output;
}

/**
 * Rough count of how many <a> tags differ between two HTML strings —
 * used only for the log summary, not for correctness.
 */
function count_link_diff( string $before, string $after ): int {
    preg_match_all( '/<a\s[^>]*>/i', $before, $before_tags );
    preg_match_all( '/<a\s[^>]*>/i', $after,  $after_tags  );

    $count = 0;
    foreach ( $after_tags[0] as $i => $tag ) {
        if ( ! isset( $before_tags[0][ $i ] ) || $before_tags[0][ $i ] !== $tag ) {
            $count++;
        }
    }

    return $count ?: count( $after_tags[0] ); // fallback: count all
}
