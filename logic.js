//  satelite tile layer
var satelliteMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets-satellite',
    accessToken: 'pk.eyJ1IjoicmFjcXVlc3RhIiwiYSI6ImNqYWs5emMwYjJpM2EyenBsaWRjZ21ud2gifQ.af0ky4cpslCbwe--lCrjZA'
});

//  light Layer
var lightMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.light',
    accessToken: 'pk.eyJ1Ijoib2xhd3JlbmNlNzk5IiwiYSI6ImNqZXZvcTBmdDBuY3oycXFqZThzbjc5djYifQ.-ChNrBxEIvInNJWiHX5pXg'
});

// outdoors layer
var outdoorsMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.outdoors',
    accessToken: 'pk.eyJ1Ijoib2xhd3JlbmNlNzk5IiwiYSI6ImNqZXZvcTBmdDBuY3oycXFqZThzbjc5djYifQ.-ChNrBxEIvInNJWiHX5pXg'
});

// Store our API endpoints
// quake data link
var quakeLink = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// fault lines data link
var platesLink = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"

//  get request for quake data
d3.json(quakeLink, function(data){
   var quakeFeatures = data.features

   console.log(quakeFeatures)

    // save quake layer made from geojson 
   var quakes = L.geoJSON(quakeFeatures, {
    pointToLayer: function (feature, latlng) {
        return new L.circle(latlng, 
            {radius: getRadius(feature.properties.mag),
            fillColor: getColor(feature.properties.mag),
            fillOpacity: .7,
            stroke: true,
            color: "black",
            weight: .5

        })
        },
    
  // Give each feature a popup describing the place and time of the earthquake
    onEachFeature: function (feature, layer)
    {
        layer.bindPopup(
            "<h4 style='text-align:center;'>" + "Magnitude: " + feature.properties.mag  +
            "<h4 style='text-align:center;'>" + "Location: " + feature.properties.place  +
            "</h4><hr><p><strong>" + "Date Time: " + new Date(feature.properties.time) + "</p></strong> "
        )

    }

    });
  // Create a GeoJSON layer containing the features array on the earthquakeData object

  // Run the onEachFeature function once for each piece of data in the array

    d3.json(platesLink, function(data){
        
        var faultFeatures = data.features

        var styling = {
            "fillOpacity": 0
        }

        console.log(faultFeatures)
        var faults = L.geoJSON(faultFeatures, {
            style: function(feature){
                return styling
            }
        })

// Sending our earthquakes layer to the createMap function
        createMap(quakes, faults)
    })

    
});

// console.log(quakesLayer)

function getColor(markers) {
    return markers > 5  ? '#E31A1C' :
           markers > 4  ? '#ff7f50' :
           markers > 3  ? '#ffa500' :
           markers > 2  ? '#ffd700' :
           markers > 1  ? '#adff2f' :
                     '#00ff00';
}

function getRadius(value){
    return value*50000
}

console.log("made it here")

// Create Define layers control display text
function createMap(quakeLayer, faultLayer){
   var baseMaps = {
    "Satelite": satelliteMap,
    "Grayscale": lightMap,
    "Outdoors": outdoorsMap
  };
// Create overlay object to hold our overlay layer
var overlayMaps = {
    "Fault Lines": faultLayer,
    "Earthquakes": quakeLayer
 };


// Create our map, giving it the streetmap and earthquakes layers to display on load
var mymap = L.map('mapid', {
    center: [42.877742, -97.380979],
    zoom: 2.5,
    minZoom: 2.5,
    layers: [lightMap, faultLayer, quakeLayer],
    maxBounds: L.latLngBounds([90, -180], [-90, 180]),
    maxBoundsViscosity: 1,
    scrollWheelZoom: false
    
}); 

// Create Color label legend at the bottom

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (mymap) {

    var div = L.DomUtil.create('div', 'info legend'),
        magnitude = [0, 1, 2, 3, 4, 5],
        labels = [];

    div.innerHTML += '<p><u>Magnitude</u></p>'

    // loop and generate a label with a colored square for each density interval
    for (var i = 0; i < magnitude.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(magnitude[i] + 1) + '"></i> ' +
            magnitude[i] + (magnitude[i + 1] ? '&ndash;' + magnitude[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(mymap);

L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(mymap);
}



