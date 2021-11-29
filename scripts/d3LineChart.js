// used in mouseclicked in d3Map.js and coronaDataInitialion.js

const widthLineChart		= 750;
const heightLineChart		= 750;
const svgId = "line-chart-id";

function makeTitle() {

}

// parses date string with given format to a Date object
const parseDate = d3.timeParse("%Y-%m-%d %I:%M:%S");

function drawLineChart(allCovidData) {
  if (!selectedPlace) return;

  if (d3.select(`svg#${svgId}`)) d3.select(`svg#${svgId}`).remove();

  let singlePlaceData = allCovidData.filter(obj => {
    if(municipalityMode) {
      return obj.Municipality_name === selectedPlace;
    }
    return obj.Province === selectedPlace;
  });

  console.log("Selected catagory is ", selectedCategory);
  console.log("Selected place is ", selectedPlace);

  const margin = {top: 15, right: 35, bottom: 20, left: 35};
  const widthL = widthLineChart - margin.left - margin.right;
  const heightL = heightLineChart - margin.top - margin.bottom;

  const svg = d3.select("#line-chart")
      .append("svg")
      .attr("id", svgId)
      .attr("width", widthLineChart)
      .attr("height", heightLineChart)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Making x and y axis to append to add to svg
  const x = d3.scaleTime()
    .range([0, widthL])
    .domain(d3.extent(
      singlePlaceData,
      function(d) { return parseDate(d.Date_of_report) }
    )); // Taking only the date with substring

  const y = d3.scaleLinear()
    .range([heightL, 0])  
    .domain([0, d3.max(singlePlaceData, function(d) { +d.Deceased })]);

  const line = d3.line()
    .x(function(d) { 
      console.log("X value:", parseDate(d.Date_of_report));
      return x(parseDate(d.Date_of_report));
    }) // set the x values for the line generator
    .y(function (d) {
      console.log("Y value:", +d.Deceased);
      return y(+d.Deceased);
    }) // set the y values for the line generator
    .curve(d3.curveLinear); // apply smoothing to the line
  
  // Add x and y axis
  svg.append("g")
     .attr("transform", `translate(0, ${heightL})`)
     .call(d3.axisBottom(x));
  
  svg.append("g")
     .call(d3.axisLeft(y));

  svg.append("path")
     .datum(singlePlaceData)
     .attr("fill", "none")
     .attr("stroke", "steelblue")
     .attr("stroke-width", 1.5)
     .attr("d", line)
  // selectedDate = document.getElementById("selectedDate").value;

  // const data = municipalityCheck();

}

