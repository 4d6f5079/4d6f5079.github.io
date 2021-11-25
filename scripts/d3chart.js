const widthLineChart		= 750;
const heightLineChart		= 750;


function drawLineChart() {
  if (!municipalitiesJson && !provinceJson && !covidCumulative) return;


  let margin = {top: 15, right: 30, bottom: 15, left: 30},
      width = 450 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

  let svg = d3.select("#line-chart")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`); //

  // Making x and y axis to append to add to svg
  let x = d3.scaleTime()
    .domain(d3.extent(covidCumulative, d => d.Date_of_report))
    .range([0, width]);

  var y = d3.scaleLinear()
    .domain([0, d3.max(covidCumulative, d => +d.Deceased)])
    .range([height, 0]);  
  
  // Add x and y axis
  svg.append("g")
     .attr("transform", `translate(0, ${height})`)
     .call(d3.axisBottom(x));
  
  svg.append("g")
     .call(d3.axisLeft(y));


  svg.append("path")
     .datum(covidCumulative)
     .attr("fill", "none")
     .attr("stroke", "steelblue")
     .attr("stroke-width", 1.5)
     .attr("d", d3.line()
      .x(d => d.Date_of_report)
      .y(d => +d.value));
  // selectedDate = document.getElementById("selectedDate").value;

  // const data = municipalityCheck();
}

