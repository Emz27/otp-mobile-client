
var LegView = Backbone.View.extend({

  tagName:"li",
  className :"list-group-item d-flex",

  legVehicleTemplate: _.template($('#leg_vehicle').html()),
  legWalkTemplate: _.template($('#leg_walk').html()),

  events: {
    'click': 'zoom',
    'mouseleave': 'resetPolyline',
    'mouseover': 'highlightPolyline'
  },

  render: function () {
    // console.log("LegView render started");
    if ('WALK' == this.model.get('conveyance').primary) {
      this.$el.html(this.legWalkTemplate(this.model.attributes));
    } else {
      this.$el.html(this.legVehicleTemplate(this.model.attributes));
    }
    // console.dir(this.model.attributes);
    // console.log(this.model.get("conveyance").primary);
    // console.log("LegView render ended");
    return this;
  },
  zoom: function(){

    var bounds = new google.maps.LatLngBounds();
    console.dir(this.model.get("marker").getPosition());
    var lat = this.model.get("points")[this.model.get("points").length - 1].lat;
    var lng = this.model.get("points")[this.model.get("points").length - 1].lng;
    bounds.extend(this.model.get("marker").getPosition());
    bounds.extend(new google.maps.LatLng(lat,lng));
    map.fitBounds(bounds);

  },
  highlightPolyline: function(){
    this.model.get("polyline").setOptions({strokeWeight: 10});



  },
  resetPolyline: function(){

    this.model.get("polyline").setOptions({strokeWeight: 5});

  },

  close: function(){
    // Your processing code here
    this.remove();
    this.unbind();
    this.model.get("polyline").setMap(null);
    this.model.get("marker").setMap(null);
  }
});



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



    console.dir(this.familyViews);
    this.familyViews.forEach(function(children,i){
      // console.log(i);

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

    this.childViews.forEach(function(child,i){
      if(child.model.get("polyline")){
        // console.dir(child.model.get("polyline"));
        child.model.get("polyline").setOptions({strokeOpacity: 1.0});
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

var IteneraryTabContentView = Backbone.View.extend({

  tabContentTemplate : _.template($('#tab-number').html()),

  events:{
    'mouseleave .card': 'resetPolyline'
  },


  initialize: function (options) {
    this.childViews = [];
  },
  render: function() {
    // console.log("IteneraryTabContentView render started");
    this.$el.html(this.tabContentTemplate(this.model.attributes));

    var childViews = this.childViews;
    var tab = this.$(".list-group");
    var title = this.$(".card-header");
    var IteneraryTabContentView = this;

    this.model.get("legs").forEach(function(leg, i){

        var model = new LegModel(leg);
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

    console.log("LeagHeader view end create");
    // console.log("IteneraryTabContentView render ended");
    return this;
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


var AppView = Backbone.View.extend({

  el: $("#content"),



  initialize: function (options) {
    this.iteneraryTabChildViews = [];
    this.tabNumberChildViews = [];

    this.listenTo(this.model, 'change', this.render);

  },

  render: function() {

    this.clean();
    // console.log("appview render start!");

    this.$("#duration_tab").html("");
    this.$(".tab-content").html("");

    // console.log("appview render started");
    // console.log(this.childViews);

    //console.dir(this.model.get("iteneraries"));

    var tabNumberChildViews = this.tabNumberChildViews;
    var iteneraryTabChildViews = this.iteneraryTabChildViews ;
    var bounds = new google.maps.LatLngBounds();

    _.each(this.model.get("iteneraries"), function(itenerary,i){
      var model = new IteneraryModel(itenerary);
      //console.dir(itenerary);
      //console.dir(model);
      // console.log("IteneraryModel creation successful! index: " + i);
      model.set({tabId : ""+i});
      //console.log("IteneraryModel set tabId successful! tabId: " + i);
      if(i == 0)model.set({active: "active"});

      var iteneraryTabViewInstance = new IteneraryTabView({model: model});
      // console.dir(childViews);
      iteneraryTabChildViews.push(iteneraryTabViewInstance);
      // console.log("IteneraryTabView was pushed to childViews! index: " + i);

      // console.dir(view);
      // console.log("IteneraryTabView creation successful! index: " + i);
      this.$("#duration_tab").append(iteneraryTabViewInstance.render().el);

      // console.log("IteneraryTabView append to #tab div successful! index: " + i);



      var view = new IteneraryTabContentView({model: model});


      iteneraryTabViewInstance.childViews = view.childViews;
      iteneraryTabViewInstance.familyViews = iteneraryTabChildViews;


      tabNumberChildViews.push(view);
      console.log("IteneraryTabContentView creation successful! index: " + i);
      this.$(".tab-content").append(view.render().$(".tab-pane"));
      console.log("IteneraryTabContentView append to #tab-content div successful! index: " + i);
      //console.log("IteneraryTabContentView was pushed to childViews! index: " + i);
    });

    this.tabNumberChildViews.forEach(function(child1){
      child1.get("childViews").forEach(function(item){
        if(item.model.get("marker")){
          bounds.extend(item.model.get("marker").getPosition());
        }
      });
    });

    map.fitBounds(bounds);
   // console.log("appview render ended");

    return this;
  },

  clean: function(){
    // console.dir(this.childViews);
    _.each(this.iteneraryTabChildViews, function(childView){

        childView.close();

    });
    _.each(this.tabNumberChildViews, function(childView){

        childView.close();

    });

    this.childViews = [];
    console.log("Appview CLeaned!");
  }
});
