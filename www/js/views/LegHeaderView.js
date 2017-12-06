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
    $("#monitor").html(this.monitorView.render().el);
    $("#tab_duration").hide();
    $(".start_monitor").css("display","none");
    $(".stop_monitor").css("display","initial");
    $("#monitor").show();
  },
  stopMonitor: function(){
    $("#tab_duration").show();
    $(".stop_monitor").css("display","none");
    $(".start_monitor").css("display","initial");
    $("#monitor").hide();
    this.monitorView.remove();
    this.monitorView.unbind();

  },
  close: function(){

    this.remove();
    this.unbind();
  }

});
