function create_gpx_layer(map, geoJsonData, rect) {
    var gpx = L.geoJSON(geoJsonData).on('loaded', function (e) {
        map.fitBounds(e.target.getBounds());
    }).addTo(map);
    rect.bringToFront();
    gpx.setStyle(STANDARD_STYLE);
    gpx.on('mouseover', function (e) {
        var line = e.sourceTarget;
        // console.log(line.feature.properties.time)
        // console.log(line.getBounds().getCenter())

        // Add a red rectange if zoomed out
        if (map.getZoom() < 15) {
            var bounds = line.getBounds().getCenter().toBounds(RADIUS_BOX);
            rect.setBounds(bounds)
            map.addLayer(rect);
        } else {
            map.removeLayer(rect);
        }


        // UPDATE OTHER CHARTS HERE

        // line.feature.properties.time will return a list with all timestamps in this segment


        line.setStyle(HIGHLIGHT_STYLE);
    });
    gpx.on('mouseout', function (e) {
        var line = e.sourceTarget;
        line.setStyle(STANDARD_STYLE);
         // map.removeLayer(rect);
    });
    return gpx;
}

function create_view_rectangle() {
    // We create a rectangle around the selected item to make it more visible. If zooomed in, we will remove it.
    let bounds = L.latLng(46.817573, 10.868854).toBounds(RADIUS_BOX);
    var view_rect = L.rectangle(bounds);
    view_rect.setStyle({
        color: '#D91616',
        opacity: 1,
        weight: 2
    });
    return view_rect;
}