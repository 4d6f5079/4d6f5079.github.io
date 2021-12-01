function getTitleText() {
    const mode = municipalityMode ? "Municipalities" : "Provinces"
    return `${mode} with descending ${selectedCategory}`;
}
function getMode(d) {
    return municipalityMode ? d.properties.areaName : d.properties.name
}
function getCategory(covidD) {
    return (selectedCategory === "Covid-19 Infections") ? 
        +covidD.Total_reported : (selectedCategory === "Hospital Admissions") ?
        +covidD.Hospital_admission : +covidD.Deceased;
}

function getCatWithUndefCheck(d) {
    const covidD = d.properties[covidObjectKey]
    if (covidD !== undefined) {
        const category = getCategory(covidD);
        return category;
    } else {
        return 0;
    }
}

function drawChart(data) {
    if (d3.select("svg.chart")) d3.select("svg.chart").remove();
    if (d3.select("svg.x-axis")) d3.select("svg.x-axis").remove();
    // set title 
    horizontalHeader.innerText = getTitleText()
    // set the dimensions and margins of the graph
    const margin = {top: 0, right: 30, bottom: 0, left: 220},
    width = 920 - margin.left - margin.right,
    height = (municipalityMode ? 5500 : 550) - margin.top - margin.bottom;

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

    const xAxis = d3.axisBottom(x)
    var xAxisSvg = d3.select('#xaxis').append('svg')
      .attr('class', 'x-axis')
      .attr("width", width + margin.left + margin.right)
      .attr("height", 20)
      .append("g")

    var xAxisDom = xAxisSvg.selectAll('.x.axis')
    if (xAxisDom.empty()) {
    xAxisDom = xAxisSvg.append("g")
        .attr("class", "x axis")
    }
    xAxisDom
    .attr("transform", "translate("+ margin.left +"," + margin.bottom + ")")
    .call(xAxis);

    xAxisDom
    .selectAll('.tick text')
    .text(function (d) { if (d < 0) return -d; else return d; })
      

    svg_chart.append("text")
    .attr("x", (width / 2))             
    .attr("y", 0 - (margin.top / 2))
    .attr("text-anchor", "middle")  
    .style("font-size", "30px") 
    .style("font-weight", "bold")  

    // Y axis
    const y = d3.scaleBand()
    .range([ 0, height ])
    .domain(topData.map(function(d) { return getMode(d); }))
    .padding(.1);
    svg_chart.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y))   

    const defs = svg_chart.append('defs');
    const bgGradient = defs
    .append('linearGradient')
    .attr('id', 'bg-gradient')
    // .attr('gradientTransform', 'rotate(90)');

    const startColor = (selectedCategory === "Covid-19 Infections") ? 
    "#F2C66B" : (selectedCategory === "Hospital Admissions") ?
    "#00FFFF" : "#ADFF2F";
    const stopColor = (selectedCategory === "Covid-19 Infections") ? 
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