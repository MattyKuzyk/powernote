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
    this.get('#/', function(context) {
      this.load('data/notebooks.json')
        .then(function(items) {
            $.each(items, function(i, item) {
              context.render('templates/notebook-title.template', {item: item})
               .appendTo(context.$element('.sections'));
      });
        });
    });
  });

  app.run('#/');

});
