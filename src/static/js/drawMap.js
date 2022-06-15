import {
  STANDARD_STYLE,
  RADIUS_BOX,
  HIGHLIGHT_STYLE,
} from "/static/js/staticValues.js";

export function drawMap(geoJson) {
  const map = L.map("map", {
    center: [46.825, 10.835],
    zoom: 11,
    fullscreenControl: true,
  });
  const mpBox_url =
    "https://api.mapbox.com/styles/v1/niklasnoldin/cl4fevjj6001515meu72qb82f/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoibmlrbGFzbm9sZGluIiwiYSI6ImNqaGh0NWxzZDF4cGczNnFvbnd0ZHJjbHEifQ.9yoH6H8i310Snle05XVYGA";
  L.tileLayer(mpBox_url, {
    maxZoom: 19,
    attribution: "© MapBoxStudio",
  }).addTo(map);

  const rect = createViewRectangle();
  createGpxLayer(map, geoJson, rect);
}

function createGpxLayer(map, geoJsonData, rect) {
  const gpx = L.geoJSON(geoJsonData)
    .on("loaded", function (e) {
      map.fitBounds(e.target.getBounds());
    })
    .addTo(map);
  rect.bringToFront();
  gpx.setStyle(STANDARD_STYLE);
  gpx.on("mouseover", function (e) {
    const line = e.sourceTarget;
    // console.log(line.feature.properties.time);
    // console.log(line.getBounds().getCenter());

    // Add a red rectange if zoomed out
    if (map.getZoom() < 13) {
      const bounds = line.getBounds().getCenter().toBounds(RADIUS_BOX);
      rect.setBounds(bounds);
      map.addLayer(rect);
    } else {
      map.removeLayer(rect);
    }

    // UPDATE OTHER CHARTS HERE

    // line.feature.properties.time will return a list with all timestamps in this segment

    line.setStyle(HIGHLIGHT_STYLE);
  });
  gpx.on("mouseout", function (e) {
    const line = e.sourceTarget;
    line.setStyle(STANDARD_STYLE);
    // map.removeLayer(rect);
  });
  return gpx;
}

function createViewRectangle() {
  // We create a rectangle around the selected item to make it more visible. If zooomed in, we will remove it.
  const bounds = L.latLng(46.817573, 10.868854).toBounds(RADIUS_BOX);
  const view_rect = L.rectangle(bounds);
  view_rect.setStyle({
    color: "currentColor",
    opacity: 1,
    weight: 2,
  });
  return view_rect;
}
