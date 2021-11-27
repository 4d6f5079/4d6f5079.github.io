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

    // set the dimensions and margins of the graph
    const margin = {top: 50, right: 30, bottom: 80, left: 150},
    width = 800 - margin.left - margin.right,
    height = (municipalityMode ? 600 : 400) - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg_chart = d3.select("#horizontal-chart")
    .append("svg")
    .attr('class', 'chart')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");
    
    const top30Data = data.slice()
        .sort((a, b) => d3.descending(getCatWithUndefCheck(a), getCatWithUndefCheck(b)))
        .filter(function(d, i) { return i >= 0 && i < 30; })
    const max = d3.max(top30Data, function (d) { 
            return getCatWithUndefCheck(d)
        });

    // Add X axis
    const x = d3.scaleLinear()
    .domain([0, max])
    .range([ 0, width]);
    svg_chart.append("text")
    .attr("x", (width / 2))             
    .attr("y", 0 - (margin.top / 2))
    .attr("text-anchor", "middle")  
    .style("font-size", "30px") 
    .style("font-weight", "bold")  
    .text(getTitleText());
    svg_chart.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Y axis
    const y = d3.scaleBand()
    .range([ 0, height ])
    .domain(top30Data.map(function(d) { return getMode(d); }))
    .padding(.1);
    svg_chart.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y))   

    const defs = svg_chart.append('defs');
    const bgGradient = defs
    .append('linearGradient')
    .attr('id', 'bg-gradient')
    // .attr('gradientTransform', 'rotate(90)');
    bgGradient
    .append('stop')
    .attr('stop-color', '#F2C66B')
    .attr('offset', '0%');
    bgGradient
    .append('stop')
    .attr('stop-color', '#D13D73')
    .attr('offset', '100%');
    //Bars
    svg_chart.selectAll("myRect")
    .data(top30Data)
    .enter()
    .append("rect")
    .attr("x", x(0) )
    .attr("y", function(d) { return y(getMode(d)); })
    .attr("width", function(d) { return x(getCatWithUndefCheck(d)); })
    .attr("height", y.bandwidth() )
    .attr("fill", "url(#bg-gradient)")
    .call(d3.helper.tooltip(function(d) {
        return getCatWithUndefCheck(d);
    }, false))
}