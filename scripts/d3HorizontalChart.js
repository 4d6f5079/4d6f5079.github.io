
/**
 * Determines whether the header text message should contain municipality or province.
 * 
 * @returns Title to draw on the header of the horizontal bar chart
 */
function getTitleText() {
    const mode = municipalityMode ? "Municipalities" : "Provinces"
    return `${mode} with descending ${selectedCategory}`;
}

/**
 * Returns proper name based on municipality mode. 
 * Returns name of province in Province Mode.
 * Returns name of municipality in Municipality Mode.
 * 
 * @param {Object} d path data
 * @returns Correct area name.
 */
function getMode(d) {
    return municipalityMode ? d.properties.areaName : d.properties.name
}

/**
 * Checks selected category to derive which value to return.
 *  
 * @param {Object} covidD object containing quantitative values of an area 
 * @returns Integer value of the required quantitative value
 */
function getCategory(covidD) {
    return (selectedCategory === "COVID-19 Infections") ? 
        +covidD.Total_reported : (selectedCategory === "Hospital Admissions") ?
        +covidD.Hospital_admission : +covidD.Deceased;
}

/**
 * Wrapper function that does the same as getCategory function
 * but also checks for undefined values. 
 * 
 * @param {Object} d path object
 * @returns Integer value of the required quantitative value
 */
function getCatWithUndefCheck(d) {
    const covidD = d.properties[covidObjectKey]
    if (covidD !== undefined) {
        return getCategory(covidD);
    } else {
        return undefined;
    }
}

/**
 * Draws each municipality/province COVID-19 values on a horizontal bar chart.
 * 
 * @param {List[Object]} data Joined GeoJSON data with COVID-19 data.
 */
function drawHorizontalBarChart(data) {
    if (d3.select("svg.chart")) d3.select("svg.chart").remove();
    if (d3.select("svg.x-axis")) d3.select("svg.x-axis").remove();

    // set title 
    horizontalHeader.innerText = getTitleText();

    // set the dimensions and margins of the graph
    const margin = {top: 0, right: 30, bottom: 0, left: 220};
    const width = 920 - margin.left - margin.right;
    const height = (municipalityMode ? 5500 : 550) - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg_chart = d3.select("#horizontal-chart")
    .append("svg")
    .attr('class', 'chart')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");
    
    const topData = data.slice()
        .sort((a, b) => d3.descending(getCatWithUndefCheck(a), getCatWithUndefCheck(b)))

    const max = d3.max(topData, function (d) { 
            return getCatWithUndefCheck(d)
        });

    // Add X axis
    const x = d3.scaleLinear()
    .domain([0, max])
    .range([ 0, width]);

    const xAxis = d3.axisBottom(x);
    var xAxisSvg = d3.select('#xaxis').append('svg')
      .attr('class', 'x-axis')
      .attr("width", width + margin.left + margin.right)
      .attr("height", 20)
      .append("g");

    let xAxisDom = xAxisSvg.selectAll('.x.axis');

    if (xAxisDom.empty()) {
        xAxisDom = xAxisSvg.append("g")
            .attr("class", "x axis");
    }

    xAxisDom
    .attr("transform", "translate("+ margin.left +"," + margin.bottom + ")")
    .call(xAxis);

    xAxisDom
    .selectAll('.tick text')
    .text(function (d) { if (d < 0) return -d; else return d; });
      

    svg_chart.append("text")
    .attr("x", (width / 2))             
    .attr("y", 0 - (margin.top / 2))
    .attr("text-anchor", "middle")  
    .style("font-size", "30px") 
    .style("font-weight", "bold");  

    // Y axis
    const y = d3.scaleBand()
    .range([ 0, height ])
    .domain(topData.map(function(d) { return getMode(d); }))
    .padding(.1);

    svg_chart.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y));

    const defs = svg_chart.append('defs');
    const bgGradient = defs
    .append('linearGradient')
    .attr('id', 'bg-gradient');

    const startColor = (selectedCategory === "COVID-19 Infections") ? 
    "#F2C66B" : (selectedCategory === "Hospital Admissions") ?
    "#00FFFF" : "#ADFF2F";

    const stopColor = (selectedCategory === "COVID-19 Infections") ? 
    "#D13D73" : (selectedCategory === "Hospital Admissions") ?
    "#0000FF" : "#006400";

    bgGradient
    .append('stop')
    .attr('stop-color', startColor)
    .attr('offset', '0%');

    bgGradient
    .append('stop')
    .attr('stop-color', stopColor)
    .attr('offset', '100%');

    //Bars
    svg_chart.selectAll("myRect")
    .data(topData)
    .enter()
    .append("rect")
    .attr("x", x(0) )
    .attr("y", function(d) { return y(getMode(d)); })
    .attr("width", function(d) { return 0; })
    .attr("height", y.bandwidth() )
    .attr("fill", "url(#bg-gradient)")
    .call(d3.helper.tooltip(function(d) {
        return getCatWithUndefCheck(d);
    }, false))
    .transition()
    .duration(750)
    .delay(function (d, i) {
        return i * 15;
    })
    .attr("width",  d => { return x(getCatWithUndefCheck(d)); })
}