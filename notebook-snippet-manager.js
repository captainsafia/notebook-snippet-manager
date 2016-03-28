define(['base/js/namespace', 'jquery', 'base/js/dialog'], function(Jupyter, $, dialog) {
    function storageAvailable(type) {
        try {
            var storage = window[type];
            var x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        } catch (e) {
            return false;
        }
    }

    function add_cell_to_snippet_manager() {
        var selected_cell = Jupyter.notebook.get_selected_cell();
        var selected_content = selected_cell.get_text();

        var modal_content = $('<p/>').html("Please provide a name for this snippet.");
        modal_content.append($('<br><br>'));
        modal_content.append($('<input type="text" name="snippet-name"/>'));

        Jupyter.keyboard_manager.register_events(modal_content);

        dialog.modal({
            title: 'Add Code Cell to Snippet Manager',
            body: modal_content,
            buttons: {
                Cancel: {
                    'class': 'btn-danger'
                },
                OK: {
                    'class': 'btn-primary',
                    'click': function() {
                        console.log('Adding to snippet manager...');
                    }
                }
            }
        });
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
        if (storageAvailable('localStorage')) {
            place_snippet_manager_buttons();
        } else {
            var modal_text = "It looks like you have the snippet-manager";
            modal_text += " enabled but your browser doesn't support WebStorage.";
            modal_text += " Please switch to a browser with WebStorage to use snippet-manager.";
            var modal_content = $('<p/>').html(modal_text);
            dialog.modal({
                'title': 'WebStorage Unavaialble',
                'body': modal_content,
                'buttons': {OK: {}}
            });
        }
    }

    return {
        load_ipython_extension: load_ipython_extension
    };
});
