//Copyright Brian McGinnis 2021
var color = d3.scaleOrdinal(d3.schemeCategory10);

//layout view
d3.select("body")
	.style("font-family", "san-serif")
	.on("dblclick.zoom", null);

//Create scatter plot
var plot = new Scatter("#Plot", 640, 480);

var dataArea = d3.select("#Data").append("textarea")
	.attr("rows", "25")
	.attr("cols", "75")
	.text("-1,-1,-2\n0,0,0\n1,1,2\n");

var transit = 1000;

function openPage(tabName) {
	d3.selectAll(".tabcontent").style("display", "none");
	d3.selectAll(".tabactive").attr("class", "tablink");
	d3.select("#tab"+tabName).attr("class", "tabactive");
	d3.select("#"+tabName).style("display", "block");
	if(tabName == "Plot") { update(); }
}

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
	
	var plotData = new ScatterData();
	plotData.loadX(dataParsed[0]);
	dataParsed.slice(1).forEach(function(d, i) {
		plotData.pushY(d, "line", color(i));
		plotData.pushY(d, "points", color(i), null, 5);
	});
	plotData.scales(plotData.autoX(), plotData.autoY());
	plotData.labels("Domain", "Range");
	plotData.pushReferenceX(0);
	plotData.pushReferenceY(0);
	plotData.transit(transit);

	plot.update(plotData);
}

//Let's go!
openPage("Data");
update();
