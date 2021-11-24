var municipalitiesJson;
var covidCumulative;
var provinceJson;

if (!municipalitiesJson || !covidCumulative || !provinceJson) {
    Promise.all([
        d3.json("../data/municipalities.json"),
        d3.json("../data/province.json"),
        d3.dsv(";", "../data/COVID-19_aantallen_gemeente_cumulatief.csv")
    ]).then(function(allData) {

        // ASSIGN VARS TO CORRESPONDING DATA.
        municipalitiesJson = allData[0];
        provinceJson = allData[1];
        covidCumulative = allData[2];
        
        const dateOfReport = new Date(covidCumulative[0].Date_of_report);
        document.getElementById("selectedDate").min = extractDateOnly(dateOfReport);

        let data;
        if (municipalityMode) {
            data = joinMapCovidCumulativeData(municipalitiesJson, covidCumulative);
        } else {
            data = joinMapCovidCumulativeData(provinceJson, covidCumulative);
        }

        // CALL FUNCTION TO DRAW THE MAP
        drawMap(data);
    });
}
//  else {
//   // UPDATE DATA AND REDRAW THE MAP USING THE VARS
//   //e.g. 
//   updatedData = data.filter(obj => obj.Deceased > 100);
//   drawMap(updatedData, svgToDrawMapWithDataOn);
//   // ALTERNATIVE: if we only want to draw on the same svg (svf og map), no need to pass the svg. just use map svg in the function itself.
//   drawMap(data);
// }