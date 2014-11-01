$(document).ready(function() {

  var app = $.sammy('.nav', function() {
    this.get('#/', function(context) {
      $.ajax({
        url: 'data/notebooks.json',
        dataType: 'json',
        crossDomain: true,
        success: function(notebooks) {
          $.each(notebooks, function(i, notebook) {
            context.log(notebook.title, '-', notebook.description);
          });
        }
      });
    });
  });

  app.run('#/');

});  
