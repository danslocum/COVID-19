// global variables
var perCapita = true;
var actualNewCases = 0;
var rateScore = 1;

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
    if (actualNewCases) { actualNewCases = 0; }
    else { actualNewCases = 1; }
    createPlot(0);
});
$("input[name='score']").change(function(){
    if (rateScore) { rateScore = 0; }
    else { rateScore = 1; }
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
            d.cases = +d.cases*pop_data[d.state]/100000;
            d.deaths = d.deaths*pop_data[d.state]/100000;
        });
        perCapita = false;
    } else {
        dataset.forEach(function(d) {
            d.cases = +d.cases/pop_data[d.state]*100000;
            d.deaths = d.deaths/pop_data[d.state]*100000;
        });
        perCapita = true;
    }
    createPlot();
});
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
    xScale = xScale_linear;
    xAxis = xAxis_linear;
}