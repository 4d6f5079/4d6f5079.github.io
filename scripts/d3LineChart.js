// used in mouseclicked in d3Map.js and coronaDataInitialion.js

const widthLineChart = 850;
const heightLineChart = 750;
const svgId = "line-chart";

function removeLineChart() {
  d3.select(`svg#${svgId}`).remove();
  d3.select("#lineChartHeader").html("");
}

// parses date string with given format to a Date object
const parseDate = d3.timeParse("%Y-%m-%d %I:%M:%S");

/**
 * Draws cumulative temporal COVID-19 data on the line chart of the selected area.
 * 
 * @param {List[Object]} allCovidData COVID-19 data with GeoJSON coordinates
 * @returns None
 */
function drawLineChart(allCovidData) {
  if (!selectedPlace) return;

  if (d3.select(`svg#${svgId}`)) d3.select(`svg#${svgId}`).remove();

  // Filter to only contain needed elements
  const singlePlaceData = allCovidData.filter(obj => {
    if (municipalityMode) {
      return obj.Municipality_name === selectedPlace;
    }
    return (obj.Municipality_name === "" && obj.Province === selectedPlace);
  });

  let categoryColor = "";
  let yAxisLabel = "";
  let title = "";

  // Functions to select needed data
  const xValue = d => parseDate(d.Date_of_report);
  let yValue;

  if (selectedCategory === "COVID-19 Infections") {
    yValue = d => +d.Total_reported;
    categoryColor = "#ec5353";
    yAxisLabel = "Infected";
    title = `COVID-19 Infections in ${selectedPlace}`;
  } else if(selectedCategory === "Hospital Admissions") {
    yValue = d => +d.Hospital_admission;
    categoryColor = "#0d2bfc";
    yAxisLabel = "Hospitalized";
    title = `Hospital Admissions in ${selectedPlace}`;
  } else {
    yValue = d => +d.Deceased;
    categoryColor = "#217d12";
    yAxisLabel = "Deceased";
    title = `Deceased in ${selectedPlace}`;
  }

  // Setting value to possition line chart
  const margin = {top: 15, right: 55, bottom: 150, left: 90};
  const widthL = widthLineChart - margin.left - margin.right;
  const heightL = heightLineChart - margin.top - margin.bottom;

  // Defining xScale and yScale to be used with the line chart axis
  const xScale = d3.scaleTime()
    .domain(d3.extent(singlePlaceData, xValue))
    .range([0, widthL]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(singlePlaceData, yValue)])
    .range([heightL, 0]);

  // Appending svg to contain the chart
  const svg = d3.select("#line-chart")
    .append("svg")
    .attr("id", svgId)
    .attr("width", widthLineChart)
    .attr("height", heightLineChart);
    // .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Constructing the x and y axis with the Scale for each
  const xAxis = d3.axisBottom(xScale)

  const yAxis = d3.axisLeft(yScale);

  // Append g tag for the line chart axis
  g.append("g").call(xAxis)
    .attr("transform", `translate(0, ${heightL})`)
    .attr("class", "axis-values");

  g.append("g").call(yAxis)
    .attr("class", "axis-values");

  // Giving a title to the line chart
  d3.select("#lineChartHeader").html(title);
    
  // Appending x axis label
  svg.append("text")
  .attr("class", "line-chart-label-axis")
  .attr("transform", "translate(427, 655)")
  .style("text-anchor", "middle")
  .text("Date");

  // Appending y axis label
  svg.append("text")
  .attr("class", "line-chart-label-axis")
  .style("text-anchor", "middle")
  .attr("transform", "translate(20, 300) rotate(-90)")
  .text(yAxisLabel);
  
  // Appending path to draw the line using the xScale and yScale
  const path = g.append("path")
  .datum(singlePlaceData)
  .attr("fill", "none")
  .style("stroke", categoryColor)
  .style("stroke-width", "3px")
  .attr("d", d3.line()
    .x(d => xScale(xValue(d)))
    .y(d => yScale(yValue(d)))
    .curve(d3.curveBasis)
  );

  // Calculating path length for animated drawing of the line
  const totalLength = path.node().getTotalLength();

  // Animated drawing of the line in the chart 
  path.attr("stroke-dasharray", totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(1000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0); 

}

