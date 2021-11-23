var nljson;
var covidCumulative;
var data;

if (!nljson || !covidCumulative || !covidPerDay) {
    Promise.all([
        d3.json("../data/nl.json"),
        d3.dsv(";", "../data/COVID-19_aantallen_gemeente_cumulatief.csv")
    ]).then(function(allData) {
        // ASSIGN VARS TO CORRESPONDING DATA.
        nljson = allData[0];
        covidCumulative = allData[1];
        
        // DO SOME PREPROCESSING ON ALL THE DATA.
        const covidFilteredByDate = covidCumulative.filter(obj => {
            objDate = new Date(obj.Date_of_report);
            objDateString = new Date(objDate.getTime() - (objDate.getTimezoneOffset() * 60000 ))
                .toISOString()
                .split("T")[0];
            return objDateString === selectedDate;
        });

        // JOIN DATA WITH NL.JSON DATA
        data = {
            "covidCumulativeDayData": covidFilteredByDate,
            "mapData": nljson
        };

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