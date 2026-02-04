// This script is used to add validation to the Quick Edit slug field for the 'scene' post type.

(function () {
	'use strict';

	// Store the original inlineEditPost.edit function
	const originalEdit = window.inlineEditPost
		? window.inlineEditPost.edit
		: null;

	if (!originalEdit) {
		console.error('inlineEditPost not found');
		return;
	}

	// Override the edit function to add our validation
	window.inlineEditPost.edit = function (id) {
		// Call the original function
		originalEdit.apply(this, arguments);

		let postId = 0;
		if (typeof id === 'object') {
			postId = parseInt(this.getId(id));
		}

		if (postId > 0) {
			// Get the edit row
			const editRow = document.getElementById('edit-' + postId);
			if (!editRow) {
				return;
			}

			let slugInput = editRow.querySelector('input[name="post_name"]');
			const noticeContainer = editRow.querySelector('.inline-edit-col');

			if (!slugInput || !noticeContainer) {
				return;
			}

			// Remove any existing notice
			removeNotices(editRow);

			// Remove previous event listener if exists
			const newSlugInput = slugInput.cloneNode(true);
			slugInput.parentNode.replaceChild(newSlugInput, slugInput);
			slugInput = newSlugInput;

			// Add validation on blur (when user leaves the slug field)
			slugInput.addEventListener('blur', function () {
				const slug = this.value.trim();

				// Remove previous notices
				removeNotices(editRow);

				if (slug === '') {
					return;
				}

				// Show checking message
				const checkingNotice = createNotice(
					'info',
					sceneQuickEdit.messages.checking
				);
				noticeContainer.insertBefore(
					checkingNotice,
					noticeContainer.firstChild
				);

				// Check via AJAX
				const formData = new FormData();
				formData.append('action', 'scene_validate_slug');
				formData.append('nonce', sceneQuickEdit.nonce);
				formData.append('slug', slug);
				formData.append('post_id', postId);

				fetch(sceneQuickEdit.ajax_url, {
					method: 'POST',
					credentials: 'same-origin',
					body: formData,
				})
					.then(function (response) {
						return response.json();
					})
					.then(function (response) {
						// Remove checking notice
						if (checkingNotice.parentNode) {
							checkingNotice.parentNode.removeChild(
								checkingNotice
							);
						}

						if (response.success && response.data.exists) {
							// Show warning
							const warningNotice = createNotice(
								'warning',
								'<strong>⚠️ ' +
									response.data.message +
									'</strong>'
							);
							noticeContainer.insertBefore(
								warningNotice,
								noticeContainer.firstChild
							);
						}
					})
					.catch(function (error) {
						// Remove checking notice on error
						if (checkingNotice.parentNode) {
							checkingNotice.parentNode.removeChild(
								checkingNotice
							);
						}
						console.error('Validation error:', error);
					});
			});
		}
	};

	// Helper function to create notice element
	function createNotice(type, message) {
		const notice = document.createElement('div');
		notice.className =
			'scene-slug-notice notice notice-' + type + ' inline';
		notice.style.margin = '5px 0';
		notice.style.padding = '5px 10px';

		const paragraph = document.createElement('p');
		paragraph.innerHTML = message;
		notice.appendChild(paragraph);

		return notice;
	}

	// Helper function to remove all notices
	function removeNotices(editRow) {
		const notices = editRow.querySelectorAll('.scene-slug-notice');
		notices.forEach(function (notice) {
			if (notice.parentNode) {
				notice.parentNode.removeChild(notice);
			}
		});
	}

	// Clean up notices when Quick Edit is closed
	document.addEventListener('click', function (e) {
		if (
			e.target.classList.contains('cancel') ||
			e.target.closest('.cancel')
		) {
			const notices = document.querySelectorAll('.scene-slug-notice');
			notices.forEach(function (notice) {
				if (notice.parentNode) {
					notice.parentNode.removeChild(notice);
				}
			});
		}
	});
})();
