/**
 * Asks, when the plugin is deactivated from the Plugins screen, whether all
 * Graphic Data plugin data should be permanently deleted the next time the
 * plugin is deleted, and saves that preference.
 *
 * The preference-saving AJAX request is fired while the plugin is still
 * active, before the deactivate link is followed — a deactivated plugin's
 * PHP no longer loads on subsequent requests, including the request where
 * the "Delete" link on the Plugins screen is clicked (WordPress only shows
 * that link once a plugin is inactive). So there is no later point where
 * this plugin could still ask the question; deactivation is used as a
 * stand-in, and uninstall.php reads back the saved preference.
 *
 * Communicates with {@link Graphic_Data_Deactivation_Cleanup::ajax_set_uninstall_preference()}
 * via admin-ajax.php using the action `graphic_data_set_uninstall_preference`,
 * guarded by the nonce injected on `window.graphicDataDeactivation`.
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
		const deleteOnUninstall = window.confirm( config.confirmText );

		fetch( config.ajaxUrl, {
			method: 'POST',
			credentials: 'same-origin',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams( {
				action: 'graphic_data_set_uninstall_preference',
				nonce: config.nonce,
				delete_on_uninstall: deleteOnUninstall ? '1' : '0',
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
