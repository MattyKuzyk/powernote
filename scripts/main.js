var insert = function(data) {
  var sel, range, html, content;
  var p = $(data);

  if(p.length == 0) {
    var content = document.createTextNode(data);
  }

  if (window.getSelection) {
      sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
          range = sel.getRangeAt(0);
          range.deleteContents();
          if(content) {
            range.insertNode(content);
          } else {
            for(var i=0; i<p.length; i++) {
              range.insertNode(p[i])
            }
          }
      }
  } else if (document.selection && document.selection.createRange) {
      document.selection.createRange().text = data;
  }
}


$("#btn").on('click', function() {

});

$(document).ready(function() {

  var app = $.sammy('.nav', function() {
    this.use('Template');

    this.around(function(callback) {
        var context = this;
        this.load('data/notebooks.json')
            .then(function(notebooks) {
              context.notebooks = notebooks;
            })
            .then(callback);
    });

    this.get('#/', function(context) {
      $.each(context.notebooks, function(i, notebook) {
        context.render('templates/notebook-title.template', {notebook: notebook})
         .appendTo(context.$element('.sections'));
      });
    });

    this.get('#/notebooks/:id', function(context) {
      // context.$element('.pages').not(':first').remove();

      $.each(context.notebooks, function(i, notebook) {

        if (notebook['id'] === context.params['id']) {
          context.current_notebook = notebook;
          return false;
        }

      });

      if (!context.current_notebook) { return context.notFound(); }

      this.load('data/notes.json')
        .then(function(notes) {
            $.each(context.current_notebook['page_ids'], function(i, note_id) {

              $.each(notes, function(i, note) {
                if (note.id === note_id) {
                context.render('templates/notes-title.template', {note: note})
               .appendTo(context.$element('.pages'));
                context.log(note.title, '-', note.artist);
                }
            });
          });
        });


    });

  });

  app.run('#/');

});
