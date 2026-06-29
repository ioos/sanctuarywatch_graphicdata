( function ( wp, data ) {
	'use strict';

	if ( ! wp || ! wp.media || ! wp.media.view ) {
		return;
	}

	let InstanceFilter = wp.media.view.AttachmentFilters.extend( {
		id: 'graphic-data-instance-filter',

		createFilters () {
			let filters = {
				all: {
					text: 'All media',
					props: { graphic_data_instance_id: 'all' },
					priority: 5,
				},
				available: {
					text: 'Available Instances',
					props: { graphic_data_instance_id: 'available' },
					priority: 10,
				},
				noInstance: {
					text: 'No Instance',
					props: { graphic_data_instance_id: 'none' },
					priority: 15,
				},
			};

			_.each( data.instances, function ( instance ) {
				filters[ 'instance_' + instance.id ] = {
					text: instance.title,
					props: { graphic_data_instance_id: instance.id },
				};
			} );

			this.filters = filters;
		},
	} );

	var OriginalBrowser = wp.media.view.AttachmentsBrowser;
	wp.media.view.AttachmentsBrowser = OriginalBrowser.extend( {
		createToolbar () {
			OriginalBrowser.prototype.createToolbar.apply( this, arguments );
			this.toolbar.set(
				'graphicDataInstanceFilter',
				new InstanceFilter( {
					controller: this.controller,
					model: this.collection.props,
					priority: -75,
				} ).render()
			);
		},
	} );
} )( wp, graphicDataMediaFilter );
