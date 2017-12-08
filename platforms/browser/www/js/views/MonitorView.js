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


    this.marker = new google.maps.Marker({
      position: new google.maps.LatLng(0, 0),
      // icon:{
      //   path: google.maps.SymbolPath.CIRCLE,
      //   scale: 1,
      //   fillColor: 'blue',
      //   fillOpacity: 1,
      //   strokeColor: 'white',
      //   strokeWeight: 5,
      // },
      // optimized: false,
      // zIndex:99999999,
      map: map
    });
    console.log("marker created");
  },

  render: function () {
    this.legViews.pop();

    this.startPoint = new google.maps.LatLng(this.legViews[0].model.get("points")[1].lat,this.legViews[0].model.get("points")[1].lng);
    this.lastCheckpoint = new google.maps.LatLng(this.legViews[0].model.get("points")[1].lat,this.legViews[0].model.get("points")[1].lng);
    console.log("lastCheckpoint: "+ this.lastCheckpoint);
    this.endPoint = this.legViews[0].model.get("points")[this.legViews[0].model.get("points").length-1];
    var totalDistance = this.totalDistance;
    var points = this.remainingCheckpoints;
    var stops = this.remainingStops;
    var stopViews = this.remainingStopViews;

    this.legViews.forEach(function(item,i){
      totalDistance+= item.model.get("distance");
      points.push.apply(points,item.model.get("points"));
      var stop = item.model.get("points")[item.model.get("points").length-1];
      stops.push(new google.maps.LatLng(stop.lat,stop.lng));
      stopViews.push(item);

    })
    points.shift();
    console.dir(points);
    for(var i = 1 ; i <= points.length ; i++){
      if(points[i]){
        if(i == 1)points[i-1] = new google.maps.LatLng(points[i-1].lat, points[i-1].lng);
        points[i] = new google.maps.LatLng(points[i].lat, points[i].lng);
        this.totalPathDistance += google.maps.geometry.spherical.computeDistanceBetween(points[i-1], points[i]);
        // console.log("totalPathDistance: "+this.totalPathDistance);
      }else{
        console.log("point not valid, point with index will be removed: "+ i);
        points.splice(i,1);
      }
    }

    console.log("totalPathDistance: "+this.totalPathDistance);
    this.model.set({totalPathDistance: this.totalPathDistance});
    this.$el.html(this.monitorTemplate(this.model.attributes));

    this.getCurrentPosition();
    this.startWatchPosition();
    return this;
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
      console.log('Latitude: '           + position.coords.latitude              + '\n' +
        'Longitude: '          + position.coords.longitude             + '\n' +
        'Altitude: '           + position.coords.altitude              + '\n' +
        'Accuracy: '           + position.coords.accuracy              + '\n' +
        'Altitude Accuracy: '  + position.coords.altitudeAccuracy      + '\n' +
        'Heading: '            + position.coords.heading               + '\n' +
        'Speed: '              + position.coords.speed                 + '\n' +
        'Timestamp: '          + position.timestamp    );

        this.currentPosition = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
        this.marker.setPosition(this.currentPosition);

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
    console.log("get current position error message: "+ error.message);
    console.log("get current position error code: "+ error.code);
    if(error.code == 1){
      alert("Location must be turned on to use 'Monitor Trip'");
      this.close();
    }
  },
  onWatchPositionSuccess: function(position) {
      console.log('Latitude: '           + position.coords.latitude              + '\n' +
        'Longitude: '          + position.coords.longitude             + '\n' +
        'Altitude: '           + position.coords.altitude              + '\n' +
        'Accuracy: '           + position.coords.accuracy              + '\n' +
        'Altitude Accuracy: '  + position.coords.altitudeAccuracy      + '\n' +
        'Heading: '            + position.coords.heading               + '\n' +
        'Speed: '              + position.coords.speed                 + '\n' +
        'Timestamp: '          + position.timestamp    );
      /*
        move map marker to a new position
        update progress bar
          -start of the leg will be the checkpoint of the progress bar
          - distance of the leg
          - accumulated travel distance
        notification if the user reached a certain radius of a stop
      */


      this.currentPosition = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
      this.marker.setPosition(this.currentPosition);

      // loop through remainingCheckpoints
      // array.findIndex(function(currentValue, index, arr), thisValue)
      var nearCheckpoint = this.remainingCheckpoints.findIndex(function(checkpoint){
                    return google.maps.geometry.spherical.computeDistanceBetween(this.currentPosition, checkpoint) <= 10;
                  }.bind(this));

      if(nearCheckpoint != -1){
        this.lastCheckpoint = this.remainingCheckpoints[nearCheckpoint];
        // array.indexOf(item, start)
        var stopCheckpoint = this.remainingStops.indexOf(this.remainingCheckpoints[nearCheckpoint]);
        if(stopCheckpoint != -1){
          // notification to user
          console.log("stopCheckpoint index: "+stopCheckpoint);
          console.log("nearCheckpoint index: "+nearCheckpoint);
          alert("you are approaching a stop");// temporary alert!
          // array.splice(index, howmany, item1, ....., itemX)
          this.remainingStops.splice(0,stopCheckpoint+1);
          this.remainingStopViews.splice(0,stopCheckpoint+1);
        }
        var removedCheckpoints = [];
        removedCheckpoints.push.apply(removedCheckpoints,this.remainingCheckpoints.splice(0,nearCheckpoint+1));
        console.log("removedCheckpoints: "+ removedCheckpoints);
        // array.reduce(function(total, currentValue, currentIndex, arr), initialValue)
        var removedDistance = 0;
        if(nearCheckpoint != 0 && removedCheckpoints.length > 0){
          removedDistance = removedCheckpoints.reduce(function(total,point,currentIndex,arr){
            if(currentIndex == 0) return total;
            return total + google.maps.geometry.spherical.computeDistanceBetween(arr[currentIndex-1], point);
          });
        }

        this.distanceTravelled += removedDistance;
        var progress = Math.floor((this.distanceTravelled/this.totalPathDistance) * 100);
        this.$(".progress-bar").css("width",progress);
      }
      else{
        var maxCheckpointDistance = google.maps.geometry.spherical.computeDistanceBetween(this.lastCheckpoint, this.remainingCheckpoints[0]);
        var currentDistanceToCheckpoint = google.maps.geometry.spherical.computeDistanceBetween(this.currentPosition, this.remainingCheckpoints[0]);
        console.log("lastCheckpoint: "+ this.lastCheckpoint);
        console.log("next remainingcheckpoint: "+ this.remainingCheckpoints[0]);
        console.log("maxCheckpointDistance: "+ maxCheckpointDistance);
        console.log("currentDistanceToCheckpoint: "+ currentDistanceToCheckpoint);
        var progress = Math.floor(this.distanceTravelled + maxCheckpointDistance - currentDistanceToCheckpoint);
        if (progress < 0) progress = 0;
        console.log("progress: "+ progress);
        this.$(".progress-bar").css("width",progress);
      }


  },
  onWatchPositionError: function(error){
    console.log("position watch error message: "+ error.message);
    console.log("position watch error code: "+ error.code);
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
    this.unbind();
    this.remove();
    this.marker.setMap(null);
    this.stopWatchPosition();

  }
});
