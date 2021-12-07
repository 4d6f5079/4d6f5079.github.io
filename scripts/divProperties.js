function updateDate(dateObject) {
    if (!municipalitiesJson && !provinceJson && !covidCumulative) return;

    selectedDate = dateObject.value;
    
    const data = municipalityCheck();
    
    // Line chart is not redrawn as it ranges over all dates
    removePieChart();
    drawMap(data);
    drawHorizontalBarChart(data);

}


function updateCategory() {
    if (!municipalitiesJson && !provinceJson && !covidCumulative) return;
    
    selectedCategory = document.getElementById("covid-category").value;

    const data = municipalityCheck();
    removePieChart();
    drawMap(data);
    drawHorizontalBarChart(data);
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
    removePieChart();
    drawMap(data);
    drawHorizontalBarChart(data);
    drawLineChart(covidCumulative);
}


