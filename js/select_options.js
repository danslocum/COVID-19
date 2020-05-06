// global variables
var startingValue = ["Virginia"];

function createSelectOptions(dataset) {
    var states = []
    dataset.forEach(function(d) { states.push(d.state); })
    states = d3.set(states).values().sort(d3.ascending);

    var stateOptions = "";
    for(i=0; i<states.length; i++) {
        if (startingValue.includes(states[i])) {
            stateOptions += "<option selected>" + states[i] + "</option>";
        } else {
            stateOptions += "<option>" + states[i] + "</option>";
        }
    }

    var stateSelect = document.getElementById("stateSelect");
    stateSelect.innerHTML = stateOptions;
    stateSelect.size = Math.floor((height - 25) / 18);
}