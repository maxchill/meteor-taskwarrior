Meteor.subscribe('Coords');

Session.setDefault('maphidden', false)
Session.setDefault('travelmode', 'walking')

var map;
var directionsDisplay;
var directionsService;
var pointsArr = new Array();

Template.mapview.helpers({
  counter: function () {
    return Coords.find().count();
  },
  maphidden: function () {
    return Session.equals("maphidden", true)
  },
  walking: function () {
    if (Session.equals('travelmode', 'walking')) {
      return 'active'
    }
  },
  driving: function () {
    if (Session.equals('travelmode', 'driving')) {
      return 'active'
    }
  },
  biking: function () {
    if (Session.equals('travelmode', 'biking')) {
      return 'active'
    }
  },
  publictransportation: function () {
    if (Session.equals('travelmode', 'publictransportation')) {
      return 'active'
    }
  },
});

Template.mapview.events = {
  'click .choosebicycling': function (e,t) {
    Session.set('travelmode', 'biking')
  },
  'click .choosewalking': function (e,t) {
    Session.set('travelmode', 'walking')
  },
  'click .choosedriving': function (e,t) {
    Session.set('travelmode', 'driving')
  },
  'click .choosepublictransportation': function (e,t) {
    Session.set('travelmode', 'publictransportation')
  },
  'click .closemapsection': function(e,t) {
    Session.set('maphidden', true)
  },
  'click .openmapsection': function(e,t) {
    Session.set('maphidden', false)
    var latlng = Geolocation.latLng()
setTimeout(function() {
      // Create map
  mapOptions = {
    zoom: 16,
    center: latlng
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
    mapOptions);

  directionsService = new google.maps.DirectionsService();

  directionsDisplay = new google.maps.DirectionsRenderer();

  $('#directions-panel').empty()
  directionsDisplay.setMap(map);
  directionsDisplay.setPanel(document.getElementById('directions-panel'));

}, 1 * 1000);
  },
  'click #clearButton': function () {
    Meteor.call('removeAllCoords');
      // Create map
  mapOptions = {
    zoom: 16,
    center: Geolocation.latLng()
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
    mapOptions);

  directionsService = new google.maps.DirectionsService();

  directionsDisplay = new google.maps.DirectionsRenderer();

  $('#directions-panel').empty()
  directionsDisplay.setMap(map);
  directionsDisplay.setPanel(document.getElementById('directions-panel'));

  }
};

Template.mapview.rendered = function () {
  // Create map
if (Session.equals('maphidden', false)) {
  var mapOptions = {
    zoom: 16,
    center: new google.maps.LatLng(40.4378271, -3.6795367)
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
    mapOptions);

  directionsService = new google.maps.DirectionsService();

  directionsDisplay = new google.maps.DirectionsRenderer();

  directionsDisplay.setMap(map);
  directionsDisplay.setPanel(document.getElementById('directions-panel'));

} // Session map hidden false
};

function drawPath() {
  if (pointsArr.length >= 1) {
var origenlatlng = Geolocation.latLng()
console.log(origenlatlng)

      var origenlat = origenlatlng.lat
      var origenlng = origenlatlng.lng

      var startlatlng = new google.maps.LatLng(origenlat, origenlng);


    var origen = startlatlng;
    var destino = pointsArr[pointsArr.length - 1];
    var waypointsArr = new Array();
    if (pointsArr.length > 1) {

      pointsArr.forEach(function (item) {
        if (origen != item && destino != item) {
          waypointsArr.push({'location': item});
        }
      });
    }

if (Session.equals('travelmode', 'walking')) {
  var travelmode = google.maps.TravelMode.WALKING
}
else if (Session.equals('travelmode', 'driving')) {
  var travelmode = google.maps.TravelMode.DRIVING
}
else if (Session.equals('travelmode', 'publictransportation')) {
  var travelmode = google.maps.TravelMode.TRANSIT
} 
else if (Session.equals('travelmode', 'biking')) {
  var travelmode = google.maps.TravelMode.BICYCLING  
}

    var request = {
      origin: origen,
      waypoints: waypointsArr,
      destination: destino,
      travelMode: travelmode
    };
    directionsService.route(request, function (response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
      }
    });


    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directions-panel'));

  }
}

// Aqui esta la magia!!
// Se declara la dependencia para que al cambiar se actualice en todos los clientes
Tracker.autorun(function () {
  console.log('change');
  if (Taskspending.find({context: "navigation", tags: "mit"}, {sort: {rank: 1}})) {
    var allCoords = Taskspending.find({context: "navigation", tags: "mit"}, {sort: {rank: 1}});

    pointsArr = new Array();
    allCoords.forEach(function (coord) {
      // Add coordinates into the path
      var coords = coord.contextlocation.split(',')
      var lat = coords[0]
      var lng = coords[1]
      var latlng = new google.maps.LatLng(lat, lng);
      pointsArr.push(latlng);
    });
    drawPath();
  }
  else {
    if(directionsDisplay) {
      directionsDisplay.setMap(null);
      directionsDisplay.setPanel(null);
    }
  }
});
