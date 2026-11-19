<?php
/**
 * Content Transfer schema upgrades. Runs without WordPress:
 *   php tests/content-transfer/schema-upgrade.test.php
 */

define( 'ABSPATH', __DIR__ . '/' );
// Minimal stand-in for WordPress's error class.
class WP_Error {
	public $message;
	public function __construct( $code, $message ) {
		$this->message = $message;
	}
}
function is_wp_error( $value ) {
	return $value instanceof WP_Error;
}
require __DIR__ . '/../../plugins/graphic_data_plugin/admin/class-transfer-schema.php';

$failures = 0;
function check( $label, $condition ) {
	global $failures;
	if ( ! $condition ) {
		++$failures;
		fwrite( STDERR, "FAIL: $label\n" );
	}
}

// Every released format above 1 needs a step from the one before it.
$steps = Graphic_Data_Transfer_Schema::get_upgrades();
for ( $v = 2; $v <= Graphic_Data_Transfer_Schema::SCHEMA_VERSION; $v++ ) {
	check( "upgrade step to version $v exists", isset( $steps[ $v ] ) && is_callable( $steps[ $v ] ) );
}
check( 'no steps beyond SCHEMA_VERSION', ! $steps || max( array_keys( $steps ) ) <= Graphic_Data_Transfer_Schema::SCHEMA_VERSION );
check( 'current-version content is unchanged', array( 'posts' => array() ) === Graphic_Data_Transfer_Schema::upgrade_content( array( 'posts' => array() ), Graphic_Data_Transfer_Schema::SCHEMA_VERSION ) );

$content = array(
	'posts' => array(
		array( 'post_type' => 'figure', 'meta' => array( 'old_key' => 'a', 'figure_path' => 'Internal' ) ),
		array( 'post_type' => 'figure', 'meta' => array( 'old_key' => 'b', 'new_key' => 'kept' ) ),
		array( 'post_type' => 'scene', 'meta' => array( 'old_key' => 'c' ) ),
		array( 'post_type' => 'figure' ),
	),
);
$renamed = Graphic_Data_Transfer_Schema::rename_meta_key( $content, 'figure', 'old_key', 'new_key' );
check( 'rename moves the value', array( 'figure_path' => 'Internal', 'new_key' => 'a' ) === $renamed['posts'][0]['meta'] );
check( 'rename keeps an existing new value', array( 'new_key' => 'kept' ) === $renamed['posts'][1]['meta'] );
check( 'rename leaves other types alone', array( 'old_key' => 'c' ) === $renamed['posts'][2]['meta'] );
check( 'rename skips posts without meta', ! isset( $renamed['posts'][3]['meta'] ) );

// Steps run in order, each on the previous step's output.
$chain = array(
	2 => function ( $c ) {
		return Graphic_Data_Transfer_Schema::rename_meta_key( $c, 'figure', 'old_key', 'mid_key' );
	},
	3 => function ( $c ) {
		$c = Graphic_Data_Transfer_Schema::rename_meta_key( $c, 'figure', 'mid_key', 'new_key' );
		$c['steps'][] = 3;
		return $c;
	},
);
$upgraded = Graphic_Data_Transfer_Schema::run_upgrades( $content, 1, 3, $chain );
check( 'chain reaches the last version', is_array( $upgraded ) && array( 3 ) === $upgraded['steps'] );
check( 'chain applies every step', is_array( $upgraded ) && 'a' === $upgraded['posts'][0]['meta']['new_key'] && ! isset( $upgraded['posts'][0]['meta']['mid_key'] ) );
$partial = Graphic_Data_Transfer_Schema::run_upgrades( $content, 2, 3, $chain );
check( 'a version 2 package skips the step to 2', is_array( $partial ) && 'a' === $partial['posts'][0]['meta']['old_key'] );

$missing = Graphic_Data_Transfer_Schema::run_upgrades( $content, 1, 4, $chain );
check( 'a missing step is an error', is_wp_error( $missing ) && false !== strpos( $missing->message, 'version 1' ) );
$broken = Graphic_Data_Transfer_Schema::run_upgrades(
	$content,
	1,
	2,
	array(
		2 => function () {
			return null;
		},
	)
);
check( 'a step that returns no content is an error', is_wp_error( $broken ) && false !== strpos( $broken->message, 'version 2' ) );

if ( $failures ) {
	exit( 1 );
}
echo "PASS: upgrade steps exist for every version, run in order from the package's version, report missing or broken steps, and rename keys.\n";
