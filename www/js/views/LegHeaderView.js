var LegHeaderView = Backbone.View.extend({

  legHeaderTemplate : _.template($('#itenerary_header').html()),

  events: {
    "click .start_monitor": "startMonitor",
    "click .stop_monitor" : "stopMonitor"
  },

  render : function(){
    console.log("render start");
    console.dir(this.model.attributes);
    this.$el.html(this.legHeaderTemplate(this.model.attributes));

    console.log("render end");
    return this;
  },
  startMonitor: function(){
    this.monitorView = new MonitorView({model: this.model});
    this.monitorView.legViews = this.siblingViews;
    $("#monitor").html(this.monitorView.render().el);
    $("#tab_duration").hide();
    $(".start_monitor").css("display","none");
    $(".stop_monitor").css("display","initial");
    $("#monitor").show();
  },
  stopMonitor: function(){

    this.monitorView.close();

  },
  close: function(){

    this.remove();
    this.unbind();
    if(this.monitorView){
      this.stopMonitor();
    }

  }

});
