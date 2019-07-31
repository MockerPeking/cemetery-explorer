var map, featureList, notableGraveSearch = [];

$(window).resize(function() {
  sizeLayerControl();
});

$(document).on("click", ".feature-row", function(e) {
  $(document).off("mouseout", ".feature-row", clearHighlight);
  sidebarClick(parseInt($(this).attr("id"), 10));
});

if ( !("ontouchstart" in window) ) {
  $(document).on("mouseover", ".feature-row", function(e) {
    highlight.clearLayers().addLayer(L.circleMarker([$(this).attr("lat"), $(this).attr("lng")], highlightStyle));
  });
}

$(document).on("mouseout", ".feature-row", clearHighlight);

$("#about-btn").click(function() {
  $("#aboutModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#full-extent-btn").click(function() {
  map.fitBounds(notableGraves.getBounds());
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#legend-btn").click(function() {
  $("#legendModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#login-btn").click(function() {
  $("#loginModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#list-btn").click(function() {
  animateSidebar();
  return false;
});

$("#nav-btn").click(function() {
  $(".navbar-collapse").collapse("toggle");
  return false;
});

$("#sidebar-toggle-btn").click(function() {
  animateSidebar();
  return false;
});

$("#sidebar-hide-btn").click(function() {
  animateSidebar();
  return false;
});

function animateSidebar() {
  $("#sidebar").animate({
    width: "toggle"
  }, 350, function() {
    map.invalidateSize();
  });
}

function sizeLayerControl() {
  $(".leaflet-control-layers").css("max-height", $("#map").height() - 50);
}

function clearHighlight() {
  highlight.clearLayers();
}

function sidebarClick(id) {
  var layer = markerClusters.getLayer(id);
  map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 17);
  layer.fire("click");
  /* Hide sidebar and go to the map on small screens */
  if (document.body.clientWidth <= 767) {
    $("#sidebar").hide();
    map.invalidateSize();
  }
}

function syncSidebar() {
  /* Empty sidebar features */
  $("#feature-list tbody").empty();
  /* Loop through notable graves layer and add only features which are in the map bounds */
  notableGraves.eachLayer(function (layer) {
    if (map.hasLayer(notableGraveLayer)) {
      if (map.getBounds().contains(layer.getLatLng())) {
        $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="20" height="20" src="assets/images/tombstone.png"></td><td class="feature-name">' + layer.feature.properties.Full_Name + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      }
    }
  });
  /* Update list.js featureList */
  featureList = new List("features", {
    valueNames: ["feature-name"]
  });
  featureList.sort("feature-name", {
    order: "asc"
  });
}

/* Basemap Layers */
var cartoLight = L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>'
});
var usgsImagery = L.layerGroup([L.tileLayer("http://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}", {
  maxZoom: 15,
}), L.tileLayer.wms("http://raster.nationalmap.gov/arcgis/services/Orthoimagery/USGS_EROS_Ortho_SCALE/ImageServer/WMSServer?", {
  minZoom: 16,
  maxZoom: 19,
  layers: "0",
  format: 'image/jpeg',
  transparent: true,
  attribution: "Aerial Imagery courtesy USGS"
})]);

var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

/* Overlay Layers */
var highlight = L.geoJson(null);
var highlightStyle = {
  stroke: false,
  fillColor: "#00FFFF",
  fillOpacity: 0.7,
  radius: 10
};

// road network
var roadNetwork = L.geoJson(null, {
  style: function (feature) {
    return {
      color: "black",
      weight: 3,
      opacity: 1
    };
  }
});
$.getJSON("data/network.geojson", function (data) {
  roadNetwork.addData(data);
});

// Predefined tours
var athleteTour = L.geoJson(null, {
  style: function (feature) {
    return {
      color: "blue",
      weight: 3,
      opacity: 1
    };
  }
});
$.getJSON("data/routes/Athlete.geojson", function (data) {
  athleteTour.addData(data);
});

var militarTour = L.geoJson(null, {
  style: function (feature) {
    return {
      color: "orange",
      weight: 3,
      opacity: 1
    };
  }
});
$.getJSON("data/routes/Militar.geojson", function (data) {
  militarTour.addData(data);
});

var politicianTour = L.geoJson(null, {
  style: function (feature) {
    return {
      color: "yellow",
      weight: 3,
      opacity: 1
    };
  }
});
$.getJSON("data/routes/Politician.geojson", function (data) {
  politicianTour.addData(data);
});

var scientistTour = L.geoJson(null, {
  style: function (feature) {
    return {
      color: "red",
      weight: 3,
      opacity: 1
    };
  }
});
$.getJSON("data/routes/Scientist.geojson", function (data) {
  scientistTour.addData(data);
});

/* Single marker cluster layer to hold all clusters */
var markerClusters = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 16
});

/* Empty layer placeholder to add to layer control for listening when to add/remove theaters to markerClusters layer */
var notableGraveLayer = L.geoJson(null);
var notableGraves = L.geoJson(null,{
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: "assets/images/tombstone.png",
        iconSize: [20, 20],
        iconAnchor: [12, 28],
        popupAnchor: [0, -25]
      }),
      title: feature.properties.Full_Name,
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var featureImage = '<img src=' + feature.properties.PhotoURL +  ' class="img-responsive fit-image">';
      var shortContent = "<table class='table table-striped table-bordered table-condensed'>" +
      "<tr><th>Name</th><td>" + feature.properties.Full_Name + "</td></tr>" +
      "<tr><th>Title</th><td>" + (feature.properties.Titles || "-") + "</td></tr>" +
      "<tr><th>Birth Date</th><td>" + (feature.properties.Birth || "N/A") + "</td></tr>" +
      "<tr><th>Death Date</th><td>" + (feature.properties.Death || "N/A") + "</td></tr>" +
      "<table>";
      var featureDescription;
      if (feature.properties.File_Name === ''){
        feature.properties.File_Name = 'lorem-ipsum.txt'
      }
      var descriptionURL = 'data/descriptions/' + feature.properties.File_Name;
      var featureAudio = '<audio controls> <source src="data/audio/' + feature.properties.Audio + '" type="audio/mpeg">Story</audio>';
      // read text from URL location
      var request = new XMLHttpRequest();
      request.open('GET', descriptionURL, true);
      request.send(null);
      request.onreadystatechange = function () {
          if (request.readyState == 4 && request.status === 200) {
              var type = request.getResponseHeader('Content-Type');
              if (type.indexOf("text") !== 1) {
                featureDescription = request.responseText;
              }
          }
      }

      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.Full_Name);
          $("#feature-image").html(featureImage);
          $("#feature-short-content").html(shortContent);
          $("#feature-description").html(featureDescription);
          $("#feature-audio").html(featureAudio);
          $("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
        }
      });
      $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="20" height="20" src="assets/images/tombstone.png"></td><td class="feature-name">' + layer.feature.properties.NAME + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      notableGraveSearch.push({
        name: layer.feature.properties.Full_Name,
        source: "Notable Graves",
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
  }
});
$.getJSON("data/notables.geojson", function (data) {
  notableGraves.addData(data);
  map.addLayer(notableGraveLayer);
});

map = L.map("map", {
  zoom: 10,
  center: [42.70806124627294764, -73.73052408961893889],
  layers: [Esri_WorldImagery, roadNetwork, markerClusters, highlight],
  zoomControl: false,
  attributionControl: false
});

/* Layer control listeners that allow for a single markerClusters layer */
map.on("overlayadd", function(e) {
  if (e.layer === notableGraveLayer) {
    markerClusters.addLayer(notableGraves);
    syncSidebar();
  }
});

map.on("overlayremove", function(e) {
  if (e.layer === notableGraveLayer) {
    markerClusters.removeLayer(notableGraves);
    syncSidebar();
  }

});

/* Filter sidebar feature list to only show features in current map bounds */
map.on("moveend", function (e) {
  syncSidebar();
});

/* Clear feature highlight when map is clicked */
map.on("click", function(e) {
  highlight.clearLayers();
});

/* Attribution control */
function updateAttribution(e) {
  $.each(map._layers, function(index, layer) {
    if (layer.getAttribution) {
      $("#attribution").html((layer.getAttribution()));
    }
  });
}
map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);

var attributionControl = L.control({
  position: "bottomright"
});
attributionControl.onAdd = function (map) {
  var div = L.DomUtil.create("div", "leaflet-control-attribution");
  div.innerHTML = "<span class='hidden-xs'>Developed by <a href='https://github.com/ismailsunni'>@ismailsunni</a> | </span><a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
  return div;
};
// map.addControl(attributionControl);

var zoomControl = L.control.zoom({
  position: "bottomright"
}).addTo(map);

/* GPS enabled geolocation control set to follow the user's location */
var locateControl = L.control.locate({
  position: "bottomright",
  drawCircle: true,
  follow: true,
  setView: true,
  keepCurrentZoomLevel: true,
  markerStyle: {
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.8
  },
  circleStyle: {
    weight: 1,
    clickable: false
  },
  icon: "fa fa-location-arrow",
  metric: false,
  strings: {
    title: "My location",
    popup: "You are within {distance} {unit} from this point",
    outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
  },
  locateOptions: {
    maxZoom: 18,
    watch: true,
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 10000
  }
}).addTo(map);

/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}

var baseLayers = {
  "ESRI World Image": Esri_WorldImagery,
  "Street Map": cartoLight,
  // Very slow
  // "Aerial Imagery": usgsImagery,

};

var groupedOverlays = {
  "Points of Interest": {
    "<img src='assets/images/tombstone.png' width='20' height='20'>&nbsp;Notable Graves": notableGraveLayer,
    "<img src='assets/images/work-tools.png' width='20' height='20'>&nbsp;Road": roadNetwork,
  },
  "Predefined Tours": {
    "Scientist": scientistTour,
    "Military": militarTour,
    "Politician": politicianTour,
    "Athlete": athleteTour
  }
};

var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, {
  collapsed: isCollapsed
}).addTo(map);

/* Highlight search box text on click */
$("#searchbox").click(function () {
  $(this).select();
});

/* Prevent hitting enter from refreshing the page */
$("#searchbox").keypress(function (e) {
  if (e.which == 13) {
    e.preventDefault();
  }
});

$("#featureModal").on("hidden.bs.modal", function (e) {
  $(document).on("mouseout", ".feature-row", clearHighlight);
});

/* Typeahead search functionality */
$(document).one("ajaxStop", function () {
  $("#loading").hide();
  sizeLayerControl();
  /* Fit map to notable grave bounds */
  map.fitBounds(notableGraves.getBounds());
  featureList = new List("features", {valueNames: ["feature-name"]});
  featureList.sort("feature-name", {order:"asc"});

  var notableGravesBH = new Bloodhound({
    name: "Notable Graves",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.Full_Name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: notableGraveSearch,
    limit: 10
  });

  notableGravesBH.initialize();

  /* instantiate the typeahead UI */
  $("#searchbox").typeahead({
    minLength: 3,
    highlight: true,
    hint: false
  },
  {
    name: "NotableGraves",
    displayKey: "name",
    source: notableGravesBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/images/tombstone.png' width='20' height='20'>&nbsp;Notable Graves</h4>",
      // Check here
      suggestion: Handlebars.compile(["{{Full_Name}}<br>&nbsp;<small>{{address}}</small>"].join(""))
    }
  }
  ).on("typeahead:selected", function (obj, datum) {
    if (datum.source === "NotableGraves") {
      if (!map.hasLayer(notableGraveLayer)) {
        map.addLayer(notableGraveLayer);
      }
      map.setView([datum.lat, datum.lng], 17);
      if (map._layers[datum.id]) {
        map._layers[datum.id].fire("click");
      }
    }
    if ($(".navbar-collapse").height() > 50) {
      $(".navbar-collapse").collapse("hide");
    }
  }).on("typeahead:opened", function () {
    $(".navbar-collapse.in").css("max-height", $(document).height() - $(".navbar-header").height());
    $(".navbar-collapse.in").css("height", $(document).height() - $(".navbar-header").height());
  }).on("typeahead:closed", function () {
    $(".navbar-collapse.in").css("max-height", "");
    $(".navbar-collapse.in").css("height", "");
  });
  $(".twitter-typeahead").css("position", "static");
  $(".twitter-typeahead").css("display", "block");
});

// Leaflet patch to make layer control scrollable on touch browsers
var container = $(".leaflet-control-layers")[0];
if (!L.Browser.touch) {
  L.DomEvent
  .disableClickPropagation(container)
  .disableScrollPropagation(container);
} else {
  L.DomEvent.disableClickPropagation(container);
}

$(document).ready(function(){

  $('.next').click(function(){

    var nextId = $(this).parents('.tab-pane').next().attr("id");
    $('[href=#'+nextId+']').tab('show');
    return false;

  })

  $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {

    //update progress
    var step = $(e.target).data('step');
    var percent = (parseInt(step) / 4) * 100;

    $('.progress-bar').css({width: percent + '%'});
    $('.progress-bar').text("Step " + step + " of 4");

    //e.relatedTarget // previous tab

  })

  $('.first').click(function(){

    $('#myWizard a:first').tab('show')

  })
});

$( function() {
  $( "#datepicker" ).datepicker();
} );

$(document).ready(function () {
  $("#select-flower").imagepicker({
    hide_select : true,
    show_label  : true
  });

  // Does not work
  // var $container = $('.image_picker_selector');
  // initialize
  // $container.imagesLoaded(function () {
  //     $container.masonry({
  //         // columnWidth: 30,
  //         // itemSelector: '.thumbnail'
  //     });
  // });
});