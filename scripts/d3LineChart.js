// used in mouseclicked in d3Map.js and coronaDataInitialion.js

const widthLineChart = 750;
const heightLineChart = 750;
const svgId = "line-chart-id";

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
    return obj.Province === selectedPlace;
  });

  result = []
  singlePlaceData.forEach(obj => {
    result.push({
      "date": obj.Date_of_report,
      // Changle to selected chategory
      "value": obj.Deceased
    });
  });

  console.log('before');
  setTimeout(function(){
      console.log('after');
  },5000);


  console.log("Result place data", result);

  const title = makeTitle;

  const xValue = d => parseDate(d.date);
  const yValue = d => d.value;

  const xAxisLabel = "Date";
  const yAxisLabel = "Make Label...";


  // TODO: Change to selected category



  const margin = { top: 15, right: 35, bottom: 35, left: 35 };
  const widthL = widthLineChart - margin.left - margin.right;
  const heightL = heightLineChart - margin.top - margin.bottom;

  const xScale = d3.scaleTime()
    .domain(d3.extent(result, xValue))
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(result, yValue)])
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

  const yAxis = d3.axisLeft(yScale)

  const xAxisWithG = g.append("g").call(xAxis)
    .attr("transform", `translate(0, ${heightL})`);

  const yAxisWithG = g.append("g").call(yAxis);


  xAxisWithG.append("text")
    .text(xAxisLabel);

  yAxisWithG.append("text")
    .text(yAxisLabel);

  const lineGenerator = d3.line()
    .x(d => {
      console.log("X value", xScale(xValue(d)));
      xScale(xValue(d))
    })
    .y(d => {
      console.log("Y value", yScale(yValue(d)));
      yScale(yValue(d))
    });

  g.append("path")
    .datum(result)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("d", lineGenerator(result));

  // svg.append("path")
  //   .datum(result)
  //   .attr("fill", "none")
  //   .attr("stroke", "steelblue")
  //   .attr("stroke-width", 1.5)
  //   .attr("d", lineGenerator);

  g.append('text')
    .text(title);

  // ============================================================================

  // // console.log("Selected catagory is ", selectedCategory);
  // // console.log("Selected place is ", selectedPlace);

  // const margin = {top: 15, right: 35, bottom: 20, left: 35};
  // const widthL = widthLineChart - margin.left - margin.right;
  // const heightL = heightLineChart - margin.top - margin.bottom;

  // const svg = d3.select("#line-chart")
  //     .append("svg")
  //     .attr("id", svgId)
  //     .attr("width", widthLineChart)
  //     .attr("height", heightLineChart)
  //     .append("g")
  //     .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // // Making x and y axis to append to add to svg
  // const x = d3.scaleTime()
  //   .range([0, widthL])
  //   .domain(d3.extent(
  //     singlePlaceData,
  //     function(d) { return parseDate(d.Date_of_report) }
  //   )); // Taking only the date with substring

  // const y = d3.scaleLinear()
  //   .range([heightL, 0])  
  //   .domain([0, d3.max(singlePlaceData, function(d) { +d.Deceased })]);

  // const line = d3.line()
  //   .x(function(d) { 
  //     //console.log("X value:", parseDate(d.Date_of_report));
  //     return x(parseDate(d.Date_of_report));
  //   }) // set the x values for the line generator
  //   .y(function (d) {
  //     //console.log("Y value:", +d.Deceased);
  //     return y(+d.Deceased);
  //   }) // set the y values for the line generator
  //   .curve(d3.curveLinear); // apply smoothing to the line

  // // Add x and y axis
  // svg.append("g")
  //    .attr("transform", `translate(0, ${heightL})`)
  //    .call(d3.axisBottom(x));

  // svg.append("g")
  //    .call(d3.axisLeft(y));

  // svg.append("path")
  //    .datum(result)
  //    .attr("fill", "none")
  //    .attr("stroke", "steelblue")
  //    .attr("stroke-width", 1.5)
  //    .attr("d", line)
  // // selectedDate = document.getElementById("selectedDate").value;

  // // const data = municipalityCheck();

}

