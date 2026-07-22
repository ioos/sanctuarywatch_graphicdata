/**
 * Graphic Data Site Checker admin module.
 *
 * Loaded on the "Site Checker" submenu page under `graphic-data-search`.
 * Drives the broken-link scan end-to-end:
 *
 *   1. Requests the full URL inventory from the server in a single call.
 *   2. Dedupes URLs and probes them in fixed-size batches, updating a
 *      `<progress>` bar between batches.
 *   3. Fans each per-URL result back out across every (post, field)
 *      occurrence and renders a report grouped by post.
 *
 * Communicates with the PHP class {@link Graphic_Data_Site_Checker} via
 * admin-ajax.php using the actions `graphic_data_gather_urls` and
 * `graphic_data_check_url_batch`, both guarded by the shared nonce injected
 * on `window.graphicDataSiteChecker`.
 *
 * @module @graphic-data/site-checker
 * @package Graphic_Data_Plugin
 */

/**
 * Configuration injected by the PHP side (see `print_inline_data()` in
 * `class-graphic-data-site-checker.php`) before this module loads.
 *
 * @typedef {Object} SiteCheckerConfig
 * @property {string} ajaxUrl   Absolute URL of admin-ajax.php.
 * @property {string} nonce     Nonce for the `graphic_data_site_checker` action.
 * @property {number} batchSize URLs to check per AJAX batch request.
 */

/**
 * A single URL occurrence returned by the gather endpoint. If the same URL
 * appears in multiple fields or multiple posts, it produces multiple items
 * — one per (post, meta key) location — so the report can name every place
 * a broken URL is referenced.
 *
 * @typedef {Object} UrlItem
 * @property {number} post_id     WordPress post ID.
 * @property {string} post_title  Post title; may be empty for untitled drafts.
 * @property {string} post_type   Post type slug: instance, scene, modal, or figure.
 * @property {string} edit_link   Absolute URL to the post editor, or empty string.
 * @property {string} meta_key    Raw postmeta key the URL was pulled from.
 * @property {string} field_label Human-readable label for that meta key.
 * @property {string} url         Absolute URL to check.
 */

/**
 * Reachability result for a single URL, returned by the batch check endpoint
 * keyed by URL string.
 *
 * @typedef {Object} UrlCheckResult
 * @property {boolean} ok     True when the URL responded with a 2xx or 3xx.
 * @property {number}  status HTTP status code, or 0 on transport failure.
 * @property {string}  error  Error message when the request could not complete.
 */

/**
 * A {@link UrlItem} enriched with its check result — the record shape used
 * to render each row of the broken-links report.
 *
 * @typedef {Object} BrokenLinkRow
 * @property {number} post_id
 * @property {string} post_title
 * @property {string} post_type
 * @property {string} edit_link
 * @property {string} meta_key
 * @property {string} field_label
 * @property {string} url
 * @property {number} status HTTP status code, or 0 on transport failure.
 * @property {string} error  Error message when the request could not complete.
 */

/**
 * Runtime configuration injected by PHP just before this module loads.
 *
 * @type {SiteCheckerConfig}
 */
const config = window.graphicDataSiteChecker || {};

/**
 * Module-scoped mutable state. Currently just a re-entrancy guard so the
 * "Check for Broken Links" button cannot start a second scan while one is
 * already in flight.
 *
 * @type {{ running: boolean }}
 */
const state = {
	running: false,
};

/**
 * DOM element IDs used by this module. Kept in one place so the markup in
 * `render_page()` and this file stay in sync.
 *
 * @type {Object<string,string>}
 */
const IDS = {
	button: 'graphic-data-check-broken-links',
	status: 'graphic-data-broken-links-status',
	progress: 'graphic-data-broken-links-progress',
	report: 'graphic-data-broken-links-report',
	targetInstance: 'target_instance',
};

/**
 * Shorthand for `document.getElementById`.
 *
 * @param {string} id Element ID.
 * @returns {HTMLElement|null} The matching element, or `null` if none exists.
 */
function byId( id ) {
	return document.getElementById( id );
}

/**
 * Show the status region with a message and optionally an animated spinner.
 *
 * The status region is used during the gather phase (when the total URL
 * count is not yet known, so a determinate progress bar is impossible) and
 * to surface fatal errors from the AJAX layer.
 *
 * @param {string}  text     Message to display.
 * @param {boolean} spinning When true, the WordPress `.is-active` spinner
 *                           animates alongside the text.
 * @returns {void}
 */
function setStatus( text, spinning ) {
	const el = byId( IDS.status );
	if ( ! el ) {
		return;
	}
	el.hidden = false;
	const textEl = el.querySelector( '.graphic-data-site-checker__status-text' );
	if ( textEl ) {
		textEl.textContent = text;
	}
	const spinner = el.querySelector( '.spinner' );
	if ( spinner ) {
		spinner.classList.toggle( 'is-active', Boolean( spinning ) );
	}
}

/**
 * Hide the status region. No-op if the region is not on the page.
 *
 * @returns {void}
 */
function hideStatus() {
	const el = byId( IDS.status );
	if ( el ) {
		el.hidden = true;
	}
}

/**
 * Show the progress region and update the `<progress>` bar and its label.
 *
 * Used once the total URL count is known (i.e. after the gather phase) so
 * the operator sees concrete progress rather than an indefinite spinner.
 *
 * @param {number} done  Number of URLs already probed.
 * @param {number} total Total number of URLs that will be probed.
 * @returns {void}
 */
function setProgress( done, total ) {
	const el = byId( IDS.progress );
	if ( ! el ) {
		return;
	}
	el.hidden = false;
	const progressEl = el.querySelector( 'progress' );
	if ( progressEl ) {
		progressEl.max = total;
		progressEl.value = done;
	}
	const textEl = el.querySelector( '.graphic-data-site-checker__progress-text' );
	if ( textEl ) {
		textEl.textContent = `${ done } / ${ total } URLs checked`;
	}
}

/**
 * Hide the progress region. No-op if the region is not on the page.
 *
 * @returns {void}
 */
function hideProgress() {
	const el = byId( IDS.progress );
	if ( el ) {
		el.hidden = true;
	}
}

/**
 * Reset the report region: hide it and empty its contents.
 *
 * Called at the start of every scan so a stale report from a previous run
 * never bleeds into a new one.
 *
 * @returns {void}
 */
function clearReport() {
	const el = byId( IDS.report );
	if ( el ) {
		el.hidden = true;
		el.innerHTML = '';
	}
}

/**
 * POST to admin-ajax.php with the shared nonce automatically attached.
 *
 * Thin `fetch` wrapper that normalizes error handling: non-2xx HTTP
 * responses and `wp_send_json_error()` payloads both surface as thrown
 * `Error` instances, so the caller only needs one `try`/`catch`.
 *
 * @param {string}                action Registered `wp_ajax_*` action name.
 * @param {Object<string,string>} [params] Additional form fields to POST.
 * @returns {Promise<Object>} Resolves to the server's `data` payload on success.
 * @throws {Error} On HTTP failure, invalid JSON, or a `success: false` response.
 */
async function ajax( action, params = {} ) {
	const body = new URLSearchParams();
	body.append( 'action', action );
	body.append( 'nonce', config.nonce || '' );
	for ( const [ key, value ] of Object.entries( params ) ) {
		body.append( key, value );
	}

	const res = await fetch( config.ajaxUrl, {
		method: 'POST',
		credentials: 'same-origin',
		body,
	} );

	if ( ! res.ok ) {
		throw new Error( `HTTP ${ res.status }` );
	}

	const payload = await res.json();
	if ( ! payload || ! payload.success ) {
		const message = payload && payload.data && payload.data.message
			? payload.data.message
			: 'Request failed.';
		throw new Error( message );
	}
	return payload.data;
}

/**
 * Escape a value for safe interpolation into HTML text or attribute contexts.
 *
 * Report markup is built with template literals rather than DOM APIs for
 * conciseness, so every dynamic value flows through this helper before it
 * touches `innerHTML`.
 *
 * @param {*} input Any value. `null` and `undefined` become the empty string.
 * @returns {string} HTML-escaped string.
 */
function escapeHtml( input ) {
	return String( input == null ? '' : input ).replace( /[&<>"']/g, ( c ) => {
		switch ( c ) {
			case '&': return '&amp;';
			case '<': return '&lt;';
			case '>': return '&gt;';
			case '"': return '&quot;';
			case "'": return '&#39;';
			default: return c;
		}
	} );
}

/**
 * Produce a display-shortened version of a URL that keeps the host and the
 * tail of the path visible (both usually informative) and drops the middle
 * with an ellipsis. Falls back to plain end-truncation if the URL cannot be
 * parsed by the `URL` constructor.
 *
 * Purely visual — callers should still use the full URL for `href` and
 * `title` so hover, click, and copy-link all yield the real target.
 *
 * @param {string} url            Full URL.
 * @param {number} [maxLength=55] Approximate visible character budget.
 * @returns {string} Shortened display string.
 */
function shortenUrl( url, maxLength = 55 ) {
	if ( typeof url !== 'string' || url.length <= maxLength ) {
		return url;
	}

	try {
		const parsed = new URL( url );
		const host = parsed.host;
		const path = parsed.pathname + parsed.search + parsed.hash;

		// If the host alone eats the budget, just end-truncate the whole URL.
		if ( host.length + 4 >= maxLength ) {
			return url.slice( 0, maxLength - 1 ) + '…';
		}

		const budget = maxLength - host.length - 1; // room after "host…"
		if ( path.length <= budget ) {
			return host + path;
		}

		const startLen = Math.max( 1, Math.floor( budget * 0.35 ) );
		const endLen = Math.max( 1, budget - startLen - 1 );
		return host + path.slice( 0, startLen ) + '…' + path.slice( -endLen );
	} catch ( e ) {
		return url.slice( 0, maxLength - 1 ) + '…';
	}
}

/**
 * Render the final report inside the report container.
 *
 * Three outcomes are supported:
 *
 *   - `totalChecked === 0`: no URLs were found in the scanned meta at all,
 *     shown as an info notice.
 *   - `totalChecked > 0` and `brokenItems` empty: all-clear success notice.
 *   - `brokenItems` non-empty: warning notice plus a table grouped by post,
 *     with clickable edit links and middle-truncated URLs.
 *
 * @param {number}          totalChecked Total number of URL occurrences examined.
 * @param {BrokenLinkRow[]} brokenItems  Items whose URL failed the reachability check.
 * @returns {void}
 */
function renderReport( totalChecked, brokenItems ) {
	const reportEl = byId( IDS.report );
	if ( ! reportEl ) {
		return;
	}
	reportEl.hidden = false;
	reportEl.removeAttribute( 'hidden' );
	reportEl.style.display = '';

	if ( brokenItems.length === 0 ) {
		if ( totalChecked === 0 ) {
			reportEl.innerHTML = `
				<div class="graphic-data-site-checker__notice graphic-data-site-checker__notice--info">
					<p><strong>No URLs were found</strong> in the scanned Graphic Data postmeta fields, so there is nothing to check.</p>
				</div>
			`;
		} else {
			reportEl.innerHTML = `
				<div class="graphic-data-site-checker__notice graphic-data-site-checker__notice--success">
					<p>
						<strong>No broken links found.</strong>
						All ${ totalChecked } URL${ totalChecked === 1 ? '' : 's' } across Graphic Data content responded successfully.
					</p>
				</div>
			`;
		}
		return;
	}

	// Group by post so the operator can jump to each affected post once.
	const groups = new Map();
	for ( const item of brokenItems ) {
		const key = `${ item.post_type }:${ item.post_id }`;
		if ( ! groups.has( key ) ) {
			groups.set( key, {
				post_title: item.post_title,
				post_type: item.post_type,
				edit_link: item.edit_link,
				rows: [],
			} );
		}
		groups.get( key ).rows.push( item );
	}

	let html = `
		<div class="graphic-data-site-checker__notice graphic-data-site-checker__notice--warning">
			<p>
				<strong>${ brokenItems.length } broken link${ brokenItems.length === 1 ? '' : 's' } found</strong>
				across ${ groups.size } post${ groups.size === 1 ? '' : 's' }
				(of ${ totalChecked } total URL${ totalChecked === 1 ? '' : 's' } checked).
			</p>
		</div>
		<table class="wp-list-table widefat striped graphic-data-site-checker__table">
			<thead>
				<tr>
					<th>Post</th>
					<th>Type</th>
					<th>Field</th>
					<th>URL</th>
					<th>Status</th>
				</tr>
			</thead>
			<tbody>
	`;

	for ( const group of groups.values() ) {
		const title = group.post_title || '(untitled)';
		const postCell = group.edit_link
			? `<a href="${ escapeHtml( group.edit_link ) }">${ escapeHtml( title ) }</a>`
			: escapeHtml( title );

		for ( const row of group.rows ) {
			const statusText = row.status
				? String( row.status )
				: ( row.error || 'Unreachable' );
			const fieldLabel = row.field_label || row.meta_key;
			const displayUrl = shortenUrl( row.url );
			html += `
				<tr>
					<td>${ postCell }</td>
					<td><code>${ escapeHtml( row.post_type ) }</code></td>
					<td>${ escapeHtml( fieldLabel ) }</td>
					<td class="graphic-data-site-checker__url-cell"><a href="${ escapeHtml( row.url ) }" target="_blank" rel="noopener noreferrer" title="${ escapeHtml( row.url ) }">${ escapeHtml( displayUrl ) }</a></td>
					<td>${ escapeHtml( statusText ) }</td>
				</tr>
			`;
		}
	}

	html += `
			</tbody>
		</table>
	`;

	reportEl.innerHTML = html;
}

/**
 * Kick off the whole broken-link scan and drive the UI through its phases.
 *
 * Sequence:
 *
 *   1. Disable the button, clear any prior report and progress state.
 *   2. Show the status spinner while the gather AJAX call runs.
 *   3. Dedupe URLs, slice into batches of `config.batchSize`, then probe
 *      each batch in sequence, advancing the progress bar after every
 *      batch.
 *   4. Re-associate each URL's result with every occurrence in the original
 *      item list and hand the result to {@link renderReport}.
 *
 * Re-entrant guard: no-ops immediately if a scan is already in flight.
 *
 * @returns {Promise<void>} Resolves once the scan finishes (or errors) and
 *                          the UI is back to an idle state.
 */
async function runBrokenLinkCheck() {
	if ( state.running ) {
		return;
	}
	state.running = true;

	const button = byId( IDS.button );
	if ( button ) {
		button.disabled = true;
	}

	clearReport();
	hideProgress();

	try {
		setStatus( 'Gathering URLs from Graphic Data posts…', true );

		const targetInstanceEl = byId( IDS.targetInstance );
		const targetInstance = targetInstanceEl ? targetInstanceEl.value : '';
		const gathered = await ajax(
			'graphic_data_gather_urls',
			targetInstance ? { target_instance: targetInstance } : {}
		);
		const items = Array.isArray( gathered.items ) ? gathered.items : [];

		if ( items.length === 0 ) {
			hideStatus();
			renderReport( 0, [] );
			return;
		}

		// Dedupe URLs for the actual network probes — many posts may reference
		// the same URL, but we only need to check it once.
		const uniqueUrls = Array.from( new Set( items.map( ( i ) => i.url ) ) );
		const batchSize = Number( config.batchSize ) > 0 ? Number( config.batchSize ) : 10;
		const statuses = new Map();
		let done = 0;

		hideStatus();
		setProgress( 0, uniqueUrls.length );

		for ( let i = 0; i < uniqueUrls.length; i += batchSize ) {
			const batch = uniqueUrls.slice( i, i + batchSize );
			const result = await ajax( 'graphic_data_check_url_batch', {
				urls: JSON.stringify( batch ),
			} );
			const results = result && result.results ? result.results : {};
			for ( const [ url, status ] of Object.entries( results ) ) {
				statuses.set( url, status );
			}
			done += batch.length;
			setProgress( Math.min( done, uniqueUrls.length ), uniqueUrls.length );
		}

		hideProgress();

		// Fan the URL-level results back out over every occurrence so the
		// report can name every post that references a broken URL.
		const broken = [];
		for ( const item of items ) {
			const status = statuses.get( item.url );
			if ( status && ! status.ok ) {
				broken.push( {
					...item,
					status: status.status,
					error: status.error,
				} );
			}
		}

		renderReport( items.length, broken );
	} catch ( err ) {
		hideProgress();
		setStatus( `Error: ${ err.message }`, false );
		// eslint-disable-next-line no-console
		console.error( '[graphic-data/site-checker]', err );
	} finally {
		state.running = false;
		if ( button ) {
			button.disabled = false;
		}
	}
}

/**
 * Attach the broken-link scan handler to the trigger button.
 *
 * No-op if the button is not on the page (e.g. if this module was
 * accidentally loaded on the wrong screen).
 *
 * @returns {void}
 */
function init() {
	const button = byId( IDS.button );
	if ( button ) {
		button.addEventListener( 'click', runBrokenLinkCheck );
	}
}

/*
 * Bootstrap: run `init` as soon as the DOM is ready. Script Modules load
 * with `defer` semantics, so `readyState === 'loading'` is unlikely, but
 * the double-branch keeps the module safe if load order ever changes.
 */
if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}
