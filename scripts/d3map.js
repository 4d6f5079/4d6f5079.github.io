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

var centered;
function getMyCentroid(element) {
    var bbox = d3.select(element).node();
    return [bbox.x, bbox.y];
}
var mouseclicked = function(d) {  
    var x = 0,
      y = 0;

  // If the click was on the centered state or the background, re-center.
  // Otherwise, center the clicked-on state.
  if (!d || centered === d) {
    centered = null;
  } else {
    var centroid = getMyCentroid(d);
    x = width / 2 - centroid[0];
    y = height / 2 - centroid[1];
    centered = d;
  }

  // Transition to the new transform.
  g.transition()
      .duration(750)
      .attr("transform", "translate(" + x + "," + y + ")");
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



