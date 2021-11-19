// Parameters
var width		= 750,
    height		= 750,
    defaultScale = 8700,
    centerLat	= 5.5,	
    centerLon  	= 52.2;

var scaleMinExtent = 1; // = default scale
var scaleMaxExtent = 8; 
var translateMaxXExtent = width; 
var translateMaxYExtent = height;

// Append svg to body 
var svg = d3.select("#d3-map")
    .append("svg")
	.attr("width", width)
	.attr("height", height);
var g = svg.append("g");

// Adjust projection based on scale and center of the map 
var projection = d3.geoMercator()
    .center([centerLat, centerLon])     // GPS of location to zoom on
    .scale(defaultScale)                       // This is like the zoom
    .translate([ width/2, height/2 ])

// calculate geo path to be used for d tag in svg 
var path = d3.geoPath()
    .projection(projection)

var mouseclicked = function(event) {
    return; // TODO: zoom in to the place where the cursor is 
}

var zoomFunction = function(event) {
    g.selectAll("path").attr("transform", event.transform);
}

// create zoom funcionality for panning and zooming on the map.
// call it on svg so that the zoom funcionality is used on the map.
var zoom = d3.zoom()
    .scaleExtent([scaleMinExtent, scaleMaxExtent])
    .translateExtent([[0, 0], [translateMaxXExtent, translateMaxYExtent]])
    .on("zoom", zoomFunction);
svg.call(zoom);

// Load the polygon data of the Netherlands and show it.
d3.json("../data/nl.json").then(
    (json) => {
        g.selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", path)
        .on("click", mouseclicked)
        .on("mouseover", mouseover)
        .on("mouseleave", mouseleave)
    }
);

var mouseover = function() {
    d3.select(this).transition().style("fill", "blue");
}

var mouseleave = function() {
    d3.select(this).transition().style("fill", "grey");
}



