

  var map,originAutocomplete, destinationAutocomplete;
  var geocoder;
  var results;
  var itenerary = [];
  var snappedCoordinates = [];
  var collectionArray = [];
  //var sideBar = new appView();

  var appModelInstance;
  var appViewInstance;
  var initialPosition={};
  var animTimer ={};
  var globalBound = {};
  var navbarScrollHeight = 0;
  var userMarker = {};
  var originMarker = {};
  var destinationMarker = {};

  var originLocation = {};
  var destinationLocation = {};
  var infoWindow = {};
  var isPending = false;
  initialPosition.lat = 0;
  initialPosition.lng = 0;


  var colors = [
    "#4169E1",// royal blue
    "#cc0000",// Boston University Red
    "#32CD32"// Lime Green
  ];
  var onWatchCurrentPositionSuccess = function(position){
    initialPosition.lat = position.coords.latitude;
    initialPosition.lng = position.coords.longitude;
    userMarker.setPosition(new google.maps.LatLng(initialPosition.lat,initialPosition.lng));
    if(!$("#user_center").is(":visible"))$("#user_center").show();
  }
  var onWatchCurrentPositionError = function(error){
    console.log("watch gps error: "+ error.message);
    if($("#user_center").is(":visible"))$("#user_center").hide();
  }
  var onGetCurrentPositionSuccess = function(position){
    initialPosition.lat = position.coords.latitude;
    initialPosition.lng = position.coords.longitude;
    $("#user_center").show();
    userMarker.setPosition(new google.maps.LatLng(initialPosition.lat,initialPosition.lng));
  }
  var onGetCurrentPositionError = function(error){
    $("#user_center").hide();
    console.log("get gps error: "+ error.message);
  }
  function initMap() {
    var metroManilaBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(14.775268, 120.904939),
      new google.maps.LatLng(14.325054, 121.115697)
    );
    geocoder = new google.maps.Geocoder;
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 14.591667, lng: 121.094006},
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      streetViewControl: false,
      disableDefaultUI: true,
      clickableIcons: false
    });
    var markerImage = new google.maps.MarkerImage('icons/user current location.svg',
            new google.maps.Size(16, 16),
            new google.maps.Point(0, 0),
            new google.maps.Point(8, 8));
    var originMarkerImage = new google.maps.MarkerImage('icons/origin marker.svg',
            new google.maps.Size(30, 40),
            new google.maps.Point(0, 0),
            new google.maps.Point(15, 32));
    var destinationMarkerImage = new google.maps.MarkerImage('icons/destination marker.svg',
            new google.maps.Size(40, 40),
            new google.maps.Point(0, 0),
            new google.maps.Point(13, 32));

    userMarker = new google.maps.Marker({
      icon: markerImage,
      zIndex: 6000,
      map: map
    });
    originMarker = new google.maps.Marker({
      icon: originMarkerImage,
      title:"Origin",
      zIndex: 5000,
      map: map
    });
    destinationMarker = new google.maps.Marker({
      icon: destinationMarkerImage,
      title:"Destination",
      zIndex: 5000,
      map: map
    });
    originAutocomplete =  new google.maps.places.Autocomplete(document.getElementById("originAutocomplete"),{bounds: metroManilaBounds});
    destinationAutocomplete = new google.maps.places.Autocomplete(document.getElementById("destinationAutocomplete"),{bounds: metroManilaBounds});
    originAutocomplete.setComponentRestrictions({'country': 'ph'});
    destinationAutocomplete.setComponentRestrictions({'country': 'ph'});
    originAutocomplete.addListener('place_changed', function() {
      if(!autocompleteGeocode()) return;
      tripPlan(formatLocation(originLocation.lat,originLocation.lng),formatLocation(destinationLocation.lat,destinationLocation.lng));
    });
    destinationAutocomplete.addListener('place_changed', function() {
      if(!autocompleteGeocode()) return;
      tripPlan(formatLocation(originLocation.lat,originLocation.lng),formatLocation(destinationLocation.lat,destinationLocation.lng));
    });
    var infoWindowContent = "<a class='set_origin' href='#'><img src='icons/origin marker.svg'/></a> | <a class='set_destination' href='#'><img src='icons/destination marker.svg'/></a> |";
    infoWindow = new google.maps.InfoWindow({
      content: infoWindowContent
    });
    infoWindow.addListener("domready",function(){
      console.log("dom ready!");
      if(!$.hasData($(".set_origin")[0])){
        $(".set_origin").click(function(){
          setOrigin(infoWindow.getPosition().lat(),infoWindow.getPosition().lng());
          infoWindow.close();
        });
      }
      if(!$.hasData($(".set_destination")[0])){
        $(".set_destination").click(function(){
          setDestination(infoWindow.getPosition().lat(),infoWindow.getPosition().lng());
          $(".set_destination").unbind();
          infoWindow.close();
        });
      }
    });
    map.addListener("click",function(event){
      if($('#originAutocomplete').prop('disabled') && $('#destinationAutocomplete').prop('disabled'))
      infoWindow.setPosition(event.latLng);
      infoWindow.open(map);
    });
  }


  function tripPlan(origin,destination){
    stopAnimation("start");


    otp.route(
      origin,
      destination,
      'TRANSIT,WALK'
    )
    .then(function(data) {
      setTimeout(function(){
        stopAnimation();
      }, 2000);
      //router.reset();
      // $("#originAutocomplete").prop('disabled', false);
      // $("#destinationAutocomplete").prop('disabled', false);
      if(data.plan) {
        results = data.plan.itineraries;

        results.forEach(function(itinerary) {
          itinerary.fare = 0;
          itinerary.legs.forEach(function(leg) {
            leg.points = decodePoints(leg.legGeometry.points);
            leg.className = leg.mode.toLowerCase();

            if(leg.mode == 'RAIL') {
              leg.route = leg.route.replace("-", " ");
              leg.className = "rail "+leg.route.replace(" ", "").toLowerCase();
            }
            if(leg.fare) {
              itinerary.fare += leg.fare;
              leg.fare = formatFare(leg.fare);
            }
          });

          if(itinerary.fare == 0) {
            itinerary.fare = undefined;
          }
          else {
            itinerary.fare = formatFare(itinerary.fare, false);
          }
        });

        console.dir(results);

        appViewInstance.model.set({iteneraries: results});
        //appViewInstance.render();
        console.log("appview model set iteneraries successful!");

      }
      else {
        // router.set('results', null);
        // itinerary.set('current', null);
      }
    }).catch(function (error) {
       console.dir(error);
   })
   .done();
  }
  $(document).ready(function(){
    $("#user_center").hide();
    navigator.geolocation.watchPosition(onWatchCurrentPositionSuccess, onWatchCurrentPositionError,{ enableHighAccuracy: true });
    navigator.geolocation.getCurrentPosition(onGetCurrentPositionSuccess, onGetCurrentPositionError,{ enableHighAccuracy: true });
    navbarScrollHeight = $("#navbar")[0].scrollHeight;
    var originInput = $("#originAutocomplete");
    var destinationInput = $("#destinationAutocomplete");
    $("#user_center").click(function(){
      map.setCenter(userMarker.getPosition());
      map.setZoom(16);
    });
    // startAnimation();
    appModelInstance = new AppModel();
    appViewInstance = new AppView({model: appModelInstance});
  });

  document.addEventListener('deviceready', function(){
    // alert("device ready");
    // navigator.geolocation.watchPosition(onWatchCurrentPositionSuccess, onWatchCurrentPositionError,{ enableHighAccuracy: true });
    // navigator.geolocation.getCurrentPosition(onGetCurrentPositionSuccess, onGetCurrentPositionError,{ enableHighAccuracy: true });
    // StatusBar.hide();
    console.log('calling push init');
    var push = PushNotification.init({
        "android": {
            "senderID": "XXXXXXXX"
        },
        "browser": {},
        "ios": {
            "sound": true,
            "vibration": true,
            "badge": true
        },
        "windows": {}
    });
    console.log('after init');

    push.on('registration', function(data) {
        console.log('registration event: ' + data.registrationId);

        var oldRegId = localStorage.getItem('registrationId');
        if (oldRegId !== data.registrationId) {
            // Save new registration ID
            localStorage.setItem('registrationId', data.registrationId);
            // Post registrationId to your app server as the value has changed
        }
    });

    push.on('error', function(e) {
        console.log("push error = " + e.message);
    });

    push.on('notification', function(data) {
        console.log('notification event');
        navigator.notification.alert(
            data.message,         // message
            null,                 // callback
            data.title,           // title
            'Ok'                  // buttonName
        );
    });




  }, false);
