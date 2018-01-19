define(['base/js/namespace',
  'jquery',
  'base/js/dialog',
  './list'
], function(Jupyter, $, dialog, list) {
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

  function add_snippet_to_storage(snippet_name, snippet_content) {
    var storage = window['localStorage'];
    var stored_snippets = storage.getItem('JupyterNotebookSnippets');
    if (stored_snippets == null) {
      stored_snippets = {};
    } else {
      stored_snippets = JSON.parse(stored_snippets);
    }
    stored_snippets[snippet_name] = snippet_content;
    var updated_snippets = JSON.stringify(stored_snippets);
    storage.setItem('JupyterNotebookSnippets', updated_snippets);
  }

  function remove_snippet_from_storage(snippet_name) {
    var storage = window['localStorage'];
    var stored_snippets = storage.getItem('JupyterNotebookSnippets');
    if (sotred_snippets == null) {
      return;
    } else {
      stored_snippets = JSON.parse(stored_snippets);
    }
    delete stored_snippets[snippet_name];
    var updated_snippets = JSON.stringify(stored_snippets);
    storage.setItem('JupyterNotebookSnippets', updated_snippets);
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
            var snippet_name = $('input[name=snippet-name]').val();
            add_snippet_to_storage(snippet_name, selected_content);
          }
        }
      }
    });
  }

  function get_snippets() {
    var storage = window['localStorage'];
    var stored_snippets = storage.getItem('JupyterNotebookSnippets');
    if (stored_snippets == null) {
      return {};
    } else {
      return JSON.parse(stored_snippets);
    }
  }

  function add_cell_from_snippet_manager() {
    var selected_index = Jupyter.notebook.get_selected_index();

    var modal_content = $('<p/>').html('Select a snippet to insert.');
    modal_content.append('<br><br>');
    var list_content = $('<div id="snippets" style="white-space: pre-wrap;">');
    var table = $('<table class="table"><tbody class="list"></tbody></table>');
    var table_children = table.children();
    table_children.append('<tr><th>Selected</th>' +
      '<th>Snippet Name</th>' +
      '<th>Snippet Content</th></tr>');

    var snippets = get_snippets();
    for (var index in snippets) {
      var snippet = snippets[index];
      table_children.append('<tr><td class="selected"><input type="checkbox"/></td>' +
        '<td class="name">' + index + '</td>' +
        '<td class="content">' + snippet + '</td></tr>');
    }

    list_content.append(table);
    modal_content.append(list_content);

    Jupyter.keyboard_manager.register_events(modal_content);

    dialog.modal({
      title: 'Select A Snippet to Include',
      body: modal_content,
      buttons: {
        'Insert Snippet': {
          'class': 'btn-primary',
          'click': function() {
            var selected_snippets = $('.selected input:checked');
            var selected_content = selected_snippets.map(function() {
              var content = $(this).parent('td').parent('tr').children('.content');
              return $(content.get(0)).text();
            });
            for (var index in selected_content) {
              var code_cell = Jupyter.notebook.insert_cell_at_index('code', selected_index + index);
              code_cell.set_text(selected_content[index]);
              code_cell.execute();
            }
          }
        },
        'Delete Snippet': {
          'class': 'btn-danger',
          'click': function() {
            var selected_snippets = $('.selected input:checked');
            var selected_names = selected_snippets.map(function() {
              var name = $(this).parent('td').parent('tr').children('.name');
              return $(name.get(0)).text();
            });
            for (var index in selected_names) {
              remove_snippet_from_manager(selected_names[index]);
            }
          }
        }
      }
    });

  }

  function place_snippet_manager_buttons() {
    if (!Jupyter.toolbar) {
      $([Jupyter.events]).on("app_initialized.NotebookApp", place_snippet_manager_buttons);
      return;
    }

    if ($(".snippet-manager-buttons").length === 0) {
      Jupyter.toolbar.add_buttons_group([{
          'label': 'Record Snippet',
          'icon': 'fa-arrow-circle-up',
          'callback': add_cell_to_snippet_manager,
          'id': 'add-cell-to-snippet-manager',
          'class': 'snippet-manager-buttons'
        },
        {
          'label': 'Insert Snippet',
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
        'buttons': {
          OK: {}
        }
      });
    }
  }

  return {
    load_ipython_extension: load_ipython_extension
  };
});
