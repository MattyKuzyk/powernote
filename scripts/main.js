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
              if (context.$element('.sections').children().not(':first').length == 0) {
                renderNotebooks(context);
              }
            })
            .then(callback);
    });

    this.get('#/', function(context) {
    });

    this.get('#/notebooks/:id', function(context) {
      context.$element('.pages').children().not(':first').remove();

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
    var that = this;
    $(".sections").on('click', '.notebook', function(e) {

      $.each($('.sections').children().not(':first'), function(i, section) {
        $(section).removeClass('active');
      });
      $(this).addClass('active');
      document.location.hash = '#/notebooks/' + $(this).attr('notebook_id');
      // that.redirect('#/notebooks/' + $(this).attr('notebook_id'));
    });


  });

  app.run('#/');


  var options = {
    editor: document.getElementById('editor'),
    class: 'editor',
    debug: false,
    textarea: '<textarea id="editor" class="editor"></textarea>',
    list: ['bold', 'italic', 'underline', 'h1', 'h2', 'h3', 'insertorderedlist', 'createlink'],
    stay: false
  }


  $("#itable").on('click', function() {
    localStorage = null;
    makeTable(6,6);
  })

  $("#icamera").on('click', function() {
    camera();
  })

  $("#icode").on('click', function() {
    makeCode();
    $('.codeblock').codeblock();
  })

$('.codeblock').codeblock();
  // var pen = new Pen(options);

});

function renderNotebooks(context) {
  context.$element('.sections').children().not(':first').remove();

  $.each(context.notebooks, function(i, notebook) {
    context.render('templates/notebook-title.template', {notebook: notebook})
     .appendTo(context.$element('.sections'));
  });
}


function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

var makeTable = function(w, h) {
  var id = makeid() + "_" ;
  id="";
  var table = "<div class='spreadsheet'><table>\n";
  for (var i = 0; i < h; i++) {
    table += "\t<tr>\n";
    for (var j = 0; j < w; j++) {
      var letter = String.fromCharCode("A".charCodeAt(0) + j - 1);
      table += "\t\t<td>\n"
      table += (i && j) ? "<input id='" + id + letter + i + "'/>" : i || letter;
      table += "\t\t</td>\n"
    }
    table += "\t</tr>\n";
  }
  table += "</table></div>\n";


  insert(table);

  var DATA = {};
  var INPUTS = [].slice.call(document.querySelectorAll("input"));

  INPUTS.forEach(function(elm) {
    elm.onfocus = function(e) {
      e.target.value = localStorage[e.target.id] || "";
    };
    elm.onblur = function(e) {
      localStorage[e.target.id] = e.target.value;
      computeAll();
    };
    var getter = function() {
      var value = localStorage[elm.id] || "";
      if (value.charAt(0) == "=") {
        with(DATA) return eval(value.substring(1));
      } else {
        return isNaN(parseFloat(value)) ? value : parseFloat(value);
      }
    };
    Object.defineProperty(DATA, elm.id, {
      get: getter
    });
    Object.defineProperty(DATA, elm.id.toLowerCase(), {
      get: getter
    });
  });

  (window.computeAll = function() {
    INPUTS.forEach(function(elm) {
      try {
        elm.value = DATA[elm.id];
      } catch (e) {}
    });
  })();

}



var makeCode = function() {
  var html = '<div class="code"><div class="codeblock">var x = 10;';
  html += "\nvar y = -101;\n";
  html += "\nconsole.log(\"Success\", x+y);\n";
  html += "</div></div>"

  insert(html);
}