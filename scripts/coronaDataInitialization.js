var municipalitiesJson;
var covidCumulative;
var provinceJson;

/**
 * Load all COVID-19 data and GeoJSON data of province and municipality asynchronously. 
 * Assign the result to global variables above.
 */
Promise.all([
    d3.json("../data/municipalities.geojson"),
    d3.json("../data/province.geojson"),
    d3.dsv(";", "../data/COVID-19_aantallen_gemeente_cumulatief.csv")
]).then(function(allData) {
    // Aassign variables to corresponding data.
    municipalitiesJson = allData[0];
    provinceJson = allData[1];
    covidCumulative = allData[2];

    // Select the min and max dates that can be picked dynamically based on the range of the COVID-19 data.
    document.getElementById("selectedDate").min = formatDate(new Date(covidCumulative[0].Date_of_report));
    document.getElementById("selectedDate").max = formatDate(new Date(covidCumulative[covidCumulative.length - 1].Date_of_report));

    // Data for selected date
    const data = joinCorrectGeoJSONDataWithCovidData();

    // Call functions to draw the map and the horizontal bar chart
    drawMap(data);
    drawHorizontalBarChart(data);
});
