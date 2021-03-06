//Copyright Brian McGinnis 2021

//Initialize
var plot;
var color = d3.scaleOrdinal(d3.schemeCategory10);
var xa = d3.select("#xplotaspect").property("value");
var ya = d3.select("#yplotaspect").property("value");
var base = parseInt(d3.select("#Plot").node().clientWidth / (1.1*xa), 10);
var dataArea = d3.select("#Data").append("textarea")
	.style("width", xa*base+"px")
	.style("height", ya*base+"px")
	.style("resize", "none")
	.style("white-space", "pre")
	.text("-1,-1,-2\n0,0,0\n1,1,2\n");

//connect input disable to auto checkboxes
function disenable(control, item) {
	var ctl = d3.select(control);
	ctl.on("change", function() {
			d3.selectAll(item).property("disabled", ctl.property("checked"));	
		});
}

//Create scatter plot
function resize() {
	base = d3.select("#xplotsize").property("value") / xa;
	var maxbase = d3.select("#plotmax").property("value");
	xa = d3.select("#xplotaspect").property("value");
	ya = d3.select("#yplotaspect").property("value");
	var pd = d3.select("#Plot").style("display");
	d3.select("#Plot").style("display", "block");
	if(d3.select("#plotfit").property("checked")) {
		base = parseInt(d3.select("#Plot").node().clientWidth / (1.1*xa), 10);
		if(base > maxbase/xa) { base = maxbase/xa; }
	}
	d3.select("#Plot").style("display", pd);
	return [xa, ya];
}

function resizePlot() {
	var d = resize();
	d3.selectAll("svg").remove();
	plot = new Scatter("#Plot", d[0]*base, d[1]*base);
}

function resizeData() {
	var d = resize();
	dataArea = d3.select("textarea")
		.style("width", d[0]*base+"px")
		.style("height", d[1]*base+"px");
}

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
	resizeData();
	resizePlot();
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

	d3.selectAll(".plot").remove();
	plot.update(plotData);
}

//event handling
window.addEventListener("resize", function() {
	if("tabactive" == d3.select("#tabPlot").attr("class")) {
		update();
		return;
	}
	resizeData();
});
disenable("#yauto", ".ylimaxes");
disenable("#xauto", ".xlimaxes");
disenable("#plotfit", "#xplotsize");

//Let's go!
resizeData();
resizePlot();
openPage("Data");
