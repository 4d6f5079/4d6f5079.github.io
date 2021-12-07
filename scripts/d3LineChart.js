// used in mouseclicked in d3Map.js and coronaDataInitialion.js

const widthLineChart = 750;
const heightLineChart = 750;
const svgId = "line-chart";

function makeTitle() {

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

    console.log("Selected Municipality:", obj.Municipality);
    return obj.Municipality === "" && obj.Province === selectedPlace;
  });


  console.log("allCovidData  data", allCovidData);


  const title = makeTitle;

  const xValue = d => parseDate(d.Date_of_report);
  var yValue = d => +d.Total_reported;
  if (selectedCategory === "Covid-19 Infections") {
    yValue = d => +d.Total_reported;
  } else if(selectedCategory === "Hospital Admissions") {
    yValue = d => +d.Hospital_admission;
  } else {
    yValue = d => +d.Deceased;
  }


  const xAxisLabel = "Date";
  const yAxisLabel = "Make Label...";

  const margin = {top: 15, right: 45, bottom: 35, left: 45};
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

  g.append("path")
    .datum(singlePlaceData)
    .attr("fill", "none")
    .attr("stroke", "green")
    .attr("d", d3.line()
      .x(d => xScale(xValue(d)))
      .y(d => yScale(yValue(d)))
      .curve(d3.curveMonotoneY)
    );

  g.append('text')
    .text(title);

}

