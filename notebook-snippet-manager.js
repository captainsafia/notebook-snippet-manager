define(['base/js/namespace', 'jquery'], function(Jupyter, $) {
    function add_cell_to_snippet_manager() {
    }

    function add_cell_from_snippet_manager() {
    }

    function place_snippet_manager_buttons() {
        if (!Jupyter.toolbar) {
             $([Jupyter.events]).on("app_initialized.NotebookApp", place_snippet_manager_buttons);
             return;
        }

        if ($(".snippet-manager-buttons").length === 0) {
            Jupyter.toolbar.add_buttons_group([
                {
                    'label': 'Add Cell to Snippet Manager',
                    'icon': 'fa-arrow-circle-up',
                    'callback': add_cell_to_snippet_manager,
                    'id': 'add-cell-to-snippet-manager',
                    'class': 'snippet-manager-buttons'
                },
                {
                    'label': 'Add Cell from Snippet Manager',
                    'icon': 'fa-arrow-circle-down',
                    'callback': add_cell_from_snippet_manager,
                    'id': 'add-cell-from-snippet-manager',
                    'class': 'snippet-manager-buttons'
                }
            ]);
        }
    }

    function load_ipython_extension() {
        console.log("Loading notebook-snippet-manager extension...");
        place_snippet_manager_buttons();
    }

    return {
        load_ipython_extension: load_ipython_extension
    };
});
