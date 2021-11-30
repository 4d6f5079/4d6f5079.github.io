function updateDate(dateObject) {
    if (!municipalitiesJson && !provinceJson && !covidCumulative) return;

    selectedDate = dateObject.value;
    
    const data = municipalityCheck();
    drawMap(data);
    drawChart(data);
}

function updateCategory() {
    if (!municipalitiesJson && !provinceJson && !covidCumulative) return;
    
    selectedCategory = document.getElementById("covid-category").value;

    const data = municipalityCheck();
    drawMap(data);
    drawChart(data);
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


