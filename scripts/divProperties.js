function updateDate() {
    if (!municipalitiesJson && !provinceJson && !covidCumulative) return;

    selectedDate = document.getElementById("selectedDate").value;
    
    const data = municipalityCheck();
    
    // Line chart is not redrawn as it ranges over all dates
    drawMap(data);
    drawChart(data);
}

function updateCategory() {
    if (!municipalitiesJson && !provinceJson && !covidCumulative) return;
    
    selectedCategory = document.getElementById("covid-category").value;

    const data = municipalityCheck();
    
    // Redraw the map and charts
    drawMap(data);
    drawChart(data);
    drawLineChart(covidCumulative);
}

function toggleRegionArea() {
    if (!municipalitiesJson && !provinceJson && !covidCumulative) return;
    
    municipalityMode = !municipalityMode;

    if (municipalityMode) {
        document.getElementById("toggleAreaButton").innerHTML = "Show Province Mode";
    } else {
        document.getElementById("toggleAreaButton").innerHTML = "Show Municipality Mode";
    }
    
    const data = municipalityCheck();
    drawMap(data);
    drawChart(data);
}
