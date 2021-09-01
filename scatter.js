//Copyright Brian McGinnis 2017

// ScatterData() is roughly like an MVC model, though it includes some
// view-ish bits. It contains the data to be plotted and it contains
// the plot options for each Y array.  It also contains the plot
// configuration (scaling, labels, etc.) ScatterData implements a
// number of helper methods to simplify loading and updating the data
// object.
function ScatterData()
{
	this.scaleX = [0, 1];
	this.scaleY = [0, 1];
	this.labelX = "X";
	this.labelY = "Y";
	this.transitionDuration = 250;
	this.x;
	this.y = [];
	this.refLineX = [];
	this.refLineY = [];
	
}

ScatterData.prototype.loadX = function(data, label)
{
	this.x = {data: data, label: (label ? label : "")};
}

ScatterData.prototype.formatY = function(data)
{
	if(Array.isArray(data[0])) return data;
	var newData = [];
	data.forEach(function(d)
	{
		newData.push([d, 0]);
	});
	return newData;
}

ScatterData.prototype.pushY = function(data, type, color, label, pointRadius)
{
	this.y.push({data: this.formatY(data), type: (type ? type : "line"), color: (color ? color : "steelblue"), label: (label ? label : ""), radius: (pointRadius ? pointRadius : 2)});
}

ScatterData.prototype.popY = function()
{
	this.y.pop();
}

ScatterData.prototype.pushReferenceX = function(data, color)
{
	this.refLineX.push({data: data, color: (color ? color : "black")});
}

ScatterData.prototype.popReferenceX = function()
{
	this.refLineX.pop();
}

ScatterData.prototype.pushReferenceY = function(data, color)
{
	this.refLineY.push({data: data, color: (color ? color : "black")});
}

ScatterData.prototype.popReferenceY = function()
{
	this.refLineY.pop();
}

ScatterData.prototype.updateY = function(i, data, type, color, label, pointRadius)
{
	this.y[i] = {data: (data ? data : this.y[i].data), type: (type ? type : this.y[i].type), color: (color ? color : this.y[i].color), label: (label ? label : this.y[i].label), radius: (pointRadius ? pointRadius : this.y[i].pointRadius)};
}

ScatterData.prototype.scales = function(xs, ys)
{
	if(xs) this.scaleX = xs;
	if(ys) this.scaleY = ys;
}

ScatterData.prototype.labels = function(xl, yl)
{
	if(xl) this.labelX = xl;
	if(yl) this.labelY = yl;
}

ScatterData.prototype.transit = function(t)
{
	this.transitionDuration = t;
}

ScatterData.prototype.autoX = function()
{
	return d3.extent(this.x.data);
}

ScatterData.prototype.autoY = function()
{
	var result = [];
	this.y.forEach(function(d)
	{
		d.data.forEach(function(e)
		{
			result.push(e[0]);
			if(d.type == "area") result.push(e[1]);
		});
	});
	return d3.extent(result);
}

// Scatter() is like an MVC view; implements the plotting in the DOM.
function Scatter(container, w, h, margin = {top: 20, right: 20, bottom: 30, left: 50})
{
    var clipid = "plotclip" + container.replace(/[^a-z0-9+]+/gi, '_');

	var width = w - margin.left - margin.right;
	var height = h - margin.top - margin.bottom;

	var xS = d3.scaleLinear()
    .rangeRound([0, width]);

	var yS = d3.scaleLinear()
    .rangeRound([height, 0]);

	var xAxis = d3.axisBottom()
    .scale(xS)
    .tickSizeInner(-height)
    .tickSizeOuter(-height-0.5)
    .tickPadding(6);

	var yAxis = d3.axisLeft()
    .scale(yS)
    .tickSizeInner(-width)
    .tickSizeOuter(-width-0.5)
    .tickPadding(6);

	var line = d3.line()
		.defined(function(d){ return d.y[0] !== null; })
    .x(function(d) { return xS(d.x); })
    .y(function(d) { return yS(d.y[0]); });

	var area = d3.area()
		.defined(function(d){ return d.y[0] !== null; })
    .x(function(d) { return xS(d.x); })
    .y0(function(d) { return yS(d.y[0]); })
    .y1(function(d) { return yS(d.y[1]); });

	var svg = d3.select(container).append("svg")
    .attr("width", w)
    .attr("height", h)
	  .append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	svg.append('clipPath')
		.attr('id', clipid)
		.append('rect')
			.attr('width', width)
			.attr('height', height);


	this.update = function(data)
	{
		xS.domain(data.scaleX);
		yS.domain(data.scaleY);

		//Update X axis
		var axisX = svg.selectAll(".axisX")
				.data([0]);
		
		axisX.enter().append("g")
				.attr("class", "axisX")
			 .merge(axisX)
				.attr("transform", "translate(0," + height + ")")
				.transition().duration(data.transitionDuration).call(xAxis);
				
		//Update Y axis
		var axisY = svg.selectAll(".axisY")
				.data([0]);

		axisY.enter().append("g")
				.attr("class", "axisY")
			 .merge(axisY)
				.transition().duration(data.transitionDuration).call(yAxis);
				
		//Update X reference lines
		var refX = svg.selectAll(".refX")
				.data(data.refLineX);
		
		refX.exit()
			.transition().duration(data.transitionDuration)
			.style("opacity", 1e-6)
			.remove();		

		refX.enter().append("path")
						.attr("class", "refX")
						.attr('clip-path', 'url(#' + clipid + ')')
						.style("opacity", 1e-6)
					.merge(refX)
						.attr("stroke", function(d) { return d.color; })
						.datum(function(d) {
							if(!data.scaleY[0]) return [];
							return [
							{ y: [data.scaleY[0]], x: d.data },
							{ y: [data.scaleY[1]], x: d.data }
							]; })
						.transition().duration(data.transitionDuration)
							.style("opacity", null)
							.attr("d", line);
				
		//Update Y reference lines
		var refY = svg.selectAll(".refY")
				.data(data.refLineY);
		
		refY.exit()
			.transition().duration(data.transitionDuration)
			.style("opacity", 1e-6)
			.remove();		

		refY.enter().append("path")
						.attr("class", "refY")
						.attr('clip-path', 'url(#' + clipid + ')')
						.style("opacity", 1e-6)
					.merge(refY)
						.attr("stroke", function(d) { return d.color; })
						.datum(function(d) {
							if(!data.scaleY[0]) return [];
							return [
							{ x: data.scaleX[0], y: [d.data] },
							{ x: data.scaleX[1], y: [d.data] }
							]; })
						.transition().duration(data.transitionDuration)
							.style("opacity", null)
							.attr("d", line);
		
		//Update plots
		var plots = svg.selectAll(".plot")
			.data(data.y);
		
		plots.exit()
			.transition().duration(data.transitionDuration)
			.style("opacity", 1e-6)
			.remove();		

		plots.enter().append("g")
			.attr("class", "plot")
			.merge(plots)
			.each(updatePlot);
		
		function plotdata(x, y)
		{
			var data = [];
			x.forEach(function(d,i)
			{
				data.push({x: d, y: y[i]});
			});
			return data;
		}
		
		function updatePlot(d)
		{
			switch(d.type)
			{
				case "line":
					var plot = d3.select(this).selectAll(".line")
						.data([d]);
						
					plot.exit()
						.transition().duration(data.transitionDuration)
						.style("opacity", 1e-6)
						.remove();		

					plot.enter().append("path")
						.attr("class", "line")
						.attr('clip-path', 'url(#' + clipid + ')')
						.style("opacity", 1e-6)
					.merge(plot)
						.attr("stroke", function(d) { return d.color; })
						.datum(function(d){ return plotdata(data.x.data, d.data);})
						.transition().duration(data.transitionDuration)
							.style("opacity", null)
							.attr("d", line);
					break;
				case "area":
					var plot = d3.select(this).selectAll(".area")
						.data([d]);
						
					plot.exit()
						.transition().duration(data.transitionDuration)
						.style("opacity", 1e-6)
						.remove();		

					plot.enter().append("path")
						.attr("class", "area")
						.attr('clip-path', 'url(#' + clipid + ')')
						.style("opacity", 1e-6)
					.merge(plot)
						.attr("fill", function(d) { return d.color; })
						.datum(function(d){ return plotdata(data.x.data, d.data);})
						.transition().duration(data.transitionDuration)
							.style("opacity", null)
							.attr("d", area);
					break;
				case "points":
					var plot = d3.select(this).selectAll(".point")
						.data(plotdata(data.x.data, d.data).filter(function(d){ return d.y[0] !== null; }));
						
					plot.exit()
						.transition().duration(data.transitionDuration)
						.style("opacity", 1e-6)
						.remove();		

					plot.enter().append("circle")
						.attr("class", "point")
						.attr('clip-path', 'url(#' + clipid + ')')
						.attr("r", function() { return d.radius; })
						.attr("cx", function(e) { return xS(e.x); })
						.attr("cy", function(e) { return yS(e.y[0]); })
						.style("opacity", 1e-6)
					.merge(plot)
						.attr("stroke", function(e) { return d.color; })
						.transition().duration(data.transitionDuration)
							.attr("r", function() { return d.radius; })
							.attr("cx", function(e) { return xS(e.x); })
							.attr("cy", function(e) { return yS(e.y[0]); })
							.style("opacity", null);
					break;
			}
		}
		
		//Update X axis label
		var axisLabelX = svg.selectAll(".axisLabelX")
				.data([0]);

		axisLabelX.enter().append("text")
				.attr("class", "axisLabelX")
				.style("text-anchor", "end")
			 .merge(axisLabelX)
				.attr("x", width-6)
				.attr("y", height-6)
				.text(data.labelX);

		//Update Y axis label
		var axisLabelY = svg.selectAll(".axisLabelY")
				.data([0]);
		
		axisLabelY.enter().append("text")
				.attr("class", "axisLabelY")
				.attr("transform", "rotate(-90)")
				.attr("x", -6)
				.attr("y", 6)
				.attr("dy", "1em")
				.style("text-anchor", "end")
			 .merge(axisLabelY)
				.text(data.labelY);
	};
}
