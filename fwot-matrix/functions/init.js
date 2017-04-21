function init(fwots, subRowTitle, subSubRowTitle, cols, params, tags, width, height) {
	//test parameters
	//[{reg:"toto"}, {reg:"tata"}], ["param1","param2"]

	//remove the sample matrix
	this.go().select('svg').remove();
	var that = this; //to be used in callback methods
	//create our matrix group, it is a singleton, that's why the data().enter()
	var rootNode = this.go().selectAll(".matrix").data([0]).enter().append('g').classed("matrix", true);

	var acs = this.rows = fwots; // rows holds the aircrafts (ie rows[0].reg...)
	this.cols = cols; // params holds the column names

	this.params = cols;
	this.tags = tags;
	this.subRowTitleFunction=subRowTitle;
	this.subSubRowTitleFunction=subSubRowTitle;
	if(params instanceof Array) {
		this.params = params; // params holds the param names to fetch from the server
	}


	var sort = function(colIdx) {
		var order = d3.range(that.rows.length).sort(function(ap, bp) {
			var a = that.matrix[ap][colIdx];
			var b = that.matrix[bp][colIdx];
			if(!isFinite(b-a))
			return !isFinite(a) ? 1 : -1;
			else
			return b-a;
		});
		y.domain(order);
		svg.transition().selectAll(".row")
		.duration(function(d, i) {
			return Math.random()*1000+1000;
		})
		.delay(function(d, i) {
			return Math.random()*500;
		})
		.attr("transform", function(d, i) { return "translate(0," + y(i) + ")"; });
	};


	//the function for filling the cells
	function onCell(fwot, rowIdx) {
		var cell = d3.select(this).selectAll(".cell")
		.data(that.cols)
		.enter().append('g')
		.attr("id", function(d, i) {return fwot.reg+"-"+i;})
		.attr("class", "cell")
		.attr("transform", function(d, i) { return 'translate('+(x(i)+2)+', 0)'; })
		.on('click', function(d) {
			if (typeof d.click == 'function') {
				d.click(fwot, that.timespan);
			}
		});

		var rectW = x.rangeBand()-2;
		var rectH = y.rangeBand()-2;

		cell.append('title').text(function(d, i) { return that.cols[i].tooltip; });

		cell.append("rect")
		.attr("width", rectW)
		.attr("height",rectH)
		.style("fill", 'black');

		cell.append('text')
		.text('')
		.attr('alignment-baseline', 'middle')
		.attr("text-anchor", "middle")
		.attr('x', rectW/2)
		.attr('y', rectH/2)
		.attr('fill', 'white')
		.attr('font-family', 'Verdana');

	}


	//create the SVG
	var margin = {top: 130, right: 0, bottom: 100, left: 80};

	var x = d3.scale.ordinal().rangeBands([0, width-margin.left]),
	y = d3.scale.ordinal().rangeBands([0, height-margin.top+100]);

	x.domain(d3.range(this.cols.length));
	y.domain(d3.range(acs.length));

	var svg = rootNode
	//    .append("svg")
	//        .attr("width", width + margin.left + margin.right)
	//        .attr("height", height + margin.top + margin.bottom)
	//        .style("margin-left", margin.left + "px")
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	svg.append("rect")
	.attr("class", "background")
	.style("fill", "none")
	.style("stroke", "#333")
	.style("stroke-width", 3)
	.attr("width", width-margin.left)
	.attr("height", height);


	//create the SVG rows
	var row = svg.selectAll(".row")
	.data(acs)
	.enter().append("g")
	.attr("class", "row")
	.attr("transform", function(d, i) { return "translate(0," + y(i) + ")"; })
	.each(onCell);

	row.append("line")
	.attr("x2", width-margin.left)
	.style("stroke", "#333")
	// .style("stroke-width", 3); maddy Novemeber2016:
	.style("stroke-width", 2);
	var rowHead=row.append("g").attr("class", "ac-head")
	.attr("id", function(d, i) {return acs[i].reg;})
	.on('click', function(d, i) {
		WILCO.gotoPage("/wilco/#/"+acs[i].reg+"/history");
	});


	rowHead.append("text")
	.attr('fill', 'lightgray')
	.attr("x", -6)
	.attr("y", y.rangeBand() / 4)
	.attr("dy", ".32em")
	.attr("text-anchor", "end")
	.text(function(d, i) { return acs[i].reg; });

	rowHead.append("text")
	.classed('ac-head-sub', true)
	.attr('fill', 'gray')
	.attr("x", -6)
	.attr("y", 15+y.rangeBand() / 4)
	.attr("font-size", "9")
	.attr("text-anchor", "end")
	.text("??");

	//Nov2016: try to append the date of SN
	rowHead.append("text")
	.classed('ac-head-sub-sub', true)
	.attr('fill', 'gray')
	.attr("x", -6)
	.attr("y", 25+y.rangeBand() / 4)
	.attr("font-size", "9")
	.attr("text-anchor", "end")
	.text("..");



	//create the SVG columns
	var column = svg.selectAll(".column")
	.data(this.cols)
	.enter().append("g")
	.attr("class", "column")
	.attr("transform", function(d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

	column.append("line")
	.style("stroke", "#333")
	// .style("stroke-width", 3) //maddy Nov 2016:
	.style("stroke-width", 2)
	.attr("x1", -width);

	column.append("text")
	.attr("class", "param-head")
	.attr('fill', 'gray')
	.attr('font-family', 'Verdana')
	.attr("x", 6)
	.attr("y", x.rangeBand() / 2)
	.attr("dy", ".32em")
	.attr("font-size", "12") //20 March 2017 - to make param visible
	.attr("text-anchor", "start")
	.on("click", function(param, i) {sort(i);})
	.text(function(d, i) { return that.cols[i].name; })
	.append('title').text(function(d, i) { return that.cols[i].tooltip; });

}
