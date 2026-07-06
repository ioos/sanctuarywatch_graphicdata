import { producePlotlyLineFigure } from '@graphic-data/plotly-timeseries-line';
import { producePlotlyBarFigure } from '@graphic-data/plotly-bar';

function normalizeInteractiveArguments(value) {
	if (!value) {
		return '';
	}

	if (typeof value === 'string') {
		return value;
	}

	return JSON.stringify(value);
}

function readInteractiveArguments(block) {
	const dataElement = block.querySelector(
		'.graphic-data-interactive-arguments'
	);

	if (!dataElement) {
		return '';
	}

	const rawValue = dataElement.textContent.trim();

	if (!rawValue) {
		return '';
	}

	try {
		return normalizeInteractiveArguments(JSON.parse(rawValue));
	} catch (error) {
		// If the script tag already contains the raw argument string, use it.
		return rawValue;
	}
}

function findTargetInBlock(block, targetFigureElement) {
	return Array.from(
		block.querySelectorAll('.graphic-data-block-plotly-target')
	).find((element) => element.id === targetFigureElement);
}

async function renderFigureBlock(block) {
	const figureId = Number(block.dataset.figureId || 0);

	if (!figureId) {
		return;
	}

	const targetFigureElement =
		block.dataset.targetId || `targetFigureElement_${figureId}`;

	const interactiveArguments = readInteractiveArguments(block);
	
	const rawArgs = interactiveArguments;

	const parsedArgs =
		typeof rawArgs === 'string'
			? JSON.parse(rawArgs)
			: rawArgs;

	const graphType = Array.isArray(parsedArgs)
		? Object.fromEntries(parsedArgs).graphType
		: parsedArgs?.graphType;

	console.log('graphType', graphType);

	if (!interactiveArguments) {
		throw new Error(
			`Missing figure_interactive_arguments for figure ${figureId}.`
		);
	}

	let targetDiv = findTargetInBlock(block, targetFigureElement);

	if (!targetDiv) {
		targetDiv = document.createElement('div');
		targetDiv.id = targetFigureElement;
		targetDiv.className =
			'targetFigureElement graphic-data-block-plotly-target';
		targetDiv.dataset.figureId = String(figureId);
		targetDiv.style.width = '100%';
		targetDiv.style.maxWidth = '100%';
		block.appendChild(targetDiv);
	}

	if (window.Plotly?.purge) {
		try {
			window.Plotly.purge(targetDiv);
		} catch (error) {
			// Ignore purge errors. The target may not have an existing Plotly plot yet.
		}
	}

	targetDiv.innerHTML = '';

	if (graphType === 'Plotly line graph (time series)') {
		await Promise.resolve(
			producePlotlyLineFigure(
				targetFigureElement,
				interactiveArguments,
				figureId,
				document
			)
		);
	}
	if (graphType === 'Plotly bar graph') {
		await Promise.resolve(
			producePlotlyBarFigure(
				targetFigureElement,
				interactiveArguments,
				figureId,
				document
			)
		);
	}

	const plotDiv = document.getElementById(`plotlyFigure${figureId}`);

	if (plotDiv && window.Plotly?.Plots?.resize) {
		plotDiv.style.width = '100%';
		plotDiv.style.maxWidth = '100%';
		window.Plotly.Plots.resize(plotDiv);
	}
}

function renderGraphicDataInsertFigures() {
	const figureBlocks = document.querySelectorAll(
		'.graphic-data-frontend-figure[data-figure-id]'
	);

	figureBlocks.forEach((block) => {
		renderFigureBlock(block).catch((error) => {
			const figureId = block.dataset.figureId || '';

			console.error('Frontend Plotly render failed:', error);

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
		renderGraphicDataInsertFigures
	);
} else {
	renderGraphicDataInsertFigures();
}
