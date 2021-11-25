// Parameters
const width		= 750;
const height		= 750;
const defaultScale = 8700;
const centerLat	= 5.5;	
const centerLon  	= 52.2;
const scaleMinExtent = 1; // default scale
const scaleMaxExtent = 8;
const clickZoomScale = 5; // the scale to zoom to when region on the map is clicked
const covidObjectKey = "covidObjectData";
const gElemId = "gmap";
const mapDivId = "d3-map";

const total_reported_colors = ["#c7bc7b","#cacc43","#dfb236","#e2860e","#e25c0e"]
const hospital_admission_colors = ["#9dd1cd", "#5ecbfd", "#08a9e9", "#3d78f5", "#3f35d1"]
const deceased_colors = ["#9dd1a0", "#77f897", "#42f03c", "#22b61d", "#054b0b"]
const total_reported_ranges = [500,1000,1500,2000]
const hospital_admission_ranges = [250,500,750,1000]
const deceased_ranges = [100,200,300,400]

let colors = total_reported_colors
let ranges = total_reported_ranges
let active = d3.select(null); // used for zooming and reset zoom 

const svg = d3.select(`#${mapDivId}`)
    .append("svg")
	.attr("width", width)
	.attr("height", height);

// Adjust projection based on scale and center of the map 
const projection = d3.geoMercator()
    .center([centerLat, centerLon])     // GPS of location to zoom on
    .scale(defaultScale)                       // This is like the zoom
    .translate([ width/2, height/2 ])

// parsing date
const formatDate = d3.timeFormat("%Y-%m-%d")

// calculate geo path to be used for d tag in svg 
const path = d3.geoPath()
    .projection(projection)

function initLegend() {
    colors = (selectedCategory === "Covid-19 Infections") ? 
        total_reported_colors : (selectedCategory === "Hospital Admissions") ?
        hospital_admission_colors : deceased_colors
    ranges = (selectedCategory === "Covid-19 Infections") ? 
    total_reported_ranges : (selectedCategory === "Hospital Admissions") ?
    hospital_admission_ranges : deceased_ranges
    const legend = d3.select("body").append('svg')
    .attr('class', 'legend')
    .attr('width', 148)
    .attr('height', 148)
    .selectAll('g')
    .data(colors)
    .enter().append('g')
    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
    legend.append("rect")
    //that's 18px wide
    .attr("width", 18)
    //and 18px high
    .attr("height", 18)
    //then fill it will the color assigned by the scale
    .style("fill", function(d) {
        return d;
    });
    legend.append("text")
    .attr("x", 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .text(function(d) { 
            return (d === colors[0]) ? `0-${ranges[0]}`:
            (d === colors[1]) ? `${ranges[0]}-${ranges[1]}` :
            (d === colors[2]) ? `${ranges[1]}-${ranges[2]}` :
            (d === colors[3]) ? `${ranges[2]}-${ranges[3]}` : `${ranges[3]}+`;
    });
}
// handle zooming into an area that has been clicked, with reset (reset zoom to initial default scale)
let active = d3.select(null);
function reset() {
    active = d3.select(null);

    svg.transition()
    .duration(750)
    .call(zoom.transform, d3.zoomIdentity);
}
function mouseclicked(dataOfPath) {  
    if (active.node() === this) return reset();
    active = d3.select(this);

    var bounds = path.bounds(dataOfPath);
    var x = (bounds[0][0] + bounds[1][0]) / 2;
    var y = (bounds[0][1] + bounds[1][1]) / 2;
    var translate = [width / 2 - clickZoomScale * x, height / 2 - clickZoomScale * y];

    svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(clickZoomScale));
}

function zoomFunction() {
    d3.select("g").attr("transform", d3.event.transform);
}

// create zoom funcionality for panning and zooming on the map.
// call it on svg so that the zoom funcionality is used on the map.
const zoom = d3.zoom()
    .translateExtent([[0, 0], [width, height]])
    .scaleExtent([scaleMinExtent, scaleMaxExtent])
    .on("zoom", zoomFunction);
svg.call(zoom);

d3.helper = {};

d3.helper.tooltip = function(accessor){
    return function(selection){
        var tooltipDiv;
        var bodyNode = d3.select('body').node();

        selection.on("mouseover", function(d, i){
            d3.select(this)
            .transition(0)
            .style("stroke", "blue")
            .style("stroke-width", "2");

            // Clean up lost tooltips
            d3.select('body').selectAll('div.tooltip').remove();

            // Append tooltip
            tooltipDiv = d3.select('body').append('div').attr('class', 'tooltip');
            var absoluteMousePos = d3.mouse(bodyNode);
            tooltipDiv.style('left', (absoluteMousePos[0] + 10)+'px')
                .style('top', (absoluteMousePos[1] - 15)+'px')
                .style('position', 'absolute') 
                .style('z-index', 1001);
        })
        .on('mousemove', function(d, i) {
            // Move tooltip
            var absoluteMousePos = d3.mouse(bodyNode);
            tooltipDiv.style('left', (absoluteMousePos[0] + 10)+'px')
                .style('top', (absoluteMousePos[1] - 15)+'px');
            var tooltipText = accessor(d, i) || '';
            tooltipDiv.html(tooltipText);
        })
        .on("mouseout", function(d, i) {
            // Remove tooltip
            d3.select(this)
            .transition(0)
            .style("stroke", "black")
            .style("stroke-width", "1");
            
            tooltipDiv.remove();
        });
    };
};

function extractDateOnly(dateFormat) {
    return (new Date(dateFormat.getTime() - (dateFormat.getTimezoneOffset() * 60000 ))
        .toISOString()
        .split("T")[0]);
}

function municipalityCheck() {
    if (municipalityMode) {
        return joinMapCovidCumulativeData(municipalitiesJson, covidCumulative);
    } else {
        return joinMapCovidCumulativeData(provinceJson, covidCumulative);
    }
}

function joinMapCovidCumulativeData(mapData, covidData) {
    // DO SOME PREPROCESSING ON ALL THE DATA.
    const covidFilteredByDate = covidData.filter(obj => {
        if (municipalityMode) {
            if (obj.Municipality_code === '') return false;
        } else {
            if (obj.Municipality_code !== '') return false;
        }
        
        const objDateString = formatDate(new Date(obj.Date_of_report));
        return objDateString === selectedDate;
    });

    // JOIN DATA WITH NL.JSON DATA
    return mapData.features.map(e => {
        let placeObjRow;

        if (municipalityMode) {
            placeObjRow = covidFilteredByDate.filter(elem => {
                return e.properties.areaName.normalize('NFD').replace(/[\u0300-\u036f]/g, "") === 
                    elem.Municipality_name.normalize('NFD').replace(/[\u0300-\u036f]/g, ""); // remove accents from words
            });
        } else {
            placeObjRow = covidFilteredByDate.filter(elem => {
                return e.properties.name === elem.Province;
            });   
        }

        if (placeObjRow.length > 1) {
            return console.error(`Encountered multiple values while filtering for ${e.properties.areaName}. Result: ${placeObjRow}`);
        } 

        e.properties[covidObjectKey] = placeObjRow[0];
        return e;
    });
}

function fillLocations(d) {
    const covidD = d.properties[covidObjectKey];
    if (covidD !== undefined) {
        const category = (selectedCategory === "Covid-19 Infections") ? 
        +covidD.Total_reported : (selectedCategory === "Hospital Admissions") ?
        +covidD.Hospital_admission : +covidD.Deceased
        if (0 <= category && category <= ranges[0]) {
            return colors[0];
        } 
        for (let i = 1; i < ranges.length; i++) {
            if (ranges[i-1] < category && category <= ranges[i]) {
                return colors[i];
            }
        }
        return colors[colors.length - 1];
    } else {
        return "grey";
    }
}

function drawMap(data) {
    if (d3.select(`#${gElemId}`)) d3.select(`#${gElemId}`).remove();
    if (d3.select("svg.legend")) d3.select("svg.legend").remove();

    initLegend();

    // Load the polygon data of the Netherlands and show it.
    g = svg.append("g")
    .attr("id", gElemId)
    .attr("transform", d3.zoomIdentity);

    
    g.selectAll("path")
    .data(data)
    .enter()
    .append("path")
    .attr("d", path)
    .style("fill", fillLocations)
    .on("click", mouseclicked)
    .call(d3.helper.tooltip(
        function(d) {
            return "<b>"+ (municipalityMode ? d.properties.areaName : d.properties.name)  + "</b>" 
            + (
                (d.properties[covidObjectKey] !== undefined) 
                ? (
                    (selectedCategory === "Covid-19 Infections") ? "<br\/>Total_reported: " + d.properties[covidObjectKey].Total_reported 
                     : (selectedCategory === "Hospital Admissions") ? "<br\/>Hospital_admission: " + d.properties[covidObjectKey].Hospital_admission
                    : "<br\/>Deceased: " + d.properties[covidObjectKey].Deceased
                  ) 
                : ""
            );
        }
    ));
}



