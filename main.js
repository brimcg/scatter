//Copyright Brian McGinnis 2021
var color = d3.scaleOrdinal(d3.schemeCategory10);

//Create scatter plot
d3.select("#Plot").style("display", "block");
var base = parseInt(d3.select("#Plot").node().clientWidth / 4.4, 10);
if(base > 160) { base = 160; }
var plot = new Scatter("#Plot", 4*base, 3*base);

var dataArea = d3.select("#Data").append("textarea")
	.style("width", 4*base+"px")
	.style("height", 3*base+"px")
	.style("resize", "none")
	.style("white-space", "pre")
	.text("-1,-1,-2\n0,0,0\n1,1,2\n");

d3.select("#yauto")
	.on("change", function() {
		d3.selectAll(".ylimaxes").property("disabled", d3.select("#yauto").property("checked"));	
	});
d3.select("#xauto")
	.on("change", function() {
		d3.selectAll(".xlimaxes").property("disabled", d3.select("#xauto").property("checked"));	
	});
d3.select("#plotfit")
	.on("change", function() {
		d3.select("#xplotsize").property("disabled", d3.select("#plotfit").property("checked"));	
	});

function openPage(tabName) {
	d3.selectAll(".tabcontent").style("display", "none");
	d3.selectAll(".tabactive").attr("class", "tablink");
	d3.select("#tab"+tabName).attr("class", "tabactive");
	d3.select("#"+tabName).style("display", "block");
	if(tabName == "Plot") { update(); }
}

var duration = 250;
function update()
{
	var data = d3.csvParseRows(dataArea.property("value"));
	var cols = 0;
	data.forEach(function(row) {
		if(row.length > cols) { cols = row.length };
	});

	var dataParsed = [];
	data.forEach(function(row) {
		var rowParsed = Array(cols);
		row.forEach(function(e, i) {
			val = parseFloat(e);
			rowParsed[i] = val;
		});
		if(!Object.is(NaN, rowParsed[0])) {
			dataParsed.push(rowParsed);
		}
	});
	dataParsed = d3.transpose(dataParsed);
	
	var styles = ["area", "line", "points"];
	var classes = ["area", "line", "point"];
//	styles.forEach(function(d, i) {
//		if(!d3.select("#plot"+d).property("checked")) { d3.selectAll("svg .plot ." + classes[i]).transition().duration(duration).remove(); }	
//	});

	var plotData = new ScatterData();
	plotData.loadX(dataParsed[0]);
	styles.forEach(function(s) {
		dataParsed.slice(1).forEach(function(d, i) {
			if(d3.select("#plot"+s).property("checked")) { plotData.pushY(d, s, color(i), null, 5); }
		});
	});

	var xext, yext;
	if(d3.select("#xauto").property("checked")) {
		xext = plotData.autoX();
		d3.select("#xmin").property("value", xext[0]);
		d3.select("#xmax").property("value", xext[1]);
	}
	else {
		xext = [+d3.select("#xmin").property("value"), +d3.select("#xmax").property("value")];
	}
	if(d3.select("#yauto").property("checked")) {
		yext = plotData.autoY();
		d3.select("#ymin").property("value", yext[0]);
		d3.select("#ymax").property("value", yext[1]);
	}
	else {
		yext = [+d3.select("#ymin").property("value"), +d3.select("#ymax").property("value")];
	}
	
	plotData.scales(xext, yext);
	plotData.labels(d3.select("#xlabel").property("value"), d3.select("#ylabel").property("value"));
	plotData.pushReferenceX(0);
	plotData.pushReferenceY(0);
	plotData.transit(duration)

	d3.selectAll("svg .plot").remove();
	plot.update(plotData);
}

//Let's go!
openPage("Data");
