var LegHeaderView = Backbone.View.extend({

  legHeaderTemplate : _.template($('#itenerary_header').html()),

  render : function(){
    console.log("render start");
    console.dir(this.model.attributes);
    this.$el.html(this.legHeaderTemplate(this.model.attributes));

    console.log("render end");
    return this;
  },
  close: function(){

    this.remove();
    this.unbind();
  }

});
