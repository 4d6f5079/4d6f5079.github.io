// Parameters
var width		= 750,
    height		= 750,
    defaultScale = 8700,
    centerLat	= 5.5,	
    centerLon  	= 52.2,
    scaleMinExtent = 1, // = default scale
    scaleMaxExtent = 8;

// Append svg to body 
var svg = d3.select("#d3-map")
    .append("svg")
	.attr("width", width)
	.attr("height", height)
    .on("click", stopEventPropagation, true);
var g = svg.append("g");

// Adjust projection based on scale and center of the map 
var projection = d3.geoMercator()
    .center([centerLat, centerLon])     // GPS of location to zoom on
    .scale(defaultScale)                       // This is like the zoom
    .translate([ width/2, height/2 ])

// calculate geo path to be used for d tag in svg 
var path = d3.geoPath()
    .projection(projection)

// handle zooming into an area that has been clicked, with reset (reset zoom to initial default scale)
var active = d3.select(null);
function reset() {
    active = d3.select(null);
  
    svg.transition()
      .duration(750)
      .call(zoom.transform, d3.zoomIdentity); // updated for d3 v4
}
var mouseclicked = function(d) {  
    if (active.node() === this) return reset();
    active = d3.select(this).classed("active", true);

    var bounds = path.bounds(d),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = Math.max(1, Math.min(8, .9 / Math.max(dx / width, dy / height))),
        translate = [width / 2 - scale * x, height / 2 - scale * y];

    svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
}

var zoomFunction = function() {
    g.selectAll("path").attr("transform", d3.event.transform);
}

// To prevent drag behavior when area is clicked.
function stopEventPropagation() {
    if (d3.event.defaultPrevented) d3.event.stopPropagation();
}

// create zoom funcionality for panning and zooming on the map.
// call it on svg so that the zoom funcionality is used on the map.
var zoom = d3.zoom()
    .scaleExtent([scaleMinExtent, scaleMaxExtent])
    .translateExtent([[0, 0], [width, height]])
    .on("zoom", zoomFunction);
svg.call(zoom);

// Load the polygon data of the Netherlands and show it.
d3.json("../data/nl.json", function(error, json) {
    if (error) throw error;
    g.selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", path)
        .on("click", mouseclicked)
        .on("mouseover", mouseover)
        .on("mouseleave", mouseleave)
});

var mouseover = function() {
    d3.select(this)
    .transition(0)
    .style("stroke", "blue")
    .style("stroke-width", "4");
}

var mouseleave = function() {
    d3.select(this)
    .transition(0)
    .style("stroke", "black")
    .style("stroke-width", "1");
}



