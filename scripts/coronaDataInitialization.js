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

        console.log("Cumulutative data: ", covidCumulative);
        console.log("Cumulutative data: ", covidCumulative[0]);
        
        const dateOfReport = new Date(covidCumulative[0].Date_of_report);
        // console.log("Date of report: ", extractDateOnly(dateOfReport));
        document.getElementById("selectedDate").min = extractDateOnly(dateOfReport);

        const data = municipalityCheck();

        // CALL FUNCTION TO DRAW THE MAP
        drawMap(data);
        drawLineChart();
    });
}