var LegModel = Backbone.Model.extend({
  defaults: {

    polyline : null,

    agencyId:"",
    agencyName:"",
    agencyTimeZoneOffset:0,
    agencyUrl:"",
    arrivalDelay:0,
    className:"",
    conveyance:{},
    departureDelay:0,
    distance:0,
    duration:0,
    endTime:0,
    fare:"",
    from:{},
    interlineWithPreviousLeg:false,
    legGeometry:{},
    mode:"",
    pathway:false,
    points:[],
    realTime:false,
    rentedBike:false,
    route:"",
    routeId:"",
    routeLongName:"",
    routeType:0,
    serviceDate:"",
    startTime:0,
    steps:[],
    to:{},
    transitLeg:false,
    tripId:""
  }
});
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

var AppModel = Backbone.Model.extend({
  defaults:{
    iteneraries: []
  }
});
