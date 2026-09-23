/**
 * Registers the Graphic Data Figure block in the editor.
 *
 * Important:
 * - This file is for the Gutenberg editor bundle.
 * - Do not import ./view here.
 * - The frontend view script should be declared in block.json with "viewScript": "file:./view.js".
 */
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import Edit from './edit';
import save from './save';
import metadata from './block.json';

/**
 * Define a custom SVG icon for the block.
 */
const figureIcon = (
	<svg
		viewBox="0 0 24 24"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
		focusable="false"
	>
		<path d="M4 19.5h16v1.5H3V3h1.5v16.5z" />
		<path d="M7 17h2.5v-6H7v6z" />
		<path d="M11 17h2.5V7H11v10z" />
		<path d="M15 17h2.5v-4H15v4z" />
		<path d="M6.5 9.5l4-3 3.5 3 4-5 .9.8-4.8 6-3.6-3.1-3.3 2.5-.7-1.2z" />
	</svg>
);

/**
 * Register the block for the editor.
 *
 * Spread metadata so the editor receives attributes/supports from block.json.
 * Frontend rendering still comes from render.php + view.js, not from this file.
 */
registerBlockType( metadata.name, {
	...metadata,
	icon: figureIcon,
	edit: Edit,
	save,
} );