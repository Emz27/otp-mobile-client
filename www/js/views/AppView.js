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
    this.$("#itenerary_list_portrait").html("");
    this.$("#itenerary_list_landscape").html("");

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

      view.render();





      var portrait = new IteneraryTabContentView({ model: view.model,clone:true });
      var landscape = new IteneraryTabContentView({ model: view.model,clone:true });
      portrait.render();
      landscape.render();
      tabNumberChildViews.push(view);
      tabNumberChildViews.push(portrait);
      tabNumberChildViews.push(landscape);
      console.log("view clone begin");
      // console.log("view parent length: "+ view.childViews.length);
      // console.log("view parent index 0 : "+view.childViews[0].model);
      // console.dir(view.childViews[0].model);
      // console.log("portrait child length : "+portrait.childViews.length);
      // console.log("landscape child length : "+landscape.childViews.length);
      for(var i = 0; i < view.childViews.length; i++){
        portrait.childViews[i].model = view.childViews[i].model;
        landscape.childViews[i].model = view.childViews[i].model;
      }
      console.log("view clone end");
      // console.log("IteneraryTabContentView creation successful! index: " + i);
      this.$("#itenerary_list_portrait").append(portrait.$(".tab-pane"));
      this.$("#itenerary_list_landscape").append(landscape.$(".tab-pane"));


      // console.log("IteneraryTabContentView append to #tab-content div successful! index: " + i);
      //console.log("IteneraryTabContentView was pushed to childViews! index: " + i);
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



    map.fitBounds(bounds);
    console.log("appview render ended");

    return this;
  },

  clean: function(){
    console.log("Appview cleaning started");
    _.each(this.iteneraryTabChildViews, function(childView){

        childView.close();

    });
    console.log("tab removed");
    console.log(this.tabNumberChildViews.length);
    _.each(this.tabNumberChildViews, function(childView,i){

        childView.close();

    });
    console.log("tab content removed");
    this.iteneraryTabChildViews = [];
    this.tabNumberChildViews = [];
    console.log("Appview CLeaned!");
  }
});
