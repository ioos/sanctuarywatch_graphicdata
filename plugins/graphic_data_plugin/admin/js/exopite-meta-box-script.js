/* global console */ (function ($) {
	'use strict';

	$(document).ready(function () {
		let metaImageFrame;

		$('.exopite-meta-boxes-upload-preview-close').on('click', function (e) {
			$(this).parent().css({
				display: 'none',
			});
			$(this).parent().next().val('');
		});

		$('.exopite-meta-boxes-upload-button').on('click', function (e) {
			// Sets up the media library frame
			metaImageFrame = wp.media.frames.metaImageFrame = wp.media({
				title: 'bla',
				button: {
					text: 'Use this file',
				},
				multiple: false,
				library: {
					// type: 'image',
					type: ['video', 'image'],
				},
			});

			const $that = $(this);

			// Runs when an image is selected.
			metaImageFrame.on('select', function () {
				// Grabs the attachment selection and creates a JSON representation of the model.
				const media_attachment = metaImageFrame
					.state()
					.get('selection')
					.first()
					.toJSON();
				const $mediaUrlField = $that
					.closest('span')
					.children('.exopite-meta-boxes-upload-url');
				const $mediaPreviewElement = $that
					.closest('span')
					.children('.exopite-meta-boxes-upload-preview');

				$mediaPreviewElement.css({
					'background-image': 'url("' + media_attachment.url + '")',
					display: 'block',
				});

				// Sends the attachment URL to our custom image input field.
				$mediaUrlField.val(media_attachment.url);
			});

			// Opens the media library frame.
			metaImageFrame.open();
		});

		$('.exopite-meta-boxes-gallery-field').exopiteSOFGallery();
	});
})(jQuery);

(function ($, window, document, undefined) {
	'use strict';

	const pluginName = 'exopiteSOFGallery';

	function Plugin(element, options) {
		this.element = element;
		this._name = pluginName;
		this.meta_gallery_frame = null;

		this.buildCache();
		this.init();
	}

	$.extend(Plugin.prototype, {
		init() {
			const plugin = this;

			plugin.bindEvents();
			plugin.sortableInit();
		},
		sortableInit() {
			const plugin = this;

			plugin.$galleryList.sortable({
				tolerance: 'pointer',
				cursor: 'grabbing',
				stop(event, ui) {
					const imageIDs = [];
					plugin.$galleryList
						.children('span')
						.each(function (index, el) {
							if ($(el).children('img').length) {
								imageIDs.push($(el).children('img').attr('id'));
							}
							if ($(el).children('video').length) {
								imageIDs.push(
									$(el).children('video').attr('id')
								);
							}
						});
					plugin.$imageIDs.val(imageIDs.join(','));
				},
			});
		},
		bindEvents() {
			const plugin = this;

			plugin.$element.on(
				'click' + '.' + plugin._name,
				'> .exopite-meta-boxes-gallery-add',
				function (e) {
					e.preventDefault();

					plugin.manageMediaFrame.call(plugin);
				}
			);

			plugin.$element.on(
				'click' + '.' + plugin._name,
				'.exopite-meta-boxes-image-delete',
				function (e) {
					console.log('delete click');
					e.preventDefault();

					plugin.deleteImage.call(plugin, $(this));
				}
			);
		},
		deleteImage($button) {
			const plugin = this;
			if (confirm('Are you sure you want to remove this image?')) {
				const removedImage = $button.next().attr('id');
				let galleryIds = plugin.$imageIDs.val().split(',');
				galleryIds = $(galleryIds).not([removedImage]).get();
				plugin.$imageIDs.val(galleryIds);
				$button.parent().remove();
				plugin.sortableInit();
			}
		},
		manageMediaFrame() {
			const plugin = this;

			// If the frame already exists, re-open it.
			if (plugin.meta_gallery_frame) {
				plugin.meta_gallery_frame.open();
				return;
			}

			const title =
				plugin.$element.data('media-frame-title') || 'Select Images';
			const button = plugin.$element.data('media-frame-button') || 'Add';
			const image = plugin.$element.data('media-frame-type') || 'image';

			// Sets up the media library frame
			plugin.meta_gallery_frame = wp.media.frames.meta_gallery_frame =
				wp.media({
					title,
					button: {
						text: button,
					},
					library: {
						type: ['video', 'image'],
						// type: image
					},
					multiple: true,
				});

			// Create Featured Gallery state. This is essentially the Gallery state, but selection behavior is altered.
			plugin.meta_gallery_frame.states.add([
				new wp.media.controller.Library({
					title,
					priority: 20,
					toolbar: 'main-gallery',
					filterable: 'uploaded',
					library: wp.media.query(
						plugin.meta_gallery_frame.options.library
					),
					multiple: plugin.meta_gallery_frame.options.multiple
						? 'reset'
						: false,
					editable: true,
					allowLocalEdits: true,
					displaySettings: true,
					displayUserSettings: true,
				}),
			]);

			plugin.meta_gallery_frame.on('open', function () {
				const selection = plugin.meta_gallery_frame
					.state()
					.get('selection');
				const library = plugin.meta_gallery_frame
					.state('gallery-edit')
					.get('library');
				const ids = plugin.$imageIDs.val();
				if (ids) {
					const idsArray = ids.split(',');
					idsArray.forEach(function (id) {
						const attachment = wp.media.attachment(id);
						attachment.fetch();
						selection.add(attachment ? [attachment] : []);
					});
				}
			});

			plugin.meta_gallery_frame.on('ready', function () {
				// $('.media-modal').addClass('no-sidebar');
			});

			// When an image is selected, run a callback.
			plugin.meta_gallery_frame.on('select', function () {
				const imageIDArray = [];
				let imageHTML = '';
				let metadataString = '';
				let images;
				images = plugin.meta_gallery_frame.state().get('selection');
				// imageHTML += '<ul class="exopite-meta-boxes-gallery">';
				images.each(function (attachment) {
					imageIDArray.push(attachment.attributes.id);

					// console.log('attrs: ' + JSON.stringify(attachment.attributes)); //video/mp4

					if (attachment.attributes.type == 'video') {
						imageHTML +=
							'<span class="exopite-meta-boxes-image-item"><span class="exopite-meta-boxes-image-delete"></span><video class="exopite-meta-boxes-video-thumbs" id="' +
							attachment.attributes.id +
							'" src="' +
							attachment.attributes.url +
							'"></video></span>';
					} else {
						imageHTML +=
							'<span class="exopite-meta-boxes-image-item"><span class="exopite-meta-boxes-image-delete"></span><img id="' +
							attachment.attributes.id +
							'" src="' +
							attachment.attributes.sizes.thumbnail.url +
							'"></span>';
					}
				});
				// imageHTML += '</ul>';
				metadataString = imageIDArray.join(',');
				if (metadataString) {
					plugin.$imageIDs.val(metadataString);
					plugin.$element
						.children('.exopite-meta-boxes-gallery')
						.html(imageHTML);
				}
			});

			// Finally, open the modal
			plugin.meta_gallery_frame.open();
		},
		destroy() {
			this.unbindEvents();
			this.$element.removeData();
		},
		unbindEvents() {
			this.$element.off('.' + this._name);
		},
		buildCache() {
			this.$element = $(this.element);
			this.$imageIDs = this.$element.children(
				'[data-control="gallery-ids"]'
			);
			this.$galleryList = this.$element.children(
				'.exopite-meta-boxes-gallery'
			);
		},
	});

	$.fn[pluginName] = function (options) {
		return this.each(function () {
			if (!$.data(this, 'plugin_' + pluginName)) {
				$.data(this, 'plugin_' + pluginName, new Plugin(this, options));
			}
		});
	};
})(jQuery, window, document);
