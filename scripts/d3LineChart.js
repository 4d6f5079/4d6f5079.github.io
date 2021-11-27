const widthLineChart		= 750;
const heightLineChart		= 750;

function makeTitle() {

}

function drawLineChart(allCovidData) {
  if (!selectedPlace) return;

  singlePlaceData = allCovidData.filter(obj => {
    if(municipalityMode) {
      return obj.Municipality_name === selectedPlace;
    }
    return obj.Province === selectedPlace;
  });

  console.log("Selected catagory is ", selectedCategory);
  console.log("Selected place is ", selectedPlace);
  let margin = {top: 15, right: 35, bottom: 20, left: 35},
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
    .domain(d3.extent(singlePlaceData, d => new Date(d.Date_of_report.substring(0,10))))
    .range([0, width]);

  let y = d3.scaleLinear()
    .domain([0, d3.max(singlePlaceData, d => +d.Deceased)])
    .range([height, 0]);  
  
  // Add x and y axis
  svg.append("g")
     .attr("transform", `translate(0, ${height})`)
     .call(d3.axisBottom(x));
  
  svg.append("g")
     .call(d3.axisLeft(y));

  svg.append("path")
     .datum(singlePlaceData)
     .attr("fill", "none")
     .attr("stroke", "steelblue")
     .attr("stroke-width", 1.5)
     .attr("d", d3.line()
      .x(d => x(new Date(d.Date_of_report.substring(0,10))))
      .y(d => y(+d.value)));
  // selectedDate = document.getElementById("selectedDate").value;

  // const data = municipalityCheck();
}

