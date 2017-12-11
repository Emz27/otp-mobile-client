

  var map,originAutocomplete, destinationAutocomplete;
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
  initialPosition.lat = 0;
  initialPosition.lng = 0;


  var colors = [
    "#4169E1",// royal blue
    "#cc0000",// Boston University Red
    "#32CD32"// Lime Green
  ];


  var getInitialPositionSuccess = function(position){
    // alert("you can use youre current location as origin");
    this.lat = position.coords.latitude;
    this.lng = position.coords.longitude;
    $('#originAutocomplete').val("Use Current Location");
  }
  var getInitialPositionError = function(error){
    $('#originAutocomplete').val("");
    // alert("error msg: "+ error.message);
  }
  function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 14.591667, lng: 121.094006},
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      streetViewControl: false,
      disableDefaultUI: true,
      clickableIcons: false
    });
    originAutocomplete =  new google.maps.places.SearchBox(document.getElementById("originAutocomplete"));
    destinationAutocomplete = new google.maps.places.SearchBox(document.getElementById("destinationAutocomplete"));
    originAutocomplete.addListener('places_changed', function() {
      tripPlan();
    });
    destinationAutocomplete.addListener('places_changed', function() {
      tripPlan();
    });
  }
  function addAnimation(){
    var item = "<img class='animation_object' src='icons/jeepney.png' width='200px' style='position:absolute;left:100vw;top:30vh'/>"
    $("#navbar").append(item);
    var max = 5000;
    var min = 1000;

    $(".animation_object").last().animate({left:"-50vw"},Math.floor(Math.random()*(max-min+1)+min),function(){
      this.remove();
    });
  }
  function startAnimation(){

    $('#navbar').animate({
        height: "100vh"
        //$('#navbar').get(0).scrollHeight
    }, 1000, function(){
      $("#navbar").addClass("col-12");
    });
    animTimer = setInterval(function(){
      addAnimation();
    }, 500);

  }
  function stopAnimation(isStartAnimation){
    window.clearTimeout(animTimer);
    if(isStartAnimation){
      startAnimation();
      return;
    }
    $(".animation_object").remove();
    $("#navbar").removeClass("col-12");
    console.log($("#navbar")[0].scrollHeight);
    $('#navbar').animate({
        height: navbarScrollHeight
    }, 1000, function(){
        $(this).height('auto');
        google.maps.event.trigger(map, 'resize');
        map.fitBounds(globalBound);

    });
  }
  function tripPlan(){
    var originLat,originLng,destinationLat,destinationLng,originLocation,destinationLocation;
    var origin =null;
    var destination=null;
    var originInput = $("#originAutocomplete");
    var destinationInput = $("#destinationAutocomplete");
    if(!originInput.val() || !destinationInput.val()) return;
    var originPlace = originAutocomplete.getPlaces();
    var destinationPlace = destinationAutocomplete.getPlaces();
    if((originInput.val() == "Use Current Location") &&( initialPosition.lat != 0 || initialPosition.lng != 0)&&(destinationPlace.length != 0)){
      origin = initialPosition.lat+","+initialPosition.lng;
      destination = searchBoxGetLocation(destination);
      stopAnimation(true);
    }
    else if(destinationPlace.length != 0 && originPlace.length != 0) {
      origin = searchBoxGetLocation(originPlace);
      destination = searchBoxGetLocation(destinationPlace);
      stopAnimation(true);
    }
    else return;
    // $("#originAutocomplete").prop('disabled', true);
    // $("#destinationAutocomplete").prop('disabled', true);
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
    });
  }
  $(document).ready(function(){
    navbarScrollHeight = $("#navbar")[0].scrollHeight;
    $("#navbar").addClass("col-12");
    var originInput = $("#originAutocomplete");
    var destinationInput = $("#destinationAutocomplete");
    // startAnimation();
    appModelInstance = new AppModel();
    appViewInstance = new AppView({model: appModelInstance});
  });

  document.addEventListener('deviceready', function(){
    // alert("device ready");
    navigator.geolocation.getCurrentPosition(getInitialPositionSuccess.bind(initialPosition), getInitialPositionError.bind(initialPosition),{ enableHighAccuracy: true });
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

        var parentElement = document.getElementById('registration');
        var listeningElement = parentElement.querySelector('.waiting');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
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
