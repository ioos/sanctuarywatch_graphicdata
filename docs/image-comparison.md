# Image Comparison Slider

Select **Interactive → Image Comparison Slider**. No CSV/JSON upload is required.

Choose **1–16 comparisons**. Each row has Left image and Right image sections, each with a Media Library picker, optional plain-text label, Top/Center/Bottom text position, and alt text. Captions default to Center. The first image's caption is always anchored and aligned left; the second's is always anchored and aligned right. Captions have a black background and white text.

Reducing the count hides rows while preserving their selections and settings across saves. Only active comparisons enter the rendered specification. Both images of each active pair must be selected; the same image may be used on both sides.

The admin explains **coregistration**: matching features should align because the images show the same area or subject at the same scale, orientation, and alignment. Matching aspect ratios and crops are recommended. The tool does not automatically register images. Images preserve their proportions in a shared viewing area using the first image's aspect ratio.

Media Library selections reuse the carousel's authenticated display-copy endpoint, with a maximum longest edge of 2,048 pixels, responsive sources, and unchanged originals. Later comparisons use lazy-loaded images.

The frontend uses a native range input plus a draggable divider. Keyboard users can focus the range and use standard range keys. Each comparison has its own divider state. There are no playback settings and no external slider-library dependency. Inline styles move with the figure into editor iframes. A fixed Figure block height applies to each comparison's viewing area.

## Source

Paths relative to `plugins/graphic_data_plugin`:

- `includes/figures/js/interactive/image-comparison.js`: specification, validation, renderer, shared dispatch glue.
- `includes/figures/js/interactive/image-comparison-settings.js`: paired settings rows and coregistration guidance.
- `includes/figures/js/interactive/image-figure-settings.js`: shared carousel/comparison field styling and Media Library controls.
- Existing `file-upload.js`, `figure-render.js`, and `admin-preview-buttons.js`: type selection, rendering, publish guards and standalone export.

Editable values use `ComparisonCount` and `Comparison{n}{Left|Right}{suffix}` within `figure_interactive_arguments`. Rendered values use `{type:"image-comparison", version:1, comparisons:[{left,right}]}` in `figure_interactive_args_rendered`. Comparison and carousel hidden settings are preserved; this does not change the previously discussed retention behavior of chart/table settings.

## Validation

From wp-content with the plugin's development dependencies:

```sh
node --experimental-vm-modules tests/carousel/carousel.test.cjs
node --experimental-vm-modules tests/comparison/comparison.test.cjs
```

Tests cover pair validation, captions, range/pointer updates, bounds, independent pairs, iframe movement, hidden-row restoration, no-file setup, type switching, active specifications, error clearing, and standalone export escaping. These are isolated DOM tests, not live WordPress or visual browser tests.

Manual checks still needed: select actual Media Library images, preview/save/reload, drag on desktop and touch devices, keyboard range controls, published blocks, modal/scene contexts, and standalone HTML. Source changes only; compiled assets follow the existing build workflow.

A pre-comparison snapshot of the current source (including the uncommitted carousel work) is stored at `/private/tmp/graphic-data-before-comparison.tar`.
