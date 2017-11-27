

  var map,originAutocomplete, destinationAutocomplete;


  function drawItenerary(legs){
    var lines = new google.maps.Polyline({
      path: legs,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });

    lines.setMap(map);
  }

  function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 14.591667, lng: 121.094006},
      zoom: 12
    });
    originAutocomplete =  new google.maps.places.SearchBox(document.getElementById("originAutocomplete"));
    destinationAutocomplete = new google.maps.places.SearchBox(document.getElementById("destinationAutocomplete"));
  }

  $(document).ready(function(){

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
          var results = data.plan.itineraries;



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


          drawItenerary(results[0].legs[1].points);


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
