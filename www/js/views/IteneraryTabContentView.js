var IteneraryTabContentView = Backbone.View.extend({

  tabContentTemplate : _.template($('#tab-number').html()),

  events:{
    'mouseleave .card': 'resetPolyline'
  },


  initialize: function (option) {
    this.childViews = [];
    this.option = option;
  },
  render: function() {
    // console.log("IteneraryTabContentView render started");
    this.$el.html(this.tabContentTemplate(this.model.attributes));

    var childViews = this.childViews;
    var tab = this.$(".list-group");
    var title = this.$(".card-header");
    var IteneraryTabContentView = this;
    var clone = this.option.clone;

    this.model.get("legs").forEach(function(leg, i){

        var model = new LegModel(leg);

        if(clone != true){

          var line = new google.maps.Polyline({
            path: leg.points,
            geodesic: false,
            strokeColor: colors[IteneraryTabContentView.model.get("tabId")],
            strokeOpacity: 1.0,
            strokeWeight: 5
          });
          line.setMap(map);

          var start = leg.conveyance.primary;
          if(start == "RAIL")start = leg.route;
          var markerImage = new google.maps.MarkerImage('icons/'+start+' White.svg',
                  new google.maps.Size(400, 400),
                  new google.maps.Point(0, 0),
                  new google.maps.Point(15, 15));


          var marker = new google.maps.Marker({
            position: new google.maps.LatLng(leg.points[0].lat, leg.points[0].lng),
            icon: markerImage,
            map: map
          });

          model.set({
            polyline: line,
            marker: marker
          });

        }
        else console.log("polyline not created");

        var view = new LegView({model:model});

        tab.append(view.render().el);

        childViews.push(view);

    });

    this.childViews = childViews;

    // console.log("LeagHeader view start create");

    // console.dir(this.model);

    var view = new LegHeaderView({model:this.model});
    title.html(view.render().el);
    this.childViews.push(view);
    view.siblingViews = this.childViews;

    console.log("LeagHeader view end create");
    // console.log("IteneraryTabContentView render ended");
    return this;
  },

  plot: function(){


  },

  resetPolyline: function(){

    var bounds = new google.maps.LatLngBounds();
    this.childViews.forEach(function(child,i){
      if(child.model.get("polyline")){
        console.log("in!");
        // console.dir(child.model.get("polyline"));
        child.model.get("polyline").setOptions({strokeWeight: 5});
        // child.model.get("polyline").setOptions({strokeOpacity: 1.0});
        // child.model.get("marker").setVisible(true);
        bounds.extend(child.model.get("marker").getPosition());
        console.log("out!");
      }
    });

    map.fitBounds(bounds);
  },
  close: function(){
    // console.log("IteneraryTabContentView cleaning started!");
    // console.dir(this.childViews);
    this.remove();
    this.unbind();
    _.each(this.childViews, function(childView){
      childView.close();
    });
    // console.log("IteneraryTabContentView cleaned!");
  }

});
