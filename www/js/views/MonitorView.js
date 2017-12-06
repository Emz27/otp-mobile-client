var MonitorView = Backbone.View.extend({

  className :"col p-3",

  monitorTemplate: _.template($('#monitor_template').html()),

  render: function () {
    this.$el.html(this.monitorTemplate(this.model.attributes));
    return this;
  }
});
