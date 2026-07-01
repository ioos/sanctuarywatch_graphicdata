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

			'@graphic-data/plotly-utility': path.resolve(
				__dirname,
				'includes/figures/js/interactive/plotly-utility.js'
			),
		},
	},
};