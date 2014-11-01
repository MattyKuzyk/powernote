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
