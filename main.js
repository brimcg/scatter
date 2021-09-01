//Copyright Brian McGinnis 2017

var color = d3.scaleOrdinal(d3.schemeCategory10);
var channels = 128;

//layout view
var body = d3.select("body")
	.style("font-family", "san-serif")
	.on("dblclick.zoom", null);

//main
var main = body.append("div")
	.attr("id", "main");
var mainWidth = main.property("clientWidth");
	
//Create scatter plot
var plot = new Scatter("#main", mainWidth, mainWidth/2.5);

//Establish scatter plot data
var exampleData = new ScatterData();
exampleData.loadX(d3.range(channels));
exampleData.scales(exampleData.autoX(), [0, 100]);
exampleData.labels("Channel", "% of Full Scale");
exampleData.pushReferenceY(0);
exampleData.pushReferenceY(50, "yellow");
exampleData.pushReferenceY(100, "red");
exampleData.transit(750);

//Update example data
var noise = d3.randomNormal(0, 0.025);
var inc = true;
var power = 0;
var types = ["points", "line", "area"];
var typeinc = 0;

function update()
{
	if(inc)
	{
		var line = [];
		var peak = Math.pow(exampleData.x.data[channels-1], power);

		exampleData.x.data.forEach(function(x, i)
		{
			line.push(100*(noise() + Math.pow(x, power)/peak));  //Zero base area in this example
			if(!(i % 10))
			{
				line.pop();
				line.push(null);
			};
		});
		exampleData.pushY(line, types[typeinc], color(power), "x^" + power);
		if(power < 12)
		{
			power+=2;
		}
		else
		{
			inc = false;
		}
	}
	else
	{
		if(power > 0)
		{
			exampleData.popY();
			power-=2;
		}
		else
		{
			exampleData.popY();
			inc = true;
			typeinc = (typeinc+1)%3;
		}
	}
	exampleData.scales(null, exampleData.autoY());
	plot.update(exampleData);
}

setInterval(update, 1000);
