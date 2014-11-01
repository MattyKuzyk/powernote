$(document).ready(function() {

  var app = $.sammy('.nav', function() {
    this.get('#/', function(context) {
      this.load('data/notebooks.json')
        .then(function(items) {
            $.each(items, function(i, item) {
              context.render('templates/item.template', {item: item})
               .appendTo(context.$element());
      });
        });
    });
  });

  app.run('#/');

});  
