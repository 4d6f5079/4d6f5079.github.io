function removePieChart() {
    if (d3.select(`g${pieLegendClassName}`)) d3.select(`g${pieLegendClassName}`).remove();
    if (d3.select("svg.pie")) d3.select("svg.pie").remove();
    pieHeader.innerText = "";
}
function updateDate(dateObject) {
    if (!municipalitiesJson && !provinceJson && !covidCumulative) return;

    selectedDate = dateObject.value;
    
    const data = municipalityCheck();
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
}


