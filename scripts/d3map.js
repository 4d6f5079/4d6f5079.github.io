// Parameters
const width		= 750;
const height		= 750;
const defaultScale = 8700;
const centerLat	= 5.5;	
const centerLon  	= 52.2;
const scaleMinExtent = 1; // default scale
const scaleMaxExtent = 8;
const clickZoomScale = 3.2; // Scale to zoom to (relative to defaultScale) when area on the map is clicked
const covidObjectKey = "covidObjectData"; // the key used to access the covid data object in properties of each path element
const gElemId = "gmap";
const mapDivId = "d3-map";
const legendClass = ".legend";

// For the colors, the first value is the unknown color and the remaining n colors are linked with n-1 ranges. 
const total_reported_colors = ["grey", "#c7bc7b","#cacc43","#dfb236","#e2860e","#e25c0e"]
const hospital_admission_colors = ["grey", "#9dd1cd", "#5ecbfd", "#08a9e9", "#3d78f5", "#3f35d1"]
const deceased_colors = ["grey", "#9dd1a0", "#77f897", "#42f03c", "#22b61d", "#054b0b"]
const total_reported_ranges = [500,1000,1500,2000]
const hospital_admission_ranges = [250,500,750,1000]
const deceased_ranges = [100,200,300,400]

let colors = total_reported_colors
let ranges = total_reported_ranges
let zoomActive = d3.select(null); // used for zooming and reset zoom 

const svg = d3.select(`#${mapDivId}`)
    .append("svg")
	.attr("width", width)
	.attr("height", height);

// Adjust projection based on scale and center of the map 
const projection = d3.geoMercator()
    .center([centerLat, centerLon])     // Geo locations to zoom on
    .scale(defaultScale)                // Default zoom
    .translate([ width/2, height/2 ])   // Place the zoomed on area in the middle of the svg

// formatting date from Date objects
const formatDate = d3.timeFormat("%Y-%m-%d");

// calculate geo path to be used for d tag in svg 
const path = d3.geoPath()
    .projection(projection)

function initLegend() {
    colors = (selectedCategory === "Covid-19 Infections") ? 
        total_reported_colors : (selectedCategory === "Hospital Admissions") ?
        hospital_admission_colors : deceased_colors;

    ranges = (selectedCategory === "Covid-19 Infections") ? 
        total_reported_ranges : (selectedCategory === "Hospital Admissions") ?
        hospital_admission_ranges : deceased_ranges;

    const legend = svg.append("g")
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
        .text(function(d, i) { 
                return (i === 0) ? `Unknown` : (i === 1) ? `0-${ranges[0]}`:
                (i > 1 && i < colors.length - 1) ? `${ranges[i-2]}-${ranges[i-1]}` :
                `${ranges[ranges.length - 1]}+`;
        });
}

// handle zooming into an area that has been clicked, with reset (reset zoom to initial default scale)
function reset() {
    zoomActive = d3.select(null);

    svg.transition()
    .duration(750)
    .call(zoom.transform, d3.zoomIdentity);
}

function mouseclicked(dataOfPath) {  
    if (zoomActive.node() === this) return reset();
    zoomActive = d3.select(this);
    
    d3.event.stopPropagation();

    var bounds = path.bounds(dataOfPath);
    var x = (bounds[0][0] + bounds[1][0]) / 2;
    var y = (bounds[0][1] + bounds[1][1]) / 2;
    var translate = [width / 2 - clickZoomScale * x, height / 2 - clickZoomScale * y];

    svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(clickZoomScale));
}

function zoomFunction() {
    d3.select(`#${gElemId}`).attr("transform", d3.event.transform);
}

// create zoom funcionality for panning and zooming on the map.
// call it on svg so that the zoom funcionality is used on the map.
const zoom = d3.zoom()
    .translateExtent([[0, 0], [width, height]])
    .scaleExtent([scaleMinExtent, scaleMaxExtent])
    .on("zoom", zoomFunction);

svg.call(zoom);

d3.helper = {};
d3.helper.tooltip = function(accessor, flag){
    return function(selection){
        let tooltipDiv;
        const bodyNode = d3.select('body').node();

        selection.on("mouseover", function(d, i){
            if (flag) {
                d3.select(this)
                .transition(0)
                .style("stroke", "blue")
                .style("stroke-width", "2");
            } else {
                d3.select(this)
                .transition(0)
                .style("stroke", "purple")
                .style("stroke-width", "2");
            }

            // Clean up lost tooltips
            d3.select('body').selectAll('div.tooltip').remove();

            // Append tooltip
            tooltipDiv = d3.select('body').append('div').attr('class', 'tooltip');
            const absoluteMousePos = d3.mouse(bodyNode);
            tooltipDiv.style('left', (absoluteMousePos[0] + 10)+'px')
                .style('top', (absoluteMousePos[1] - 15)+'px')
                .style('position', 'absolute') 
                .style('z-index', 1001);
        })
        .on('mousemove', function(d, i) {
            // Move tooltip
            const absoluteMousePos = d3.mouse(bodyNode);
            tooltipDiv.style('left', (absoluteMousePos[0] + 10)+'px')
                .style('top', (absoluteMousePos[1] - 15)+'px');
            const tooltipText = accessor(d, i) || '';
            tooltipDiv.html(tooltipText);
        })
        .on("mouseout", function(d, i) {
            // Remove tooltip
            if (flag) {
                d3.select(this)
                .transition(0)
                .style("stroke", "black")
                .style("stroke-width", "1");
            } else {
                d3.select(this)
                .transition(0)
                .style("stroke", "transparent")
                .style("stroke-width", "1");
            }
            
            tooltipDiv.remove();
        });
    };
};

function groupByValueAndSum(data) {
    const result = [];

    data.reduce((res, value) => {
        if (!res[value.Province]) {

            if (selectedCategory === "Covid-19 Infections") {
                res[value.Province] = { Province: value.Province,  Total_reported: 0 };
            } else if (selectedCategory === "Hospital Admissions") {
                res[value.Province] = { Province: value.Province,  Hospital_admission: 0 };
            } else if (selectedCategory === "Deceased") {
                res[value.Province] = { Province: value.Province,  Deceased: 0 };
            } else {
                console.warn(`Selected category= ${selectedCategory}. Not found when grouping and summing.`)
            }
            
            result.push(res[value.Province])
        }

        if (selectedCategory === "Covid-19 Infections") {
            res[value.Province].Total_reported += +value.Total_reported;
        } else if (selectedCategory === "Hospital Admissions") {
            res[value.Province].Hospital_admission += +value.Hospital_admission;
        } else if (selectedCategory === "Deceased") {
            res[value.Province].Deceased += +value.Deceased;
        } else {
            console.warn(`Selected category = ${selectedCategory}. Summing went wrong.`)
        }

        return res;
    }, {})

    return result;
}

function municipalityCheck() {
    if (municipalityMode) {
        return joinMapCovidCumulativeData(municipalitiesJson, covidCumulative);
    } else {
        return joinMapCovidCumulativeData(provinceJson, covidCumulative);
    }
}

function joinMapCovidCumulativeData(mapData, covidData) {
    // GET ONLY THE COVID DATA OF THE SELECTED DATE.
    const covidFilteredByDate = covidData.filter(obj => {
        if (obj.Municipality_code === '') return false;
        
        const objDateString = formatDate(new Date(obj.Date_of_report));
        return objDateString === selectedDate;
    });

    // JOIN PROCESSED COVID DATA WITH GEOJSON DATA.
    return mapData.features.map(e => {
        let placeObjRow;
        
        if (!municipalityMode) {
            // ONLY GET GROUPED AND SUMMED COVID DATA WHEN PROVINCE MODE IS SELECTED.
            const groupedSummedPerProvince = groupByValueAndSum(covidFilteredByDate);

            placeObjRow = groupedSummedPerProvince.filter(elem => {
                return e.properties.name === elem.Province;
            });
        } else {
            placeObjRow = covidFilteredByDate.filter(elem => {
                return e.properties.areaName === 
                    elem.Municipality_name;
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
        const category = getCategory(covidD);
        if (0 <= category && category <= ranges[0]) {
            return colors[1];
        } 
        for (let i = 1; i < ranges.length; i++) {
            if (ranges[i-1] < category && category <= ranges[i]) {
                return colors[i+1];
            }
        }
        return colors[colors.length - 1];
    } else {
        return colors[0];
    }
}

function tooltipText(d) {
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

function drawMap(data) {
    // Clean/reset the map and legend to add new data to it. 
    if (d3.select(`#${gElemId}`)) d3.select(`#${gElemId}`).remove();
    if (d3.select(`g${legendClass}`)) d3.select(`g${legendClass}`).remove();
    
    // initialize the legend for the map.
    initLegend();

    // Append the g element where the paths will be stored and reset zoom if active.
    if (zoomActive) reset(); 

    g = svg.append("g")
    .attr("id", gElemId)
    .attr("transform", d3.zoomIdentity);

    // Add paths for each data element and project geo coordinates on the map.
    g.selectAll("path")
    .data(data)
    .enter()
    .append("path")
    .attr("d", path)
    .style("fill", fillLocations)
    .on("click", mouseclicked)
    .call(d3.helper.tooltip(tooltipText, true));
}



