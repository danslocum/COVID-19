// global variables
var startingStateValue = ["Virginia"];
var axisValues = ["New Cases", "Total Cases", "New Deaths", "Total Deaths", "Days Since Outbreak", "Hospital Capacity"];
var startingXAxisValue = ['Days Since Outbreak'];

function createSelectOptions(dataset) {
    var states = []
    dataset.forEach(function(d) { states.push(d.state); })
    states = d3.set(states).values().sort(d3.ascending);

    var stateOptions = "";
    for(i=0; i<states.length; i++) {
        if (startingStateValue.includes(states[i])) {
            stateOptions += "<option selected>" + states[i] + "</option>";
        } else {
            stateOptions += "<option>" + states[i] + "</option>";
        }
    }

    var stateSelect = document.getElementById("stateSelect");
    stateSelect.innerHTML = stateOptions;
    stateSelect.size = Math.floor((height - 25) / 18);
	
	var xAxisOptions = "";
    for(i=0; i<axisValues.length; i++) {
        if (startingXAxisValue.includes(axisValues[i])) {
            xAxisOptions += "<option selected>" + axisValues[i] + "</option>";
        } else {
            xAxisOptions += "<option>" + axisValues[i] + "</option>";
        }
    }
	document.getElementById("xAxisSelect").innerHTML = xAxisOptions;
}