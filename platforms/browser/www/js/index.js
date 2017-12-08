

  var map,originAutocomplete, destinationAutocomplete;
  var results;
  var itenerary = [];
  var snappedCoordinates = [];
  var collectionArray = [];
  //var sideBar = new appView();

  var appModelInstance;
  var appViewInstance;

  var colors = [
    "#4169E1",// royal blue
    "#cc0000",// Boston University Red
    "#32CD32"// Lime Green
  ];






  function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 14.591667, lng: 121.094006},
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      streetViewControl: false,
      disableDefaultUI: true
    });
    originAutocomplete =  new google.maps.places.SearchBox(document.getElementById("originAutocomplete"));
    destinationAutocomplete = new google.maps.places.SearchBox(document.getElementById("destinationAutocomplete"));
  }

  $(document).ready(function(){
    appModelInstance = new AppModel();
    appViewInstance = new AppView({model: appModelInstance});

    //
    // console.dir(appModelInstance);
    // console.dir(appViewInstance);





    $("#searchButton").on("click",function(){



      var origin = originAutocomplete.getPlaces();
      var destination = destinationAutocomplete.getPlaces();
      var originLat,originLng,destinationLat,destinationLng,originLocation,destinationLocation;
      if (origin.length == 0 || destination.length == 0) {
            return;
      }

      otp.route(
        searchBoxGetLocation(origin),
        searchBoxGetLocation(destination),
        'TRANSIT,WALK'
      )
      .then(function(data) {
        //router.reset();

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
      // .fin(function() {
      //   progress.setLoading(false);
      // });



    });
  });

  document.addEventListener('deviceready', function(){

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
