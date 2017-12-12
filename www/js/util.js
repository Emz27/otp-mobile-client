/*

* Cudos to sir Philip Cheang for custom library
 * Copyright 2013 Thomas Dy, Philip Cheang under the terms of the
 * MIT license found at http://sakay.ph/LICENSE
 */

 function setOrigin(lat,lng){
   var latlng = {lat: parseFloat(lat), lng: parseFloat(lng)};
   originLocation.lat = lat;
   originLocation.lng = lng;
   var originGeocoder = new google.maps.Geocoder;
   originGeocoder.geocode({'location': latlng}, function(results, status) {
     if (status === 'OK') {
       if (results[0]) {
         $("#originAutocomplete").val(results[0].formatted_address);
       }
     }
   });
   $("#originAutocomplete").val("Loading ... ");
   originMarker.setPosition(new google.maps.LatLng(lat,lng));
   if(!destinationLocation.lng || !destinationLocation.lat) return;
   tripPlan(formatLocation(lat,lng),formatLocation(destinationLocation.lat,destinationLocation.lng));

 }
 function setDestination(lat,lng){
   var latlng = {lat: parseFloat(lat), lng: parseFloat(lng)};
   destinationLocation.lat = lat;
   destinationLocation.lng = lng;
   var destinationGeocoder = new google.maps.Geocoder;
   destinationGeocoder.geocode({'location': latlng}, function(results, status) {
     if (status === 'OK') {
       if (results[0]) {
         $("#destinationAutocomplete").val(results[0].formatted_address);
       }
     }
   });
   $("#destinationAutocomplete").val("Loading ...");
   destinationMarker.setPosition(new google.maps.LatLng(lat,lng));
   if(!originLocation.lng || !originLocation.lat) return;
   tripPlan(formatLocation(originLocation.lat,originLocation.lng),formatLocation(destinationLocation.lat,destinationLocation.lng));

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
   // $("#originAutocomplete").prop('disabled', true);
   // $("#destinationAutocomplete").prop('disabled', true);
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
 function stopAnimation(state){
   window.clearTimeout(animTimer);
   if(state == "start"){
     startAnimation();
     return;
   }
   $(".animation_object").remove();
   // $("#originAutocomplete").prop('disabled', false);
   // $("#destinationAutocomplete").prop('disabled', false);
   if(state == "retry"){
     return;
   }
   $("#navbar").removeClass("col-12");
   console.log($("#navbar")[0].scrollHeight);
   $('#navbar').animate({
       height: navbarScrollHeight
   }, 1000, function(){
       $(this).height('auto');
       if(!jQuery.isEmptyObject(globalBound)){
         try{
           google.maps.event.trigger(map, 'resize');
           map.fitBounds(globalBound);
         }
         catch(err){

         }
       }else alertify.error('No Routes Found!');
   });
 }
function autocompleteGeocode(){
  console.log("originLocation.lat: "+ originLocation.lat +"\n"+
              "originLocation.lng: "+ originLocation.lng +"\n"+
              "destinationLocation.lat: "+ destinationLocation.lat +"\n"+
              "destinationLocation.lng: "+ destinationLocation.lng);
  var origin ={};
  var destination={};
  var originInput = $("#originAutocomplete");
  var destinationInput = $("#destinationAutocomplete");
  var originPlace = originAutocomplete.getPlace();
  var destinationPlace = destinationAutocomplete.getPlace();
  if(originPlace){
    originLocation.lat = originPlace.geometry.location.lat();
    originLocation.lng = originPlace.geometry.location.lng();
    originMarker.setPosition(new google.maps.LatLng(originLocation.lat,originLocation.lng));
  }
  if(destinationPlace){
    destinationLocation.lat = destinationPlace.geometry.location.lat();
    destinationLocation.lng = destinationPlace.geometry.location.lng();
    destinationMarker.setPosition(new google.maps.LatLng(destinationLocation.lat,destinationLocation.lng));
  }
  if((originInput.val() == "Use Current Location")
    &&( initialPosition.lat != 0 || initialPosition.lng != 0)
    &&(destinationPlace)){
      console.log("use current locatoin");
    originLocation.lat = initialPosition.lat;
    originLocation.lng = initialPosition.lng;
  }
  if(!originLocation.lat || !originLocation.lng || !destinationLocation.lat || !destinationLocation.lng)return false;
  return true;
}

function formatLocation(lat,lng){
    var location;
    location =  lat + "," + lng;
    return location;
}
//14.591667,121.094006
//14.5916669,121.09400559999995

function formatFare(fare, incomplete) {
  var f = fare.toFixed(2).replace(".00", "");
  if(incomplete) {
    f = f + "*";
  }
  return f;
}

function formatDuration(duration) {
  if(isNaN(duration)) return '';
  var minutes = Math.floor(duration / 60);
  var hours = Math.floor(minutes / 60);

  if(minutes == 0) {
    return '< 1 min'
  }
  else if(minutes % 60 == 0) {
    if(hours > 1) {
      return hours+' hours';
    }
    else {
      return '1 hour';
    }
  }
  else if(minutes > 60) {
    return hours+'h '+(minutes % 60)+'m';
  }
  else {
    return minutes+' min';
  }
}

function latlng2str(latlng) {
  return latlng.lat.toFixed(6)+','+latlng.lng.toFixed(6);
}

function str2latlng(str) {
  if(str == null) return null;
  var split = str.split(",");
  if(split.length != 2) return null;
  var lat = split[0];
  var lng = split[1];
  if(!isFinite(lat) || !isFinite(lng)) return null;
  return new L.LatLng(lat, lng);
}

/* Converting Google to Leaflet */
function g2lBounds(gBounds) {
  return new L.LatLngBounds(
    g2lLatLng(gBounds.getSouthWest()),
    g2lLatLng(gBounds.getNorthEast())
  );
}

function g2lLatLng(gLatLng) {
  return new L.LatLng(gLatLng.lat(), gLatLng.lng());
}

/* Converting Leaflet to Google */
function l2gBounds(bounds) {
  return new google.maps.LatLngBounds(
    l2gLatLng(bounds.getSouthWest()),
    l2gLatLng(bounds.getNorthEast())
  );
}

function l2gLatLng(latlng) {
  return new google.maps.LatLng(latlng.lat, latlng.lng);
}

/* Decoding OTP polylines */
// adapted from http://soulsolutions.com.au/Default.aspx?tabid=96
function decodeNumber(value, index) {
  if (value.length == 0)
      throw "string is empty";

  var num = 0;
  var v = 0;
  var shift = 0;

  do {
    v1 = value.charCodeAt(index++);
    v = v1 - 63;
    num |= (v & 0x1f) << shift;
    shift += 5;
  } while (v >= 0x20);

  return {"number": num, "index": index};
}

function decodeSignedNumber(value,index) {
    var r = decodeNumber(value, index);
    var sgn_num = r.number;
    if ((sgn_num & 0x01) > 0) {
      sgn_num = ~(sgn_num);
    }
    r.number = sgn_num >> 1;
    return r;
}

function decodePoints(n) {
  var lat = 0;
  var lon = 0;

  var strIndex = 0;
  var points = new Array();

  while (strIndex < n.length) {

    var rLat = decodeSignedNumber(n, strIndex);
    lat = lat + rLat.number * 1e-5;
    strIndex = rLat.index;

    var rLon = decodeSignedNumber(n, strIndex);
    lon = lon + rLon.number * 1e-5;
    strIndex = rLon.index;

    //var p = new L.LatLng(lat,lon);

    points.push({lat:lat,lng:lon});
  }
  return points;
}

function viewMode(input, latlng) {

  var body = document.body;

  if (input === "map") {
    if (body.className === "") {
      body.className = "mapmode";
    }
  }

  if (input === "home") {
    if (body.className === "mapmode") {
      body.className = "";
    }
  }

  if (input === "toggle") {
    if (body.className === "") {
      body.className = "mapmode";
    } else {
      body.className = "";
    }
  }

  if(body.className == "mapmode") {
    window.setTimeout(refitMap, 340);
    window.setTimeout(refitMap, 810);
  }

}

function refitMap() {
  map.invalidateSize();
}

// adapted from http://stackoverflow.com/a/2880929
function getUrlParams() {
  var urlParams;
  var match,
  pl     = /\+/g,  // Regex for replacing addition symbol with a space
  search = /([^&=]+)=?([^&]*)/g,
  decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
  query  = window.location.search.substring(1);

  urlParams = {};
  while (match = search.exec(query))
    urlParams[decode(match[1])] = decode(match[2]);
  return urlParams;
};

function buildUrlParams(targets) {
  var str = '?';
  if(targets.from) {
    str += "from="+latlng2str(targets.from.getLatLng())+'&';
  }
  if(targets.to) {
    str += "to="+latlng2str(targets.to.getLatLng())+'&';
  }
  if(str.length == 1) str = '';
  return str;
};
