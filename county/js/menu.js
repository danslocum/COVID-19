// global variables
var perCapita = true;
var actualNewCases = 0;
var rateScore = 1;
var getXAxisData;

$("input[name='yscale']").change(function(){
    if (this.value == "linear") {
        setLinearScale();
    } else if (this.value == "log") {
        setLogScale();
    }
    setScale();
    setPath();
    setLineTransition();
    setDotTransition();
});
$("input[name='actual']").change(function(){
    if (actualNewCases) { 
        actualNewCases = 0; 
    } else { 
        actualNewCases = 1; 
    }
    createPlot(0);
});
$("input[name='score']").change(function(){
    if (rateScore) { 
        rateScore = 0;         
    } else { 
        rateScore = 1; 
    }
    createPlot(0);
});
$("input[name='movingavg']").change(function(){
    new_moving_average = $(this).val();
    if (new_moving_average <= 0) {
        new_moving_average = 1;
        document.getElementById("movingavg").value = new_moving_average;
    } else if (new_moving_average > 20) {
        new_moving_average = 20;
        document.getElementById("movingavg").value = new_moving_average;
    }
    movingAverageDays = new_moving_average;
    createPlot();
});
$("input[name='pop']").change(function(){
    // change to where this adjusts the "cases" and "deaths" in the dataset by population (x100,000) if per capita is true, else multiply by population (/100,000)
    if (perCapita) {
        dataset.forEach(function(d) {
            d.cases = +d.cases*pop_data[d.county.toLowerCase()]['pop']/100000;
            d.deaths = d.deaths*pop_data[d.county.toLowerCase()]['pop']/100000;
        });
        perCapita = false;
    } else {
        dataset.forEach(function(d) {
            d.cases = +d.cases/pop_data[d.county.toLowerCase()]['pop']*100000;
            d.deaths = d.deaths/pop_data[d.county.toLowerCase()]['pop']*100000;
        });
        perCapita = true;
    }
    createPlot();
});
function setAxis() {
	setXAxis();
	createPlot();
}
function setXAxis() {
	// set x axis
	xAxisValue = $("#xAxisSelect").val();
	if (xAxisValue == "Days Since Outbreak") {
        $('#xAxis_label').text(xAxisValue)
		xScale = xScale_linear;
		xAxis = xAxis_linear;
		getXAxisData = getData_daysSinceOutbreak;
	} else {
        if (perCapita) {
            $('#xAxis_label').text(xAxisValue + " per 100,000 people")
        } else {
            $('#xAxis_label').text(xAxisValue)
        }
		xScale = xScale_log;
		xAxis = xAxis_log;
		if (xAxisValue == "New Cases") {
			getXAxisData = getData_newCases;
		} else if (xAxisValue == "Total Cases") {
			getXAxisData = getData_totalCases;
		} else if (xAxisValue == "New Deaths") {
			getXAxisData = getData_newDeaths;
		} else if (xAxisValue == "Total Deaths") {
			getXAxisData = getData_totalDeaths;
		} else if (xAxisValue == "Hospital Capacity") {
			getXAxisData = getData_hospitalCapacity;		
		}
	}
}
function getData_daysSinceOutbreak(i, state) {
	return i;
}
function getData_newCases(i, state) {
	state_data = data_objects[state];
    if (scale == "log") {
        if (i==0) { return min_x; }
        return Math.max(state_data[i].cases - state_data[i-1].cases, min_x);
    } else if (scale == "linear") {
        if (i==0) { return state_data[i].cases; }
        return state_data[i].cases - state_data[i-1].cases;
    }
}
function getData_totalCases(i, state) {
	return Math.max(min_x, data_objects[state][i].cases);
}
function getData_newDeaths(i, state) {
	state_data = data_objects[state];
    if (scale == "log") {
        // if (i==0) { return Math.max(data[i].deaths, min_x); }
        if (i==0) { return min_x; }
        return Math.max(state_data[i].deaths - state_data[i-1].deaths, min_x);
    } else if (scale == "linear") {
        if (i==0) { return state_data[i].deaths; }
        return state_data[i].deaths - state_data[i-1].deaths;
    }}
function getData_totalDeaths(i, state) {
	return Math.max(min_x, data_objects[state][i].deaths);
}
function getData_hospitalCapacity(i, state) {
	return i;
}
function setLinearScale() {
    scale = "linear";
    yScale = yScale_linear;
    yAxis = yAxis_linear;
    xScale = xScale_linear;
    xAxis = xAxis_linear;
}
function setLogScale() {
    scale = "log";
    yScale = yScale_log;
    yAxis = yAxis_log;
    xScale = xScale_log;
    xAxis = xAxis_log;
	
	if ($("#xAxisSelect").val() == "Days Since Outbreak") { 	
		xScale = xScale_linear;
		xAxis = xAxis_linear;
	}

}