Copyright Brian McGinnis 2021

Scatter plot web app will plot CSV (comma-separated values) data shown in textarea.  Data is editable and can contain multiple columns of Y data..



Scatter.js is a 2d plotting script, implemented with d3 version 4, intended to plot multiple arrays of Y values that share a common array of X values.  It is your responsibility to ensure matching array size.

Two classes are used:

ScatterData() contains the data to be plotted and it contains the plot options for each Y array.  It also contains the plot configuration (scaling, labels, etc.)  ScatterData implements a number of helper methods to simplify loading and updating the data object.

	var data = new ScatterData();
	
	//data management
	data.loadX(dataX, label);
	data.pushY(dataY, type, color, label, pointRadius);
		//dataY is array of arrays [[valueY, baseY], ...]
		//type supports "points", "line", or "area", defaults to "line" if not specified
	data.popY();
	data.updateY(i, dataY, type, color, label, pointRadius);
		//i is index of previously pushed Y data object
	
	//plot configuration
	data.scales([minX, maxX], [minY, maxY]);
	data.autoX();
		//returns extent of X array data, appropriate for use in .scales method
	data.autoY();
		//returns extent of all Y array data, including baseY if plot type is "area", appropriate for use in .scales method
	data.labels(labelX, labelY);
	data.transit(time);
		//time is update transition time in milliseconds
	
	//additional reference lines
	data.pushReferenceX(value, color);
	data.popReferenceX();
	data.pushReferenceY(value, color);
	data.popReferenceY();
	
Scatter() implements the plotting in the DOM.

	var plot = new Scatter("container element", width, height);
	plot.update(data);
		//data must be typeof ScatterData

Global style for scatter plots are defined by

	scatter.css
