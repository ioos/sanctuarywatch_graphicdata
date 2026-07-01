(function() {
    tinymce.create('tinymce.plugins.wpdatatables', {
        /**
         * Initializes the plugin, this will be executed after the plugin has been created.
         * This call is done before the editor instance has finished it's initialization so use the onInit event
         * of the editor instance to intercept that event.
         *
         * @param {tinymce.Editor} ed Editor instance that the plugin is initialized in.
         * @param {string} url Absolute URL to where the plugin is located.
         */
        init : function(ed, url) {
             ed.addButton('wpdatatable', {
                title : 'Insert a wpDataTable',
                cmd : 'wpdatatable'
            });
            ed.addButton('wpdatachart', {
                title : 'Insert a wpDataChart',
                cmd : 'wpdatachart'
            });


            ed.addCommand( 'wpdatatable', function(){
                jQuery.ajax({
                    url: ajaxurl,
                    dataType: 'json',
                    data: {
                        action: 'wpdatatable_list_all_tables'
                    },
                    success: function( tables ){
                        
                        var selectboxValues = [];
                        
                        for( var i in tables ){
                            selectboxValues.push({ value: tables[i].id, text: tables[i].title+' (id: '+tables[i].id+')' })
                        }
                        
                        ed.windowManager.open({
                            title: 'wpDataTable',
                            body: [
                                {
                                    type: 'listbox', 
                                    name: 'wpdatatable_select', 
                                    label: 'wpDataTable',
                                    values: selectboxValues
                                },
                                {
                                    type: 'listbox',
                                    name: 'table_view_select',
                                    label: 'Table view',
                                    values: [
                                        {value: 'regular', text: 'Regular wpDataTable'},
                                        
                                    ]
                                }
                            ],
                            width: 700,
                            height: 100,
                            onsubmit: function(e){
                                ed.focus();
                                ed.execCommand( 'mceInsertContent', 0, '[wpdatatable id='+e.data.wpdatatable_select+' table_view='+ e.data.table_view_select+']' )
                            }
                        });
                    }
                });
            });

            ed.addCommand( 'wpdatachart', function(){
                jQuery.ajax({
                    url: ajaxurl,
                    dataType: 'json',
                    data: {
                        action: 'wpdatatable_list_all_charts'
                    },
                    success: function( charts ){

                        var selectboxValues = [];

                        for( var i in charts ){
                            selectboxValues.push({ value: charts[i].id, text: charts[i].title+' (id: '+charts[i].id+')' })
                        }

                        ed.windowManager.open({
                            title: 'wpDataChart',
                            body: [
                                {
                                    type: 'listbox',
                                    name: 'wpdatachart_select',
                                    label: 'wpDataChart',
                                    values: selectboxValues
                                }
                            ],
                            onsubmit: function(e){
                                ed.focus();
                                ed.execCommand( 'mceInsertContent', 0, '[wpdatachart id='+e.data.wpdatachart_select+']' )
                            }
                        });
                    }
                });
            });
            
        },
 
        /**
         * Creates control instances based in the incomming name. This method is normally not
         * needed since the addButton method of the tinymce.Editor class is a more easy way of adding buttons
         * but you sometimes need to create more complex controls like listboxes, split buttons etc then this
         * method can be used to create those.
         *
         * @param {String} n Name of the control to create.
         * @param {tinymce.ControlManager} cm Control manager to use inorder to create new control.
         * @return {tinymce.ui.Control} New control instance or null if no control was created.
         */
        createControl : function(n, cm) {
            return null;
        },
 
        /**
         * Returns information about the plugin as a name/value array.
         * The current keys are longname, author, authorurl, infourl and version.
         *
         * @return {Object} Name/value array containing information about the plugin.
         */
        getInfo : function() {
            return {
                longname : 'wpdatatables',
                author : 'touchmesoft',
                authorurl : 'https://touchmesoft.net',
                infourl : 'https://wpdatatables.com',
                version : "1.6.2"
            };
        }
    });
 
    // Register plugin
    tinymce.PluginManager.add( 'wpdatatables', tinymce.plugins.wpdatatables );
})();