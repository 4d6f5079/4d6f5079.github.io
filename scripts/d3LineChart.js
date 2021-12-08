// used in mouseclicked in d3Map.js and coronaDataInitialion.js

const widthLineChart = 750;
const heightLineChart = 750;
const svgId = "line-chart";

function makeTitle() {

}

function removeLineChart() {
  d3.select(`svg#${svgId}`).remove();
}

// parses date string with given format to a Date object
const parseDate = d3.timeParse("%Y-%m-%d %I:%M:%S");

function drawLineChart(allCovidData) {
  if (!selectedPlace) return;

  if (d3.select(`svg#${svgId}`)) d3.select(`svg#${svgId}`).remove();

  // Filter to only contain needed elements
  let singlePlaceData = allCovidData.filter(obj => {
    if (municipalityMode) {
      return obj.Municipality_name === selectedPlace;
    }

    //console.log("Selected Municipality:", obj.Municipality);
    return (obj.Municipality_name === "" && obj.Province === selectedPlace);
  });


  console.log("singlePlaceData data", singlePlaceData);

  const title = makeTitle;
  var categoryColor = "#ec5353";

  const xValue = d => parseDate(d.Date_of_report);
  var yValue = d => +d.Total_reported;
  if (selectedCategory === "Covid-19 Infections") {
    yValue = d => +d.Total_reported;
    categoryColor = "#ec5353";
  } else if(selectedCategory === "Hospital Admissions") {
    yValue = d => +d.Hospital_admission;
    categoryColor = "#0d2bfc";
  } else {
    yValue = d => +d.Deceased;
    categoryColor = "#217d12";
  }


  const xAxisLabel = "Date";
  const yAxisLabel = "Make Label...";

  const margin = {top: 15, right: 55, bottom: 35, left: 55};
  const widthL = widthLineChart - margin.left - margin.right;
  const heightL = heightLineChart - margin.top - margin.bottom;

  const xScale = d3.scaleTime()
    .domain(d3.extent(singlePlaceData, xValue))
    .range([0, widthL]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(singlePlaceData, yValue)])
    .range([heightL, 0]);

  const svg = d3.select("#line-chart")
    .append("svg")
    .attr("id", svgId)
    .attr("width", widthLineChart)
    .attr("height", heightLineChart)
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const xAxis = d3.axisBottom(xScale)

  const yAxis = d3.axisLeft(yScale);

  const xAxisWithG = g.append("g").call(xAxis)
    .attr("transform", `translate(0, ${heightL})`);

  const yAxisWithG = g.append("g").call(yAxis);

  xAxisWithG.append("text")
    .text(xAxisLabel);

  yAxisWithG.append("text")
    .text(yAxisLabel);

  
  const path = g.append("path")
  .datum(singlePlaceData)
  .attr("fill", "none")
  .style("stroke", categoryColor)
  .style("stroke-width", "3px")
  .attr("d", d3.line()
    .x(d => xScale(xValue(d)))
    .y(d => yScale(yValue(d)))
    //.curve(d3.curveMonotoneY)
    .curve(d3.curveBasis)
  );

  const totalLength = path.node().getTotalLength();

  path.attr("stroke-dasharray", totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(1000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0); 

  //console.log("total length:", totalLength);

  // path.select("line-for-animation")


  // d3.select(path[0][0])
  // .transition()
  // .duration(5000)
  // .ease(d3.easeLinear)
  // .attr("stroke-dashoffset", 0);




  // g.select("path")
  // .transition()
  // .duration(5000)
  // .ease(d3.easeLinear);

  g.append('text')
    .text(title);

}

