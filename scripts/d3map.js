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
const total_reported_ranges_municipalities = [1000,2000,3000,4000]
const total_reported_ranges_provinces = [30000,60000,90000,120000]
const hospital_admission_ranges_municipalities = [50,100,150,200]
const hospital_admission_ranges_provinces = [1500,3000,4500,6000]
const deceased_ranges_municipalities = [50,100,150,200]
const deceased_ranges_provinces = [600,1200,1800,2400]

let colors = total_reported_colors
let ranges = total_reported_ranges_municipalities
let zoomActive = d3.select(null); // used for zooming and reset zoom 

const svg = d3.select(`#${mapDivId}`)
    .append("svg")
	.attr("width", width)
	.attr("height", height)
    .on("click", function() { return reset() });

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

/**
 * Initialize the legend of the map
 */
function initLegend() {
    colors = (selectedCategory === "COVID-19 Infections") ? 
        total_reported_colors : (selectedCategory === "Hospital Admissions") ?
        hospital_admission_colors : deceased_colors;

    ranges = (selectedCategory === "COVID-19 Infections") ? 
                (municipalityMode ? total_reported_ranges_municipalities : total_reported_ranges_provinces) :
            (selectedCategory === "Hospital Admissions") ?
                (municipalityMode ? hospital_admission_ranges_municipalities : hospital_admission_ranges_provinces) : 
                (municipalityMode ? deceased_ranges_municipalities : deceased_ranges_provinces);

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

/**
 * Reset zooming of the map (reset zoom to initial default scale)
 */
function reset() {
    zoomActive = d3.select(null);

    svg.transition()
    .duration(750)
    .call(zoom.transform, d3.zoomIdentity);
}

/**
 * Handles the logic when an area is clicked. 
 * 1. selectedPlace variable is assigned to the area name of the selected area.
 * 2. zoomActive is assigned the node of the selected area, for reset functionality to work.
 * 3. Draw the pie and line charts of the current selected area using the dataOfPath object.
 * 4. Zoom in to the selected area using zoom transition to the area given the zoomScale value.
 * 5. Smoothly scroll to the bottom of the page as the pie and line charts are drawn for convenience.
 * 
 * @param {Object} dataOfPath The object of the selected area on the map 
 * @returns None
 */
function mouseclicked(dataOfPath) {  
    if (zoomActive.node() === this) return reset();
    
    if(municipalityMode) {
        selectedPlace = selectedPlace === undefined ? dataOfPath.properties.areaName : 
        selectedPlace === dataOfPath.properties.areaName ? null : dataOfPath.properties.areaName;
    } else {
        selectedPlace = selectedPlace === undefined ? dataOfPath.properties.name : 
        selectedPlace === dataOfPath.properties.name ? null : dataOfPath.properties.name;
    }

    zoomActive = d3.select(this);
    d3.event.stopPropagation();

    drawPieChart(getCategoriesOf(dataOfPath), getMode(dataOfPath));
    drawLineChart(covidCumulative);

    const bounds = path.bounds(dataOfPath);
    const x = (bounds[0][0] + bounds[1][0]) / 2;
    const y = (bounds[0][1] + bounds[1][1]) / 2;
    const translate = [width / 2 - clickZoomScale * x, height / 2 - clickZoomScale * y];

    svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(clickZoomScale));

    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

/**
 * Executes the zoom transformation to the selected area.
 */
function zoomFunction() {
    d3.select(`#${gElemId}`).attr("transform", d3.event.transform);
}

// Create zoom funcionality for panning and zooming on the map.
// Call it on svg so that the zoom funcionality is used on the map.
const zoom = d3.zoom()
    .translateExtent([[0, 0], [width, height]])
    .scaleExtent([scaleMinExtent, scaleMaxExtent])
    .on("zoom", zoomFunction);

// Finally, call the zoom function on the svg directly.
svg.call(zoom);

// Tooltip object for showing a tooltip on the hovered area on the map.
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

/**
 * Group COVID-19 data by province key and aggregates the quantitative values of each province.
 * 
 * @param {List[Object]} data The COVID-19 data 
 * @returns 
 *  List of objects with key being the province name and the value being the summed
 *  COVID-19 infections, hospital admissions and deceased cases.
 */
function groupByValueAndSum(data) {
    const result = [];

    data.reduce((res, value) => {
        if (!res[value.Province]) {
            res[value.Province] = { Province: value.Province,  Total_reported: 0, Hospital_admission: 0, Deceased: 0};
            result.push(res[value.Province])
        }
        res[value.Province].Total_reported += +value.Total_reported;
        res[value.Province].Hospital_admission += +value.Hospital_admission;
        res[value.Province].Deceased += +value.Deceased;
        return res;
    }, {})

    return result;
}

/**
 * Wrapper function that checks the municipality mode and
 * joins the correct GeoJSON data with the COVID-19 data.
 * 
 * @returns 
 * List of object, each containing geo-sptial path information 
 * for each area on the map combined with COVID-19 data. 
 */
function joinCorrectGeoJSONDataWithCovidData() {
    if (municipalityMode) {
        return joinMapCovidCumulativeData(municipalitiesJson, covidCumulative);
    } else {
        return joinMapCovidCumulativeData(provinceJson, covidCumulative);
    }
}

/**
 * Link the GeoJSON data with COVID-19 data by joining them.
 * 
 * @param {Object} mapData The GeoJSON object data
 * @param {List[Object]} covidData 
 * @returns 
 *  List of object, each containing geo-sptial path information 
 *  for each area on the map combined with COVID-19 data.
 */
function joinMapCovidCumulativeData(mapData, covidData) {
    // Filter the COVID-19 data based on the selected date.
    const covidFilteredByDate = covidData.filter(obj => {
        if (obj.Municipality_code === '') return false;
        
        const objDateString = formatDate(new Date(obj.Date_of_report));
        return objDateString === selectedDate;
    });

    // Join filtered COVID-19 data with GeoJSON data.
    return mapData.features.map(e => {
        let placeObjRow;
        
        if (!municipalityMode) {
            // Aggregate COVID-19 data when province mode is selected based on province key.
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

        e.properties[covidObjectKey] = placeObjRow[0];
        return e;
    });
}

/**
 * Fetch an array of quantitative data corresponding to the selected area.
 *  
 * @param {Object} locationData path data of the selected area
 * @returns 
 *  List of COVID-19 infections, hosital admissions and deceased values of the selected area.
 */
function getCategoriesOf(locationData) {
    const covidD = locationData.properties[covidObjectKey];
    if (covidD !== undefined) {
        return [+covidD.Total_reported, +covidD.Hospital_admission, +covidD.Deceased];
    } else {
        return undefined;
    }
}

/**
 * Derive the correct fill color for a path on the map.
 * 
 * @param {Object} d path object of an area
 * @returns Correct fill color of a path on the map. 
 */
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

/**
 * Derive correct message to show on the tooltip when area on the map is hovered
 * based on municipality mode and selected category.
 * 
 * @param {Object} d path object of an area
 * @returns Correct message to show on the tooltip. 
 */
function tooltipText(d) {
    return "<b>"+ (municipalityMode ? d.properties.areaName : d.properties.name)  + "</b>" 
    + (
        (d.properties[covidObjectKey] !== undefined) 
        ? (
            (selectedCategory === "COVID-19 Infections") ? "<br\/>COVID-19 Infections: " + d.properties[covidObjectKey].Total_reported 
                : (selectedCategory === "Hospital Admissions") ? "<br\/>Hospital Admissions: " + d.properties[covidObjectKey].Hospital_admission
            : "<br\/>Deceased cases: " + d.properties[covidObjectKey].Deceased
            ) 
        : ""
    );
}

/**
 * Clean/reset the map and legend to add new data to it. 
 */
function removeMap() {
    if (d3.select(`#${gElemId}`)) d3.select(`#${gElemId}`).remove();
    if (d3.select(`g${legendClass}`)) d3.select(`g${legendClass}`).remove();
}

/**
 * Draw the map on the page using the joined GeoJSON and COVID-19 data.
 * 
 * @param {List[Object]} data Joined GeoJSON data with COVID-19 data.
 */
function drawMap(data) {
    removeMap();
    
    // initialize the legend for the map.
    initLegend();
    
    // if the map is zoomed in already, reset the zoom when the map is drawn again.
    if (zoomActive) reset(); 

    // Append the g element where the paths will be stored and reset zoom if active.
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
