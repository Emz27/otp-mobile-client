var LegModel = Backbone.Model.extend({
  defaults: {
    conveyance : "",
    from : "",
    to : "",
    duration : "",
    fare : "",
    polyline : null
  }
});


var IteneraryModel = Backbone.Model.extend({
  defaults: {
    leg : null
  }
});
