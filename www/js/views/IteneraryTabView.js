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
    // this.familyViews.push("hello");
    // console.log(this.familyViews);
  },

  render: function() {
    // console.log("IteneraryTabView render started");

    this.$el.html( this.template( this.model.attributes ) );
    // console.log(this.model.get("duration"));

    // console.log("IteneraryTabView render ended");
    return this;
  },
  highlightPolyline: function(){



    // console.dir(this.familyViews);
    this.familyViews.forEach(function(children,i){
      // console.log(i);
        $(".tab-"+ children.model.get("tabId")).removeClass("show active");
        // console.log("#tab-"+ children.model.get("tabId"));

        children.childViews.forEach(function(child){
          if(child.model.get("polyline")){
            child.model.get("polyline").setOptions({strokeOpacity: 0});
            child.model.get("marker").setVisible(false);
            child.model.get("polyline").setOptions({strokeWeight: 5});
          }

        });

    });
    // console.dir(this.childViews);

    var bounds = new google.maps.LatLngBounds();

    $(".tab-"+ this.model.get("tabId")).addClass("show active");

    this.childViews.forEach(function(child,i){
      if(child.model.get("polyline")){
        console.dir(child.model.get("polyline"));
        child.model.get("polyline").setOptions({strokeOpacity: 1.0});
        console.log("marker visible");
        child.model.get("marker").setVisible(true);
        console.log("marker visible");
        bounds.extend(child.model.get("marker").getPosition());
        console.log("bounds extend");
      }
    });
    map.fitBounds(bounds);

  },

  close: function(){
    this.remove();
    this.unbind();
  }
});
