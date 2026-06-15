/**
 * admin-tinymce-new-tab.js
 *
 * Manages default "open in new tab" behavior for links inserted via TinyMCE
 * editor fields in the Graphic Data plugin admin.
 *
 * When the plugin setting `links_new_tab_by_default` is enabled, this script
 * does two things for each targeted editor field:
 *
 *   1. INSERTION DEFAULT — Hooks TinyMCE's `BeforeExecCommand` event to
 *      intercept every `mceInsertLink` call.  If the link attrs object
 *      contains no `target` property (i.e. the user has not explicitly chosen
 *      a target), `target="_blank"` and `rel="noopener noreferrer"` are
 *      injected before the command executes.  This covers both the modern
 *      inline link popover (which never touches the wpLink modal checkbox)
 *      and the full wpLink modal dialog.
 *
 *   2. DIALOG CHECKBOX DEFAULT — Additionally pre-checks the "Open link in a
 *      new tab" checkbox in the full wpLink modal dialog when it is opened
 *      from a targeted field, so the UI reflects the default behaviour.
 *      Because WordPress's internal `setData()` runs synchronously inside
 *      `wpLink.open()` and resets the checkbox, the check is applied via
 *      `setTimeout( fn, 0 )` after the call stack has fully unwound.
 *
 * Background: Since WordPress 4.5 the TinyMCE link button opens a lightweight
 * inline popover rather than the full wpLink modal.  The popover constructs
 * its own attrs object and calls `mceInsertLink` directly, completely
 * bypassing `#wp-link-target`.  The `BeforeExecCommand` hook is therefore the
 * only reliable place to ensure `target="_blank"` is present regardless of
 * which UI path the user took.
 *
 * The `BeforeExecCommand` handler deliberately does NOT override an explicit
 * `target` value.  If the user opened the full modal and unchecked "Open in
 * new tab", the attrs object will contain `target: ''`; this script leaves
 * that empty string in place and does not replace it, respecting the user's
 * explicit choice.
 *
 * Targeted fields are supplied by PHP via the `script_module_data_*` filter
 * as a JSON data island; `config.targetFields` is an array of TinyMCE editor
 * textarea IDs.
 *
 * @package Graphic_Data_Plugin
 * @since   1.0.0
 */

/**
 * Configuration object injected by PHP via the script_module_data filter.
 *
 * @typedef  {Object}   GraphicDataNewTabConfig
 * @property {boolean}  enabled      - Whether the new-tab default is active.
 * @property {string[]} targetFields - Array of TinyMCE editor textarea IDs
 *                                     (e.g. ['scene_tagline', 'modal_tagline']).
 */

/**
 * Safely read the data island emitted by wp_script_modules data filter.
 * The element ID follows WordPress's convention:
 * `wp-script-module-data-{$module_id}`.
 *
 * @type {GraphicDataNewTabConfig|null}
 */
const _configEl = document.getElementById(
	'wp-script-module-data-@graphic-data/admin-tinymce-new-tab'
);

let config = null;
if ( _configEl?.textContent ) {
	try {
		config = JSON.parse( _configEl.textContent );
	} catch {}
}

/**
 * Normalised list of targeted editor IDs for fast look-up.
 *
 * @type {string[]}
 */
const targetFields =
	config && Array.isArray( config.targetFields ) ? config.targetFields : [];

/* ------------------------------------------------------------------
 * Internal helpers
 * ------------------------------------------------------------------ */

/**
 * Determines whether a given TinyMCE editor ID is in the list of
 * fields that should default new links to opening in a new tab.
 *
 * @since  1.0.0
 * @param  {string}  editorId - The `id` attribute of the editor textarea.
 * @return {boolean} True when the field is targeted; false otherwise.
 */
function isTargetField( editorId ) {
	return targetFields.indexOf( editorId ) !== -1;
}

/**
 * Returns the ID of the TinyMCE editor that was most recently active,
 * by reading `wpActiveEditor` — the global WordPress updates on focus.
 *
 * @since  1.0.0
 * @return {string|null} The editor ID string, or null if undetermined.
 */
function getActiveEditorId() {
	if ( typeof wpActiveEditor !== 'undefined' && wpActiveEditor ) {
		return wpActiveEditor;
	}
	return null;
}

/* ------------------------------------------------------------------
 * Hook 1 — BeforeExecCommand on each targeted TinyMCE editor instance
 *
 * Intercepts `mceInsertLink` before it executes and injects
 * target="_blank" + rel="noopener noreferrer" when no target has been
 * explicitly set by the user.
 * ------------------------------------------------------------------ */

/**
 * Attaches the `BeforeExecCommand` listener to a single TinyMCE editor
 * instance that is in the targeted fields list.
 *
 * The handler mutates the `value` object on the event in place.
 * TinyMCE passes this object by reference so the modification is seen
 * by the command when it executes immediately afterward.
 *
 * The handler only acts when `e.value.target` is `undefined` — meaning
 * neither the inline popover nor the full modal set an explicit value.
 * An empty string (`target: ''`) indicates the user deliberately
 * unchecked "Open in new tab" in the modal; that choice is preserved.
 *
 * @since  1.0.0
 * @param  {tinymce.Editor} editor - The TinyMCE editor instance.
 * @return {void}
 */
function attachInsertLinkHook( editor ) {
	/**
	 * Intercepts `mceInsertLink` and injects new-tab attributes when
	 * the user has not explicitly specified a target.
	 *
	 * @since  1.0.0
	 * @param  {tinymce.CommandEvent} e - The TinyMCE command event.
	 * @param  {string}               e.command - The command name.
	 * @param  {Object|string}        e.value   - The command value;
	 *   for `mceInsertLink` this is the link attributes object.
	 * @return {void}
	 */
	editor.on( 'BeforeExecCommand', function ( e ) {
		if ( e.command !== 'mceInsertLink' ) {
			return;
		}

		// value may be a plain href string in older code paths.
		if ( ! e.value || typeof e.value !== 'object' ) {
			return;
		}

		// Only inject when target is genuinely absent (undefined).
		// An empty string means the user explicitly cleared the target.
		if ( typeof e.value.target === 'undefined' ) {
			e.value.target = '_blank';
			e.value.rel    = 'noopener noreferrer';
		}
	} );
}

/* ------------------------------------------------------------------
 * Hook 2 — wpLink.open patch for the full modal dialog checkbox
 *
 * Pre-checks #wp-link-target after setData() has finished populating
 * the dialog, so the UI matches the insertion default above.
 * ------------------------------------------------------------------ */

/**
 * Patches `wpLink.open` to pre-check the "Open link in a new tab"
 * checkbox in the full wpLink modal when it is opened from a targeted
 * field and the link being edited has no existing target attribute.
 *
 * `setData()` runs synchronously inside `wpLink.open()` and resets all
 * dialog fields from the selected anchor's attributes.  A `setTimeout`
 * with a 0 ms delay defers the checkbox change until after `open()` —
 * and therefore `setData()` — has fully completed.
 *
 * @since  1.0.0
 * @return {void}
 */
function attachModalCheckboxHook() {
	if ( typeof wpLink === 'undefined' || typeof wpLink.open !== 'function' ) {
		return;
	}

	const originalOpen = wpLink.open;

	/**
	 * Replacement for `wpLink.open`.
	 *
	 * Captures the active editor ID before focus shifts to the dialog,
	 * delegates to the original implementation, then defers the checkbox
	 * default to after the call stack unwinds.
	 *
	 * @since  1.0.0
	 * @return {*} Returns whatever the original `wpLink.open` returns.
	 */
	wpLink.open = function () {
		// Must be captured here; wpActiveEditor becomes unreliable once
		// the dialog opens and takes focus.
		const editorId = getActiveEditorId();

		const result = originalOpen.apply( this, arguments );

		if ( editorId && isTargetField( editorId ) ) {
			// setData() has now finished (it runs synchronously inside
			// originalOpen).  Defer so the browser paints the dialog
			// before we touch the checkbox.
			setTimeout( function () {
				const checkbox = document.getElementById( 'wp-link-target' );
				if ( checkbox && ! checkbox.checked ) {
					checkbox.checked = true;
				}
			}, 0 );
		}

		return result;
	};
}

/* ------------------------------------------------------------------
 * Initialisation
 *
 * TinyMCE editors for custom fields are initialised after the page
 * loads.  We use tinymce.on('AddEditor') to catch each editor as it
 * becomes ready, and also iterate any already-initialised editors to
 * handle cases where this script loads late.
 * ------------------------------------------------------------------ */

/**
 * Wires up both hooks once TinyMCE and wpLink are available.
 *
 * - Registers a `tinymce.on('AddEditor')` listener so that any targeted
 *   editor initialised after this script runs receives the
 *   `BeforeExecCommand` hook automatically.
 * - Iterates `tinymce.editors` to attach the hook to any editors that
 *   are already initialised by the time this script runs.
 * - Calls `attachModalCheckboxHook()` once to patch `wpLink.open`.
 *
 * Polls for `tinymce` availability every 100 ms for up to 10 seconds
 * to accommodate deferred script loading.
 *
 * @since  1.0.0
 * @return {void}
 */
function init() {
	let attempts  = 0;
	const maxChecks = 100;

	const interval = setInterval( function () {
		attempts++;

		if ( typeof tinymce === 'undefined' ) {
			if ( attempts >= maxChecks ) {
				clearInterval( interval );
			}
			return;
		}

		clearInterval( interval );

		// Attach to any editors already present.
		if ( tinymce.editors && tinymce.editors.length ) {
			for ( let i = 0; i < tinymce.editors.length; i++ ) {
				const editor = tinymce.editors[ i ];
				if ( editor && isTargetField( editor.id ) ) {
					attachInsertLinkHook( editor );
				}
			}
		}

		// Attach to any targeted editors that initialise in the future.
		tinymce.on( 'AddEditor', function ( e ) {
			if ( e.editor && isTargetField( e.editor.id ) ) {
				// Wait for the editor to be fully ready before attaching.
				e.editor.on( 'init', function () {
					attachInsertLinkHook( e.editor );
				} );
			}
		} );

		// Patch wpLink.open for the full modal checkbox (best-effort;
		// wpLink may load after tinymce so we poll briefly for it too).
		attachModalCheckboxHook();
		if ( typeof wpLink === 'undefined' ) {
			let wpLinkAttempts  = 0;
			const wpLinkMaxChecks = 50;
			const wpLinkInterval  = setInterval( function () {
				wpLinkAttempts++;
				attachModalCheckboxHook();
				if (
					typeof wpLink !== 'undefined' ||
					wpLinkAttempts >= wpLinkMaxChecks
				) {
					clearInterval( wpLinkInterval );
				}
			}, 100 );
		}

	}, 100 );
}

// Only proceed when the feature is enabled and there are targeted fields.
// (Replaces the early `return` guards, which are illegal at module top level.)
if ( config && config.enabled && targetFields.length ) {
	init();
}