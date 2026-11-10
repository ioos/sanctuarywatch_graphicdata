/**
 * Registers the Graphic Data Instance block in the editor.
 *
 * The tile is fully server-rendered by render.php, so there is no view script.
 */
import { registerBlockType } from '@wordpress/blocks';

// Emitted as build/index.css, which block.json loads as the block "style".
import './index.css';

/**
 * Internal dependencies
 */
import Edit from './edit';
import save from './save';
import metadata from './block.json';

/**
 * Tile card icon: image area above a title button.
 */
const instanceIcon = (
	<svg
		viewBox="0 0 24 24"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
		focusable="false"
	>
		<path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm0 1.5a.5.5 0 0 0-.5.5v14c0 .28.22.5.5.5h14a.5.5 0 0 0 .5-.5V5a.5.5 0 0 0-.5-.5H5z" />
		<path d="M6 13l3-3.5 2.5 2.5L14 9l4 4H6z" />
		<path d="M6.5 15.5h11V18h-11z" />
	</svg>
);

registerBlockType( metadata.name, {
	...metadata,
	icon: instanceIcon,
	edit: Edit,
	save,
} );
