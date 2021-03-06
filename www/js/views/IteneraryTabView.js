var IteneraryTabView = Backbone.View.extend({

  tagName : "li",
  className: "nav-item",
  template : _.template($('#itenerary_tab').html()),
  events: {
    'click': 'highlightPolyline'
  },
  initialize: function (options) {
    this.childViews = [];
    this.familyViews = [];
  },
  render: function() {
    this.childViews.forEach(function(child,i){
        if(child.model.get("polyline")){
          console.log("event registered");
          google.maps.event.addListener(child.model.get("polyline"), 'click', function(h) {
            this.highlightPolyline();
          }.bind(this));
          google.maps.event.addListener(child.model.get("marker"), 'click', function(h) {
            this.highlightPolyline();
          }.bind(this));
        }
    }.bind(this));

    this.$el.html( this.template( this.model.attributes ) );
    return this;
  },
  highlightPolyline: function(){
    this.familyViews.forEach(function(children,i){

        $(".tab-"+ children.model.get("tabId")).removeClass("show active");
        children.childViews.forEach(function(child){
          if(child.model.get("polyline")){
            child.model.get("polyline").setVisible(false);
            child.model.get("marker").setVisible(false);
            child.model.get("polyline").setOptions({strokeWeight: 5});
          }
        });

    });
    var bounds = new google.maps.LatLngBounds();

    $(".tab-"+ this.model.get("tabId")).addClass("show active");

    this.childViews.forEach(function(child,i){

      if(child.model.get("polyline")){
        child.model.get("polyline").setVisible(true);
        child.model.get("marker").setVisible(true);
        bounds.extend(child.model.get("marker").getPosition());
      }
    });
    map.fitBounds(bounds);
  },

  close: function(){
    this.remove();
    this.unbind();
  }
});
