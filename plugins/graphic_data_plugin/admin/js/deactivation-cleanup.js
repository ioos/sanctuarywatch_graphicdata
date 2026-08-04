/**
 * Prompts to optionally delete all Graphic Data plugin data when the plugin
 * is deactivated from the Plugins screen.
 *
 * The deletion AJAX request is fired while the plugin is still active, before
 * the deactivate link is followed — a deactivated plugin's PHP no longer
 * loads on subsequent requests, so there is no later point where this plugin
 * could still ask the question or perform the cleanup.
 *
 * Communicates with {@link Graphic_Data_Deactivation_Cleanup::ajax_delete_all_data()}
 * via admin-ajax.php using the action `graphic_data_delete_all_data`, guarded
 * by the nonce injected on `window.graphicDataDeactivation`.
 */
( function () {
	const config = window.graphicDataDeactivation;
	if ( ! config ) {
		return;
	}

	const row = document.querySelector( 'tr[data-plugin="' + config.pluginFile + '"]' );
	const deactivateLink = row ? row.querySelector( 'a[href*="action=deactivate"]' ) : null;
	if ( ! deactivateLink ) {
		return;
	}

	deactivateLink.addEventListener( 'click', function ( event ) {
		event.preventDefault();
		const href = deactivateLink.href;

		if ( ! window.confirm( config.confirmText ) ) {
			window.location.href = href;
			return;
		}

		fetch( config.ajaxUrl, {
			method: 'POST',
			credentials: 'same-origin',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams( {
				action: 'graphic_data_delete_all_data',
				nonce: config.nonce,
			} ),
		} )
			.then( function ( response ) {
				return response.json();
			} )
			.then( function ( result ) {
				if ( ! result || ! result.success ) {
					window.alert( config.errorText );
				}
			} )
			.catch( function () {
				window.alert( config.errorText );
			} )
			.finally( function () {
				window.location.href = href;
			} );
	} );
} )();
