const pieLegendClassName  = "pie-legend";
const pie_width = 500,
    pie_height = 500,
    radius = Math.min(pie_width, pie_width) / 2 - 10;
const dx = -80, dy = -30;
function setupLegend(colors, svg_chart) {
    const legend = svg_chart.append("g")
        .attr('class', pieLegendClassName)
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
        .attr("transform", "translate(" + dx + "," + dy + ")");
    return legend;
}
function initPieLegend(colors, svg_chart) {
    const legend = setupLegend(colors, svg_chart);
    legend.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .text(function(d, i) { 
                return (i === 0) ? "Covid-19 Infections" : (i === 1) ? "Hospital Admissions" : "Deceased";
        })
        .attr("transform", "translate(" + dx + "," + dy + ")");
}

function drawPieChart(data, locationName) {
    if (d3.select(`g${pieLegendClassName}`)) d3.select(`g${pieLegendClassName}`).remove();
    if (d3.select("svg.pie")) d3.select("svg.pie").remove();
    if (data !== undefined) {
        pieHeader.innerText = `Category distribution of ${locationName}`;
    } else {
        pieHeader.innerText = `Categories of ${locationName} are undefined`;
    }

    const topData = data.sort((a, b) => d3.descending(a,b))

    const sum = d3.sum(data);
    const colors = ["Red", "Blue", "Green"];
    var arc = d3.arc()
    .outerRadius(radius)

    var pie = d3.pie();
    var svg_chart = d3.select("#pie-chart").append("svg")
        .datum(topData)
        .attr('class', 'pie')
        .attr("width", pie_width)
        .attr("height", pie_height)
        .append("g")
        .attr("transform", "translate(" + pie_width / 2 + "," + pie_height / 2 + ")");
    
    initPieLegend(colors, svg_chart);

    const arcs = svg_chart.selectAll("g.arc")
    .data(pie)
    .enter().append("g")
    .attr("class", "arc");
    arcs
        .append("path")
        .attr("fill", function(d, i) {
            return colors[i]; 
        })
        // .style("fill-opacity", 0.75)
        .call(d3.helper.tooltip(function(d, i) {
            const percentage = (d.data/sum * 100);
            return `Amount: ${d.data}` + 
            "<br\/>" + `Amount in percentage: ${(Math.round(percentage * 1000) / 1000)}%`;
        }, true))
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
    var i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
    return function(t) { return arc(i(t)); };
    }

    function tweenDonut(b) {
    b.innerRadius = radius * .6;
    var i = d3.interpolate({innerRadius: 0}, b);
    return function(t) { return arc(i(t)); };
    }

}