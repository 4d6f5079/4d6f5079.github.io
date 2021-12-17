const pieLegendClassName  = ".pie-legend";
const svgPieClassName = ".pie";
const pie_width = 500;
const pie_height = 500;
const radius = Math.min(pie_width, pie_width) / 2 - 10;
const dx = -80, dy = -30;

/**
 * Remove the pie chart from the page.
 */
function removePieChart() {
    if (d3.select(`g${pieLegendClassName}`)) d3.select(`g${pieLegendClassName}`).remove();
    if (d3.select(`svg${svgPieClassName}`)) d3.select(`svg${svgPieClassName}`).remove();
}

/**
 * Initialize legend corresponding to the pie chart given the colors and reference
 * to the svg chart.
 * 
 * @param {List[String]} colors 
 * @param {D3 Component} svg_chart 
 */
function initPieLegend(colors, svg_chart) {
    const legend = svg_chart.append("g")
            .attr('class', 'pie-legend')
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
        })
        .attr("transform", "translate(" + dx + "," + dy + ")")
        .attr("fill-opacity", 0)
        .transition().delay(2000).duration(1500)
        .attr("fill-opacity", 1)

    legend.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .text(function(d, i) { 
                return (i === 0) ? "COVID-19 Infections" : (i === 1) ? "Hospital Admissions" : "Deceased";
        })
        .attr("transform", "translate(" + dx + "," + dy + ")")
        .attr("fill-opacity", 0)
        .transition().delay(2000).duration(1500)
        .attr("fill-opacity", 1)
}

/**
 * Draws the pie chart given the data and location name.
 * 
 * @param {List[Object]} data COVID-19 data to use to draw the pie chart
 * @param {String} locationName The selected area on the map
 * @returns None
 */
function drawPieChart(data, locationName) {
    removePieChart();

    if (data !== undefined) {
        pieHeader.innerText = `Category distribution of ${locationName}`;
    } else {
        pieHeader.innerText = `Categories of ${locationName} are undefined`;
        return;
    }

    const topData = data.sort((a, b) => d3.descending(a,b))
    const sum = d3.sum(data);
    const colors = ["Red", "Blue", "Green"];

    const arc = d3.arc()
    .outerRadius(radius)

    const pie = d3.pie();

    const svg_chart = d3.select("#pie-chart").append("svg")
        .datum(topData)
        .attr('class', 'pie')
        .attr("width", pie_width)
        .attr("height", pie_height)
        .append("g")
        .attr("transform", "translate(" + pie_width / 2 + "," + pie_height / 2 + ")");
    
    const arcs = svg_chart.selectAll("g.arc")
    .data(pie)
    .enter().append("g")
    .attr("class", "arc");

    arcs
    .append("path")
    .attr("fill", function(d, i) {
        return colors[i]; 
    })
    .call(
        d3.helper.tooltip(function(d, i) {
            const percentage = (d.data/sum * 100);
            return `Amount: ${d.data}` + 
            "<br\/>" + `Amount in percentage: ${(Math.round(percentage * 1000) / 1000)}%`;
        }, true)
    )
    .transition()
        .ease(d3.easeBounce)
        .duration(1000)
        .attrTween("d", tweenPie)
    .transition()
        .ease(d3.easeElastic)
        .delay(function(d, i) { return 1000 + i * 50; })
        .duration(1500)
        .attrTween("d", tweenDonut)
    
    function tweenPie(b) {
        b.innerRadius = 0;
        const i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
        return function(t) { return arc(i(t)); };
    }
    
    function tweenDonut(b) {
        b.innerRadius = radius * .6;
        const i = d3.interpolate({innerRadius: 0}, b);
        return function(t) { return arc(i(t)); };
    }

    initPieLegend(colors, svg_chart);
}