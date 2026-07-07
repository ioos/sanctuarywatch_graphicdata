const path = require('path');
const defaultConfig = require('@wordpress/scripts/config/webpack.config');

module.exports = {
	...defaultConfig,

	resolve: {
		...defaultConfig.resolve,

		alias: {
			...(defaultConfig.resolve?.alias || {}),

			'@graphic-data/plotly-timeseries-line': path.resolve(
				__dirname,
				'includes/figures/js/interactive/plotly-timeseries-line.js'
			),

			'@graphic-data/figure-render': path.resolve(
				__dirname,
				'includes/figures/js/figure-render.js'
			),

			'@graphic-data/modal-render': path.resolve(
				__dirname,
				'includes/modals/js/modal-render.js'
			),

			'@graphic-data/plotly-bar': path.resolve(
				__dirname,
				'includes/figures/js/interactive/plotly-bar.js'
			),

			'@graphic-data/plotly-map': path.resolve(
				__dirname,
				'includes/figures/js/interactive/plotly-map.js'
			),

			'@graphic-data/plotly-utility': path.resolve(
				__dirname,
				'includes/figures/js/interactive/plotly-utility.js'
			),
		},
	},
};