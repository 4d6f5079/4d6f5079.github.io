function updateDate(dateObject) {
    if (!municipalitiesJson && !provinceJson && !covidCumulative) return;

    selectedDate = dateObject.value;
    
    const data = joinCorrectGeoJSONDataWithCovidData();
    
    // Line chart is not redrawn as it ranges over all dates and not specific for a single date.
    drawMap(data);
    drawHorizontalBarChart(data);
}


function updateCategory() {
    if (!municipalitiesJson && !provinceJson && !covidCumulative) return;
    
    selectedCategory = document.getElementById("covid-category").value;

    const data = joinCorrectGeoJSONDataWithCovidData();

    drawMap(data);
    drawHorizontalBarChart(data);
    drawLineChart(covidCumulative);
}

function toggleRegionArea() {
    if (!municipalitiesJson && !provinceJson && !covidCumulative) return;
    
    municipalityMode = !municipalityMode; // toggle municipality mode
    selectedPlace = undefined; // reset selectedPlace so that line chart is not drawns when no area is selected.

    if (municipalityMode) {
        document.getElementById("toggleAreaButton").innerHTML = "Show Province Mode";
    } else {
        document.getElementById("toggleAreaButton").innerHTML = "Show Municipality Mode";
    }
    
    const data = joinCorrectGeoJSONDataWithCovidData();

    drawMap(data);
    drawHorizontalBarChart(data);
}


