// create varibles for API
var earthquakesURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var platesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
// get request for URL
d3.json(earthquakesURL, function (data) {
  // use createFeature 
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  // creation of layers
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3" > + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" +
      "</h3><hr><p>Magnitude:" + feature.properties.map + "</p>");
  }

  // creation of Geolayer
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: function (feature, latlng) {
      var geojsonMarkerOptions = {
        radius: 7 * feature.properties.mag,
        fillColor: getColor(feature.properties.mag),
        color: "lightblue",
        weight: 1,
        fillOpacity: 0.7
      };
      return L.circleMarker(latlng, geojsonMarkerOptions);
    }
  });

  // color scale based on magnitude
  function getColor(color) {
    return color <= 1 ? 'blue' :
      color <= 2.5 ? 'green' :
        color <= 4.5 ? 'yellow' :
          color <= 6.5 ? 'orange' :
            'red';
  }

    // placing earthquake layer to createMap function
    createMap(earthquakes);
  }

  function createMap(earthquakes) {
    var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.streets",
      accessToken: API_KEY
    });

    var comicmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.comic",
      accessToken: API_KEY
    });

    var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.satellite",
      accessToken: API_KEY
    });

    var terrainmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.mapbox-terrain-v2",
      accessToken: API_KEY
    });

    var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.light",
      accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
      "Street Map": streetmap,
      "Comic Map": comicmap,
      "Satellite Map": satellitemap,
      "Light Map": lightmap,
      "Terrain Map": terrainmap
    };

    var plate_tectonic = new L.LayerGroup();

    // adding fault lines
    d3.json(platesUrl, function (platesData) {
      L.geoJson(platesData, {
        color: "orange"
      })
        .addTo(plate_tectonic);
    });

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
      Earthquakes: earthquakes,
      "Tectonic Plates": plate_tectonic
    };

    // Create displays
    var myMap = L.map("map", {
      center: [
        50, -120
      ],
      zoom: 4,
      layers: [lightmap, earthquakes, plate_tectonic]
    });

    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

    // Create legend
    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (myMap) {

      var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2.5, 4.5, 6.5],
        labels = [];
      div.innerHTML = '<div><b>Diamond Williams<hr>A Legend</b></div';
      // // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
          '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }
      return div;
    };

    function getColor(color) {
      return color <= 1 ? 'blue' :
        color <= 2.5 ? 'green' :
          color <= 4.5 ? 'yellow' :
            color <= 6.5 ? 'orange' :
              'red';
    }

    legend.addTo(myMap);
  };
