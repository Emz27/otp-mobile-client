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
