import apiFetch from '@wordpress/api-fetch';
import {
	render_interactive_plots,
	render_tab_info,
} from '@graphic-data/figure-render';

function formatFigureMeta(meta = {}, figureId) {
	return {
		code: meta.figure_code || '',
		figure_iframe_code: meta.figure_iframe_code || '',
		dataLink: meta.figure_data_link_url || '',
		dataText: meta.figure_data_link_text || '',
		externalAlt: meta.figure_external_alt || '',
		figureTitle: meta.figure_title || '',
		figureType: meta.figure_path || '',
		figure_interactive_arguments:
			typeof meta.figure_interactive_arguments === 'string'
				? meta.figure_interactive_arguments
				: JSON.stringify(meta.figure_interactive_arguments || []),
		figure_interactive_args_rendered:
			meta.figure_interactive_args_rendered || '',
		figure_published: meta.figure_published || '',
		imageLink:
			meta.figure_path === 'External'
				? meta.figure_external_url || ''
				: meta.figure_image || '',
		longCaption: meta.figure_caption_long || '',
		postID: Number(figureId || meta.id || meta.postID || 0),
		scienceLink: meta.figure_science_link_url || '',
		scienceText: meta.figure_science_link_text || '',
		shortCaption: meta.figure_caption_short || '',
	};
}

function scrollToFigureHash(block, figureId) {
	if (window.location.hash !== `#figure-${figureId}`) {
		return;
	}

	window.requestAnimationFrame(() => {
		block.scrollIntoView({ block: 'start' });
	});
}

async function renderFigureBlock(block) {
	if (block.dataset.rendering === 'true' || block.dataset.rendered === 'true') {
		return;
	}

	const figureId = Number(block.dataset.figureId || 0);
	const figureHeight = Math.max(Number(block.dataset.figureHeight || 0), 0);

	if (!figureId) {
		return;
	}

	block.dataset.rendering = 'true';

	try {
		const meta = await apiFetch({
			path: `/graphic-data/v1/figure/${figureId}`,
			method: 'GET',
		});
		const infoObj = formatFigureMeta(meta, figureId);
		const targetId = block.dataset.targetId;
		const targetDiv = targetId
			? block.querySelector(`#${CSS.escape(targetId)}`)
			: block.querySelector('.graphic-data-block-plotly-target');

		if (!targetDiv) {
			throw new Error(`Missing frontend target for figure ${figureId}.`);
		}

		targetDiv.innerHTML = '';

		const interactiveTargetId = await render_tab_info(
			targetDiv,
			block,
			infoObj,
			0,
			true,
			null,
			null,
			1
		);

		const figureContainer = targetDiv.querySelector('.figure');

		await render_interactive_plots(
			figureContainer,
			infoObj,
			document,
			interactiveTargetId
		);

		await new Promise((resolve) => {
			window.requestAnimationFrame(() => {
				window.requestAnimationFrame(resolve);
			});
		});

		const plotDiv = targetDiv.querySelector('.js-plotly-plot');
		const figureMedia = targetDiv.querySelector('.figure > img, .figure > video');

		if (figureMedia && figureHeight > 0) {
			figureMedia.style.height = `${figureHeight}px`;
			figureMedia.style.objectFit = 'contain';
		}

		if (plotDiv && window.Plotly?.Plots?.resize) {
			window.Plotly.Plots.resize(plotDiv);
		}

		if (plotDiv && window.Plotly?.relayout) {
			const layout = {
				autosize: figureHeight === 0,
				width: targetDiv.clientWidth,
				paper_bgcolor: 'rgba(0, 0, 0, 0)',
				plot_bgcolor: 'rgba(0, 0, 0, 0)',
			};

			if (figureHeight > 0) {
				layout.height = figureHeight;
			}

			await window.Plotly.relayout(plotDiv, layout);
		}

		plotDiv?.querySelectorAll('.modebar-group').forEach((group) => {
			group.style.setProperty('background-color', 'transparent', 'important');
		});
		plotDiv?.querySelectorAll('.modebar-btn .icon path').forEach((path) => {
			path.style.setProperty('fill', 'rgba(68, 68, 68, 0.7)', 'important');
		});

		if (typeof ResizeObserver !== 'undefined') {
			let previousWidth = block.clientWidth;
			const resizeObserver = new ResizeObserver(() => {
				const nextWidth = block.clientWidth;
				if (!nextWidth || nextWidth === previousWidth) return;
				previousWidth = nextWidth;

				const currentPlot = targetDiv.querySelector('.js-plotly-plot');
				if (!currentPlot || !window.Plotly) return;

				window.Plotly.Plots?.resize?.(currentPlot);
				window.Plotly.relayout?.(currentPlot, {
					autosize: figureHeight === 0,
					width: targetDiv.clientWidth,
					paper_bgcolor: 'rgba(0, 0, 0, 0)',
					plot_bgcolor: 'rgba(0, 0, 0, 0)',
					...(figureHeight > 0 ? { height: figureHeight } : {}),
				});
			});

			resizeObserver.observe(block);
		}

		block.dataset.rendered = 'true';
		scrollToFigureHash(block, figureId);
	} finally {
		delete block.dataset.rendering;
	}
}

function renderGraphicDataInsertFigures() {
	const figureBlocks = document.querySelectorAll(
		'.graphic-data-frontend-figure[data-figure-id]'
	);

	figureBlocks.forEach((block) => {
		renderFigureBlock(block).catch((error) => {
			const figureId = block.dataset.figureId || '';

			console.error('Frontend figure render failed:', error);

			block.innerHTML = `
				<div class="graphic-data-figure-error">
					Failed to render figure ${figureId}.
				</div>
			`;
		});
	});
}

if (document.readyState === 'loading') {
	document.addEventListener(
		'DOMContentLoaded',
		renderGraphicDataInsertFigures,
		{ once: true }
	);
} else {
	renderGraphicDataInsertFigures();
}
