var AppView = Backbone.View.extend({

  el: $("#content"),



  initialize: function (options) {
    this.iteneraryTabChildViews = [];
    this.tabNumberChildViews = [];

    this.listenTo(this.model, 'change', this.render);

  },

  render: function() {
    console.log("----------App View start Rendering-----------");
    this.clean();

    var tabNumberChildViews = this.tabNumberChildViews;
    var iteneraryTabChildViews = this.iteneraryTabChildViews ;
    var bounds = new google.maps.LatLngBounds();

    _.each(this.model.get("iteneraries"), function(itenerary,i){
      var model = new IteneraryModel(itenerary);
      model.set({tabId : ""+i});

      if(i == 0)model.set({active: "active"});

      var iteneraryTabViewInstance = new IteneraryTabView({model: model});

      iteneraryTabChildViews.push(iteneraryTabViewInstance);

      var view = new IteneraryTabContentView({model: model});

      iteneraryTabViewInstance.childViews = view.childViews;
      iteneraryTabViewInstance.familyViews = iteneraryTabChildViews;

      view.render();

      var portrait = new IteneraryTabContentView({ model: view.model,clone:true });
      var landscape = new IteneraryTabContentView({ model: view.model,clone:true });
      console.log("*********Itenerary Tab Content "+(i+1)+"/3 rendered***********");
      portrait.render();
      landscape.render();
      tabNumberChildViews.push(view);
      tabNumberChildViews.push(portrait);
      tabNumberChildViews.push(landscape);

      for(var i = 0; i < view.childViews.length; i++){
        portrait.childViews[i].model = view.childViews[i].model;
        landscape.childViews[i].model = view.childViews[i].model;
      }

      this.$("#itenerary_list_portrait").append(portrait.$(".tab-pane"));
      this.$("#itenerary_list_landscape").append(landscape.$(".tab-pane"));
      this.$("#duration_tab").append(iteneraryTabViewInstance.render().el);

    });
    $("#tab_itenerary").removeClass("d-none");
    $("#tab_itenerary").addClass("d-flex");
    $("#itenerary_list_portrait").removeClass("d-none");

    this.tabNumberChildViews.forEach(function(child1){
      child1.childViews.forEach(function(item){
        if(item.model.get("marker")){
          bounds.extend(item.model.get("marker").getPosition());
        }
      });
    });


    globalBound = bounds;
    map.fitBounds(bounds);

    console.log("---------App View Rendering Ended-----------");
    return this;
  },

  clean: function(){

    _.each(this.iteneraryTabChildViews, function(childView){

        childView.close();

    });

    _.each(this.tabNumberChildViews, function(childView,i){

        childView.close();

    });

    this.iteneraryTabChildViews = [];
    this.tabNumberChildViews = [];

    this.$("#duration_tab").html("");
    this.$("#itenerary_list_portrait").html("");
    this.$("#itenerary_list_landscape").html("");

  }
});
