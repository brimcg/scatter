//Copyright Brian McGinnis 2021

var color = d3.scaleOrdinal(d3.schemeCategory10);

//layout view
var body = d3.select("body")
	.style("font-family", "san-serif")
	.on("dblclick.zoom", null);

//Create scatter plot
var plot = new Scatter("#Plot", 640, 480);

var dataArea = d3.select("#Data").append("textarea")
	.attr("id", "dataArea")
	.attr("name", "dataArea")
	.attr("rows", "25")
	.attr("cols", "75")
	.text("X,Y\n0,0\n1,1\n");

var transit = 1000;

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
		plotData.pushY(d, null, color(i));
	});
	plotData.scales(plotData.autoX(), plotData.autoY());
	plotData.labels("X-axis", "Y-axis");
	plotData.pushReferenceX(0);
	plotData.pushReferenceY(0);
	plotData.transit(transit);

	plot.update(plotData);
}

update();
