function updateDate() {
    if (!municipalitiesJson && !provinceJson && !covidCumulative) return;

    selectedDate = document.getElementById("selectedDate").value;

    let data;
    if (municipalityMode) {
        data = joinMapCovidCumulativeData(municipalitiesJson, covidCumulative);
    } else {
        data = joinMapCovidCumulativeData(provinceJson, covidCumulative);
    }
    drawMap(data);
}

function toggleRegionArea() {
    if (!municipalitiesJson && !provinceJson && !covidCumulative) return;
    
    municipalityMode = !municipalityMode;

    let data;
    if (municipalityMode) {
        document.getElementById("toggleAreaButton").innerHTML = "Show Province Mode";
        data = joinMapCovidCumulativeData(municipalitiesJson, covidCumulative);
    } else {
        document.getElementById("toggleAreaButton").innerHTML = "Show Municipality Mode";
        data = joinMapCovidCumulativeData(provinceJson, covidCumulative);
    }

    drawMap(data);
}
