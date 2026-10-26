# Image Carousel — first implementation

Select **Figure type → Interactive → Interactive type → Image Carousel**.
Set playback, choose 1–16 images, and select each image from the Media Library.
Each row has an optional rich-text caption below the image (hidden without reserved space when blank), an optional plain-text overlay, a text-position selector, and separate alternative text. Position choices are ordered top left, top center, top right (default), then bottom left, bottom center, and bottom right. Form labels are left-aligned above their controls.

- Autoplay defaults to off.
- Visible time defaults to 3.5 seconds, measured after the image is ready and its fade completes.
- Fade defaults to 1 second; zero disables animation.
- Lowering the image count preserves inactive rows in the editable settings, including across saves.
- Images are contained without cropping in a stable 16:9 viewing area. Figure blocks can override the height.
- Media Library selections prepare display copies at most 2,048 pixels on the longest edge. Existing originals remain intact. Smaller responsive candidates are retained.
- The first image loads immediately, the next is preloaded, and later images load as needed.
- Manual navigation and focusing navigation controls pause autoplay. Play works with mouse or keyboard focus retained, and hovering does not pause playback. Hidden documents/tabs/modals pause playback temporarily. Reduced-motion preferences disable initial autoplay and fades.
- Each instance owns its timers and tears down when removed. Styles travel with the element into Gutenberg's iframe.

## Storage

`figure_interactive_arguments` keeps the existing `[id, value]` format, including `graphType = "Image Carousel"` and all configured image rows. Captions use the WordPress Visual/Text editor (bold, italic, lists, blockquotes, and links). CaptionFormat distinguishes HTML from older literal plain-text captions. Allowed markup is sanitized before rendering; blank editor markup collapses the caption area. JSON escapes angle brackets so WordPress does not alter rich-text attributes inside serialized strings. Hidden rows are retained when the carousel settings UI is temporarily unmounted.

`figure_interactive_args_rendered` contains `{type: "image-carousel", version: 1, playback, slides}` with only active images. Each slide holds an attachment ID, display URL, responsive candidates, dimensions, plain text, and alternative text.

Existing chart/table `graphType` identifiers are unchanged; only the visible label is now **Interactive type**. Their column controls still wait for uploaded data.

## Main source files

- `includes/figures/js/interactive/image-carousel.js`: specification, rendering, playback, cleanup.
- `includes/figures/js/interactive/image-carousel-settings.js`: admin controls and Media Library selection.
- `includes/carousel-images.php`: authenticated display-copy preparation for new and existing attachments.
- `includes/figures/js/interactive/file-upload.js`: type-first setup and conditional data loading.
- `includes/figures/js/figure-render.js`: shared renderer dispatch.
- `admin/js/admin-preview-buttons.js`: preview/publish guards and standalone HTML export.

Paths above are relative to `plugins/graphic_data_plugin`.

## Verification

Run from wp-content with development dependencies installed in the plugin:

```sh
node --experimental-vm-modules tests/carousel/carousel.test.cjs
```

The tests use jsdom and fake timers without a server or database. They cover data-free configuration, inactive-row persistence and restoration, existing chart/table settings, timing, independent instances, deferred loading, hidden-state pause, manual navigation, iframe movement, cleanup, validation, and standalone export serialization.

Live WordPress and visual browser verification remain to be done:

1. Create and publish a new carousel without uploading a CSV/JSON file.
2. Select both large portrait and landscape Media Library images; verify the display dimensions and unchanged originals.
3. Save with three populated rows, lower the count to two, save/reload, then restore three.
4. Test previews, published Figure blocks, scene/modal use, and both standalone HTML variants.
5. Check play/pause, keyboard navigation, reduced motion, mobile sizing, and multiple instances.
6. Open, preview, save, and reload existing Timeseries, Bar, and Tabulator figures.

Compiled block assets were not manually edited or built. An already-running process appeared to regenerate Insert Figure build files during source edits. Follow the normal project build workflow if compiled assets need updating.

## Rollback reference

The working tree was clean at the start, at commit `ad21977fb652bef9196c2c73537be036aa1712ed`.
A pre-change archive of tracked files is at `/private/tmp/graphic-data-before-carousel.tar`.
No commits or database changes were made by this implementation. Review subsequent edits before reverting source files; do not overwrite unrelated work or generated assets indiscriminately.
