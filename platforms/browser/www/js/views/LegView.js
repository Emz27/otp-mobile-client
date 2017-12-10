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
    if ('WALK' == this.model.get('conveyance').primary) {
      this.$el.html(this.legWalkTemplate(this.model.attributes));
    } else {
      this.$el.html(this.legVehicleTemplate(this.model.attributes));
    }
    return this;
  },
  zoom: function(){
    var bounds = new google.maps.LatLngBounds();
    var lat = this.model.get("points")[this.model.get("points").length - 1].lat;
    var lng = this.model.get("points")[this.model.get("points").length - 1].lng;
    this.model.get("points").forEach(function(point,i){
      bounds.extend(new google.maps.LatLng(point.lat,point.lng));
    });
    map.fitBounds(bounds);
  },
  highlightPolyline: function(){
    this.model.get("polyline").setOptions({strokeWeight: 10});
  },
  resetPolyline: function(){
    this.model.get("polyline").setOptions({strokeWeight: 5});
  },
  close: function(){
    this.remove();
    this.unbind();
    this.model.get("polyline").setMap(null);
    this.model.get("marker").setMap(null);
  }
});
