// global variables
var movingAverageDays = 7;
var scale = "log";

var svg, width, height;
var dataset, data, data_objects, organize_data;
var xScale, xAxis, yScale, yAxis;
var xScale_log, xScale_linear, yScale_log, yScale_linear;
var xAxis_log, xAxis_linear, yAxisLog, yAxisLinear;
var line;

var min_y = 1;
var min_x = 0;
var min_x = 0;
var formatTime = d3.timeFormat("%A, %m/%d/%Y");
var tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);


function initializePlot(data_full) {
    dataset = data_full.sort(function(x, y){ return d3.ascending(x.date, y.date); });
    createSlider(dataset);

    var margin = {top: 50, right: 100, bottom: 50, left: 50};
    document.getElementById("movingavg").value = movingAverageDays;

    width = document.getElementById("visual").getElementsByTagName("svg")[0].width.baseVal.value - margin.left - margin.right;
    height = window.innerHeight - 300 - margin.top - margin.bottom;

    svg = d3.select("#visual svg")
            .attr("class", "mx-auto")
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    svg.append("g").attr("class", "xaxis").attr("transform", "translate(0," + height + ")");
    svg.append("g").attr("class", "yaxis");

    initializeScale();
    createSelectOptions(dataset);
    setLogScale();
	setXAxis();
}

function initializeScale() {
    xScale_log = d3.scaleLog().range([0, width]);
    xScale_linear = d3.scaleLinear().range([0, width]);
    yScale_log = d3.scaleLog().range([height, 0]);
    yScale_linear = d3.scaleLinear().range([height, 0]);

    xAxis_log = d3.axisBottom(xScale_log).ticks(10, formatPower);
    xAxis_linear = d3.axisBottom(xScale_linear);
    yAxis_log = d3.axisLeft(yScale_log).ticks(10, formatPower);
    yAxis_linear = d3.axisLeft(yScale_linear);

    function formatPower(x) {
        const e = Math.log10(x);
        if (e !== Math.floor(e)) return; // Ignore non-exact power of ten.
        return `10${(e + "").replace(/./g, c => "⁰¹²³⁴⁵⁶⁷⁸⁹"[c] || "⁻")}`;
    }
}

function createPlot(transition_speed=1000) {
    var state = $("#stateSelect").val();
    var outbreak_cases_start = 20;

    var data_filtered = dataset.filter(function(d){ return (state.includes(d.state)) ? true: false; });
    var data_filtered = data_filtered.filter(function(d){ return (d.date <= timeScale.invert(currentValue)) ? true: false; });
    var start_threshold = false;
    data = data_filtered.filter(function(d){
            if (perCapita) {
                if (d.cases < outbreak_cases_start/pop_data[d.state]*100000 && start_threshold == false) { start_threshold; return false;
                } else if (d.cases >= outbreak_cases_start/pop_data[d.state]*100000  && start_threshold == false) { start_threshold = true; return true;
                } else { return true; }
            } else {
                if (d.cases < outbreak_cases_start && start_threshold == false) { start_threshold; return false;
                } else if (d.cases >= outbreak_cases_start && start_threshold == false) { start_threshold = true; return true;
                } else { return true; }
            }
        });
    organize_data = organizeData(data);
    data_objects = organizeData(data, 'object');

    setScale(transition_speed);
    setPath();

    svg.selectAll(".dots").remove();
    dots = svg.selectAll(".dots").data(organize_data)
    dott = dots.enter().append('g').attr('class', 'dots');
    dot = dott.selectAll('.dot').data(function(d) { return d.values; });
    dot.enter().append("circle")
        .attr("class", "dot")
        .merge(dot)
        .on("mouseover", function(d, i) { mouseover(d, i); })
        .on("mouseout", mouseout);
    dot.exit().remove();
    dots.exit().remove();

    svg.selectAll(".dots2").remove();
    dots2 = svg.selectAll(".dots2").data(organize_data)
    dott2 = dots2.enter().append('g').attr('class', 'dots2');
    dot2 = dott2.selectAll('.dot2').data(function(d) { return d.values; });
    dot2.enter().append("circle")
        .attr("class", "dot2")
        .merge(dot2)
        .on("mouseover", function(d, i) { mouseover(d, i); })
        .on("mouseout", mouseout);
    dot2.exit().remove();
    dots2.exit().remove();

    setLineTransition(transition_speed);
    setDotTransition(transition_speed);

    function organizeData(data, type="entries") {
        if (type == "object") {
            return d3.nest().key(function(d){ return d.state;}).object(data);
        }
        return d3.nest().key(function(d){ return d.state;}).entries(data);
    }
}

function setScale(transition_speed) {
    if (scale == "linear") {
       min_y = 0;
	   min_y = 0;
    } else if (scale == "log") {
        /*
		min_array = []
        for (var state_val in data_objects) {
            if (perCapita) {
                min_array.push(1 / pop_data[state_val] * 100000);
            } else {
                min_array.push(1);
            }
        }
        min_y = d3.min(min_array);
        min_x = d3.min(min_array);
		*/
		min_y = 0.01;
		min_x = 0.01;
	}

	// set x axis
	if ($("#xAxisSelect").val() == "Days Since Outbreak") { min_x = 0; }
    max_x_value = [];
    for (state_val in data_objects) {
		max_val = d3.max(data_objects[state_val], function(d, i){ return getXAxisData(i, d.state); });
        max_x_value.push(max_val);
    }
    xScale.domain([min_x, d3.max(max_x_value)+1]);
	
    svg.selectAll(".xaxis")
        .transition()
            .duration(transition_speed)
            .call(xAxis);
	
	// set y axis
    max_y_value = [];
    for (state_val in data_objects) {
        max_val = d3.max(data_objects[state_val], function(d, i){ return getVelocity(i, d.state); });
        max_y_value.push(max_val);
    }
    yScale.domain([min_y, d3.max(max_y_value)]);

    svg.selectAll(".yaxis")
        .transition()
            .duration(transition_speed)
            .call(yAxis);
			
	// set line scale
    line = d3.line()
        .x(function(d, i) { return xScale(getXAxisData(i, d.state)); })
        .y(function(d, i) { return yScale(Math.max(min_y, getMovingAverage(i, d.state))); })
        .curve(d3.curveMonotoneX);
}

function setPath() {
    paths = svg.selectAll('.lines').each(function(d, i) {
        if (organize_data[i] != undefined) {
            d3.select(this).select(".line")
                    .datum(organize_data[i])
                    .attr("id", function(j) { return "line-" + j.key.replace(" ","_"); });
            d3.select(this).select(".label")
                    .datum(function() {
                            return {
                                value: organize_data[i]['values'].length - 1,
                                state: organize_data[i]['key']
                            }
                        })
                    .attr("id", function(j) { return "label-" + j.state.replace(" ","_"); })
                    .attr("transform", function(j) {
                            return "translate(" + (xScale(getXAxisData(j.value, j.state)) + 10)
                            + "," + (yScale(Math.max(min_y, getMovingAverage(j.value, j.state))) + 5 )+ ")";
                        })
                    .text(function(j) { if (organize_data.length <= 5) { return j.state; } });
        }
    });
    paths = svg.selectAll('.lines').data(organize_data);
    path = paths.enter().append("g").attr("class", "lines");
    path.append("path")
            .attr("class", "line ")
            .attr("id", function(d) { return "line-" + d.key.replace(" ","_"); })
            .on("mouseover", function(d) {
                d3.select(this).attr("class", "line line-hover");
                d3.select("text#label-" + d['key'].replace(" ","_") + ".label").attr("class", "label label-hover");
            })
            .on("mouseout", function(d) {
                d3.select(this).attr("class", "line");
                d3.select("text#label-" + d['key'].replace(" ","_") + ".label").attr("class", "label");
            });
    path.append("text")
        .attr("class", "label")
        .attr("id", function(d) { return "label-" + d.key.replace(" ","_"); })
        .datum(function(d) {
                return {
                    value: d.values.length - 1,
                    state: d.key
                }
            })
        .attr("transform", function(d, i) {
                return "translate(" + (xScale(getXAxisData(d.value, d.state)) + 10)
                + "," + (yScale(Math.max(min_y, getMovingAverage(d.value, d.state))) + 5 )+ ")";
            })
        .attr("x", 5)
        .text(function(d) { if (organize_data.length <= 5) { return d.state; } })
		.on("mouseover", function(d) {
			d3.select("path#line-"+d['state'].replace(" ","_")+".line").attr("class", "line line-hover");
			d3.select("text#label-" + d['state'].replace(" ","_") + ".label").attr("class", "label label-hover");
		})
		.on("mouseout", function(d) {
			d3.select("path#line-"+d['state'].replace(" ","_")+".line").attr("class", "line");
			d3.select("text#label-" + d['state'].replace(" ","_") + ".label").attr("class", "label");
		});
    paths.exit().remove();
}

function setLineTransition(transition_speed) {
    svg.selectAll('.line').transition()
        .duration(transition_speed)
        .attr("d", function(d, i) { return line(d['values']); });
        //.attr("d", function(d, i) { return line(organize_data[i]['values']); });
}

function setDotTransition(transition_speed) {
    if (transition_speed == 0) { transition_speed += -1000; }
    svg.selectAll(".dots").each(function(d, i) {
        d3.select(this).selectAll('.dot')
            .attr("cx", function(d, i) { return xScale(getXAxisData(i, d.state)); })
            .attr("cy", function(d, i) { return yScale(getVelocity(i, d.state)); })
            .attr('r', 1.25)
            .style("opacity", 0)
            .transition()
                .duration(transition_speed+1000)
                .style("opacity", actualNewCases);
    });
    svg.selectAll(".dots2").each(function(d, i) {
        d3.select(this).selectAll('.dot2')
            .style("opacity", 0)
            .attr("cx", function(d, i) { return xScale(getXAxisData(i, d.state)) })
            .attr("cy", function(d, i) { return yScale(Math.max(min_y, getMovingAverage(i, d.state))); })
            .style('fill', function(d,i) { return getAccelerationColor(getAcceleration(i, getMovingAverage, d.state), d.state); })
            .attr('r', 3)
            .transition()
                .duration(transition_speed+1000)
                .style("opacity", rateScore);
    });
}

function getVelocity(i, object) {
    state_data = data_objects[object];
    if (scale == "log") {
        // if (i==0) { return Math.max(data[i].cases, min_y); }
        if (i==0) { return min_y; }
        return Math.max(state_data[i].cases - state_data[i-1].cases, min_y);
    } else if (scale == "linear") {
        if (i==0) { return state_data[i].cases; }
        return state_data[i].cases - state_data[i-1].cases;
    }
}

function getMovingAverage(i, object) {
    var vals = 0
    var count = 0
    for (j=0; j<movingAverageDays; j++) {
        if (i-j>0) {
            vals += getVelocity(i-j, object);
            count++;
        }
    }
    if (vals == 0) { return min_y; }
    return vals/count
}

function getAcceleration(i, trend_func, object) {
    if (i==0){ num =  0; }
    else if (i > 0) { num = trend_func(i, object) - trend_func(i-1, object); }
    return num;
}

function getAccelerationColor(num, object) {
    if (perCapita) {
        if (num <= 0 / pop_data[object]*100000) { return "green"; }
        else if (num <= 20 / pop_data[object]*100000) { return 'orange'; }
        else if (num <= 50 / pop_data[object]*100000) { return 'lightcoral'; }
        else if (num > 50 / pop_data[object]*100000) { return 'red'; }
    } else {
        if (num <= 0) { return "green"; }
        else if (num <= 20) { return 'orange'; }
        else if (num <= 50) { return 'lightcoral'; }
        else if (num > 50) { return 'red'; }
    }
}

function mouseover(d, i) {
    d3.select("path#line-" + d.state.replace(" ","_") + ".line").attr("class", "line line-hover");
    d3.select("text#label-" + d.state.replace(" ","_") + ".label").attr("class", "label label-hover");

    tooltip.transition()
            .duration(200)
            .style("opacity", .9);
    tooltip
        .html("<b>Avg New Cases:</b> " + getMovingAverage(i, d.state)
                + "<br/><b>Actual New Cases:</b> " + getVelocity(i, d.state)
                + "<br/><b>Total Cases:</b> " + d.cases
                + "<br/><b>Deaths:</b> " + d.deaths
                + "<br/><b>Date:</b> " + formatTime(d.date)
            )
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
}

function mouseout(d) {
    d3.select("path#line-" + d.state.replace(" ","_") + ".line").attr("class", "line");
    d3.select("text#label-" + d.state.replace(" ","_") + ".label").attr("class", "label");

    tooltip.transition()
        .duration(500)
        .style("opacity", 0);
}

