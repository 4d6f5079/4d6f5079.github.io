function updateDate() {
    selectedDate = document.getElementById("selectedDate").value;
    console.log(selectedDate);
}

function toggleRegionArea() {
    console.log(municipalityMode)
    if (municipalityMode) {
        document.getElementById("toggleAreaButton").innerHTML = "Show Province Mode";
        municipalityMode = !municipalityMode;
    } else {
        document.getElementById("toggleAreaButton").innerHTML = "Show Municipality Mode";
        municipalityMode = !municipalityMode;
    }
}
