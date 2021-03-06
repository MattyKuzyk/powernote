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

  var x2js = new X2JS();

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

  $('.bing-search').on('keypress', function(e) {
    // Enter key
    if (e.charCode === 13) {
      searchBing(this);
    }
  });

  $('#bing').click(function() {
    $('.bing-modal').toggle();
  });

  $("#icode").on('click', function() {
    makeCode();
    $('.codeblock').codeblock();
  });

  $("#linsert").on('click', function() {
    insert(katex.renderToString($('#demo-input').text()))
  });

  $("#ilatex").on('click', function() {    
    $('.latex').toggle();
  })

$('.codeblock').codeblock();

$('article').penplate();

  var myDropzone = new Dropzone("#editor",{url : "http://powernote.cloudapp.net/drop.php", clickable: false});
  myDropzone.on("complete", function(file) {
    insert("<img src='http://powernote.cloudapp.net/uploads/" + file.name + "'>");
  });

});

function searchBing(element) {

  $.ajax({
    url: "http://powernote.cloudapp.net/bing.php?q=" + encodeURIComponent($(element).val())
  }).done(function(data) {
    $('.bing-modal').children().not(':first').remove()
    var images = $.parseJSON(data)['d']['results'].slice(0, 4);
    $.each(images, function(i, image) {
      $('.bing-modal').append($("<img/>").attr('src', image['Thumbnail']['MediaUrl']).css('width', '40%').addClass('bing-image'));
      debugger
    });
  })
  .fail(function() {
    alert("error");
  });
}

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


var save = function() {
  var txt = JSON.stringify($('article').html());
  var data = '';

  console.log(txt)
var req = $.ajax({
  type: 'PUT',
  url: 'https://powernote.firebaseio.com/note.json',
  data: txt,
  async:false
});

  console.log(req.responseText)
  return req;
}

var load = function() {
  var req = $.ajax({
    type: 'GET',
    url: 'https://powernote.firebaseio.com/note.json',
    async:false
  });

  $('article').html(JSON.parse(req.responseText))
  return req;
}
