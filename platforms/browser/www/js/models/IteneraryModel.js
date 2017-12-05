var IteneraryModel = Backbone.Model.extend({
  defaults: {
    tabId: "",
    status: "",
    polylines : [],

    duration:"",
    elevationGained:"",
    elevationLost:"",
    endTime:"",
    legs: null,
    startTime:"",
    tooSloped:"",
    transfers:"",
    transitTime:"",
    waitingTime:"",
    walkDistance:"",
    walkLimitExceeded:"",
    walkTime:"",
    fare:"",

    date:"",
    from:"",
    to:"",
    incidents: null
  }
});
