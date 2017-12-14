var MonitorView = Backbone.View.extend({

  className :"col-12 p-0",

  monitorTemplate: _.template($('#monitor_template').html()),

  initialize: function(){
    this.legViews = [];
    this.stops = [];
    this.points = [];
    this.totalDistance = 0;
    this.totalPathDistance = 0;
    this.distanceTravelled = 0;
    this.currentIndex = 0;
    this.startPoint = {};
    this.endPoint = {};
    this.remainingCheckpoints = [];
    this.remainingStops = [];
    this.remainingStopViews = [];
    this.currentPosition = {};

    this.remainingCheckpointMarkers = [];//
    this.lastCheckpointMarker = {};//
    this.currentPositionMarker = {};
    // var this1 = this;
    // var onWatchPositionSuccess = this.onWatchPositionSuccess.bind(this);
    
    // google.maps.event.addListener(map, 'click', function(event) {
    //    // placeMarker(event.latLng);
    //    var position={};
    //    position.coords ={};
    //    position.coords.latitude = event.latLng.lat();
    //    position.coords.longitude = event.latLng.lng();
    //    // // console.dir(event.latLng);
    //    // alert(position);
    //    onWatchPositionSuccess(position);
    
    // });
  },

  render: function () {
    $("#originAutocomplete").prop('disabled', true);
    $("#destinationAutocomplete").prop('disabled', true);
    //this.legViews.pop();
    // console.log("testtestAAA"+this.legViews[0].model.get("points")[1].lng);
    this.startPoint = new google.maps.LatLng(this.legViews[0].model.get("points")[0].lat,this.legViews[0].model.get("points")[0].lng);
    this.lastCheckpoint = new google.maps.LatLng(this.legViews[0].model.get("points")[0].lat,this.legViews[0].model.get("points")[0].lng);
    // console.log("lastCheckpoint: "+ this.lastCheckpoint);
    // this.endPoint = this.legViews[0].model.get("points")[this.legViews[0].model.get("points").length-1];
    var totalDistance = this.totalDistance;
    var points = this.remainingCheckpoints;
    var stops = this.remainingStops;
    var stopViews = this.remainingStopViews;

    this.legViews.forEach(function(item,i){
      if(i==(this.legViews.length - 1) )return;
      totalDistance+= item.model.get("distance");
      points.push.apply(points,item.model.get("points"));
      console.dir(item.model.get("points"));
      var stop = item.model.get("points")[item.model.get("points").length-1];
      stops.push(new google.maps.LatLng(stop.lat,stop.lng));
      stopViews.push(item);

    }.bind(this));
    points.shift();
    this.remainingStops = stops;
    this.remainingStopViews = stopViews;
    // console.dir(points);
    points[0] = new google.maps.LatLng(points[0].lat, points[0].lng);
    // this.remainingCheckpointMarkers[0] = new google.maps.Marker({
    //   position: points[0],
    //   map: map
    // });
    for(var i = 1 ; i < points.length ; i++){
      if(points[i]){
        points[i] = new google.maps.LatLng(points[i].lat, points[i].lng);
        // var marker = new google.maps.Marker({
        //   position: points[i],
        //   map: map
        // });
        // this.remainingCheckpointMarkers.push(marker);
        this.totalPathDistance += google.maps.geometry.spherical.computeDistanceBetween(points[i-1], points[i]);
        // console.log("totalPathDistance: "+this.totalPathDistance);
      }else{
        console.log("point not valid, point with index will be removed: "+ i);
        points.splice(i,1);
      }
    }
    this.remainingCheckpoints = points;
    this.points = points;
    console.log("totalPathPoints: "+ this.points.length);
    console.log("totalPathDistance: "+this.totalPathDistance);
    this.model.set({totalPathDistance: this.totalPathDistance});
    this.$el.html(this.monitorTemplate(this.model.attributes));

    this.getCurrentPosition();
    this.startWatchPosition();
    return this;
  },
  snapToRoad: function(){

  },
  startWatchPosition: function(){
    this.watchId = navigator.geolocation.watchPosition(this.onWatchPositionSuccess.bind(this),
                                                  this.onWatchPositionError.bind(this),
                                                { enableHighAccuracy: true });
  },
  stopWatchPosition: function(){
    navigator.geolocation.clearWatch(this.watchId);
  },
  getCurrentPosition : function(){
    navigator.geolocation.getCurrentPosition(this.onGetPositionSuccess.bind(this), this.onGetPositionError.bind(this),{ enableHighAccuracy: true });
  },

  onGetPositionSuccess: function(position) {
      // console.log('Latitude: '           + position.coords.latitude              + '\n' +
        // 'Longitude: '          + position.coords.longitude             + '\n' +
        // 'Altitude: '           + position.coords.altitude              + '\n' +
        // 'Accuracy: '           + position.coords.accuracy              + '\n' +
        // 'Altitude Accuracy: '  + position.coords.altitudeAccuracy      + '\n' +
        // 'Heading: '            + position.coords.heading               + '\n' +
        // 'Speed: '              + position.coords.speed                 + '\n' +
        // 'Timestamp: '          + position.timestamp    );

        this.currentPosition = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);

      // var percent = /this.totalPathDistance
      /*
        move map marker to a new position
        update progress bar
          -start of the leg will be the checkpoint of the progress bar
          - distance of the leg
          - accumulated travel distance
        notification if the user reached a certain radius of a stop
      */
  },
  onGetPositionError: function(error){
    // console.log("get current position error message: "+ error.message);
    // console.log("get current position error code: "+ error.code);
    if(error.code == 1){
      alert("Location must be turned on to use 'Monitor Trip'");
      this.close();
    }
  },
  onWatchPositionSuccess: function(position) {
      console.log("================");
      this.currentPosition = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
      // array.findIndex(function(currentValue, index, arr), thisValue)
      var nearCheckpoint = this.remainingCheckpoints.findIndex(function(checkpoint){
                    return google.maps.geometry.spherical.computeDistanceBetween(this.currentPosition, checkpoint) <= 30;
                  }.bind(this));

      if(nearCheckpoint != -1){
        console.log("----------near to checkpoint----------");
        var currentCheckpoint = this.remainingCheckpoints[nearCheckpoint];
        // array.indexOf(item, start)
        var stopCheckpoint = this.remainingStops.findIndex(function(stop){
              return google.maps.geometry.spherical.computeDistanceBetween(currentCheckpoint, stop) <= 30;
            });
        if(stopCheckpoint != -1){
          // notification to user
          console.log("----------approaching a stop----------");
          var fare = this.remainingStopViews[stopCheckpoint].model.get("fare");
          if (cordova.platformId == 'android') {
              StatusBar.backgroundColorByHexString("#333");
          }
          if(this.remainingStops.length == 1){
            navigator.vibrate([1000, 500, 1000, 1000, 2000]);
            navigator.notification.alert(
                "You have reached your Destination.",         // message
                null,                 // callback
                "Stop Alert",           // title
                'Ok'                  // buttonName
            );
          }
          else if(this.remainingStopViews[stopCheckpoint].model.get("conveyance").primary == "WALK"){
            navigator.vibrate([1000, 500, 1000, 500, 1000]);
            navigator.notification.alert(
                "You have reached your stop\n\n",         // message
                null,                 // callback
                "Stop Alert",           // title
                'Ok'                  // buttonName
            );
          }
          else if(this.remainingStopViews[stopCheckpoint].model.get("conveyance").primary == "TRAIN"){
            navigator.vibrate([1000, 500, 1000, 500, 1000]);
            navigator.notification.alert(
                "You have reached your stop!\nPlease leave the train carefully",         // message
                null,                 // callback
                "Stop Alert",           // title
                'Ok'                  // buttonName
            );
          }
          else {
            navigator.vibrate([1000, 500, 1000, 500, 1000]);
              navigator.notification.alert(
                  "You have reached your stop!\n\nPlease prepare for your next trip.",
                  null,                 // callback
                  "Stop Alert",           // title
                  'Ok'                  // buttonName
              );
          }

          // alert("you are approaching a stop");// temporary alert!
          // array.splice(index, howmany, item1, ....., itemX)
          this.remainingStops.splice(0,stopCheckpoint+1);
          this.remainingStopViews.splice(0,stopCheckpoint+1);
        }
        var removedCheckpoints = [];
        // for(var i =0;i<=nearCheckpoint;i++){
        //   this.remainingCheckpointMarkers[i].setMap(null);
        // }
        // for(var i =0;i<=nearCheckpoint;i++){
        //   this.remainingCheckpointMarkers.shift();
        // }
        removedCheckpoints.push.apply(removedCheckpoints,this.remainingCheckpoints.splice(0,nearCheckpoint+1));
        // array.reduce(function(total, currentValue, currentIndex, arr), initialValue)
        var removedDistance = 0;
        if(removedCheckpoints.length != 1){
          for(var i=1; i<removedCheckpoints.length;i++){
            removedDistance += google.maps.geometry.spherical.computeDistanceBetween(removedCheckpoints[i-1], removedCheckpoints[i]);
          }
        }
        this.distanceTravelled += google.maps.geometry.spherical.computeDistanceBetween(this.lastCheckpoint, removedCheckpoints[0]);
        this.distanceTravelled += removedDistance;
        this.lastCheckpoint = currentCheckpoint;
        var num = this.points.indexOf(this.remainingCheckpoints[nearCheckpoint]);
        console.log("- "+removedCheckpoints.length+" removed from list of remaining points");
        console.log("-checkpoint number " +(num)+1+"/"+this.points.length);
        var progress = Math.floor((this.distanceTravelled/this.totalPathDistance) * 100);
        console.log("-distance travelled: "+ this.distanceTravelled);
        console.log("-progress: "+ progress+"%");
        this.$(".progress-bar").css("width",progress+"%");
      }
      else{
        var maxCheckpointDistance = google.maps.geometry.spherical.computeDistanceBetween(this.lastCheckpoint, this.remainingCheckpoints[0]);
        var currentDistanceToCheckpoint = google.maps.geometry.spherical.computeDistanceBetween(this.currentPosition, this.remainingCheckpoints[0]);
        console.log("----------not near to any checkpoints----------");
        console.log("maxCheckpointDistance: "+ maxCheckpointDistance);
        console.log("currentDistanceToCheckpoint: "+ currentDistanceToCheckpoint);
        console.log("distanceTravelled : "+ this.distanceTravelled);
        var progress = Math.floor(((this.distanceTravelled + maxCheckpointDistance - currentDistanceToCheckpoint)/this.totalPathDistance)*100);
        if (progress < 0) progress = 0;
        console.log("progress : "+ progress+"%");
        this.$(".progress-bar").css("width",progress+"%");
      }
      console.log("================");
  },
  onWatchPositionError: function(error){
    if(error.code == 1){
      alert("Location must be turned on to use 'Monitor Trip'");
      this.close();
    }
  },
  close: function(){
    $("#tab_duration").show();
    $(".stop_monitor").css("display","none");
    $(".start_monitor").css("display","initial");
    $("#monitor").hide();
    $("#originAutocomplete").prop('disabled', false);
    $("#destinationAutocomplete").prop('disabled', false);
    this.unbind();
    this.remove();
    this.stopWatchPosition();
  }
});
