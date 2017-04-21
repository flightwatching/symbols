function updateMatrix(count, unit, refDate, preprocess) {
	var that = this;

	var processedLineCount = 0;

	_.each(this.cols, function(c) {
		c.minVal = +Infinity;
		c.maxVal = -Infinity;
	});

	this.matrix = d3.range(this.rows.length);
	//save the min/max dates
	this.timespan={
		max: moment.utc(),
		min: moment.utc()
	};
	if (refDate) {
		this.timespan.max = moment(refDate, "YYYY-MM-DDTHH:mm:ss");
	}
	this.timespan.min=moment(this.timespan.max).subtract(count, unit);

	var fillSvg = function() {
		for (var rowIdx=0; rowIdx<that.rows.length; rowIdx++) {
			var row = that.rows[rowIdx];
			for (var colIdx = 0; colIdx < that.cols.length; colIdx++) {
				var col = that.cols[colIdx];
				var val = that.matrix[rowIdx][colIdx];
				//compute the domain
				var domain = col.domain || [col.minVal, col.maxVal];
				var range = d3.scale.linear().domain(domain).range(col.colors).clamp(true);
				var cell = that.go().select("#"+row.reg+"-"+colIdx).transition();
				cell.select('rect').style("fill", range(val));
				if (col.text) {
					var txt = "--";
					if (typeof val != 'undefined') {txt=col.text(val);}
					cell.select('text').text(txt)
					.attr('fill', d3.rgb(range(val)).darker(2));
				}
			}
		}
	};

	var processLine = function(reg,nonFilteredData) {
		var data=nonFilteredData;
		if (preprocess) {
			data = preprocess(_.findWhere(that.rows, {reg:reg}), nonFilteredData);
		}
		//we find the index of the aircraft
		var row = -1;
		for (var rowIdx=0; rowIdx<that.rows.length; rowIdx++) {

			if (that.rows[rowIdx].reg === reg)
			row = rowIdx;
		}
		//for all the columns we evaluate the formula
		for (var colIdx = 0; colIdx < that.cols.length; colIdx++) {
			var col = that.cols[colIdx];
			var val = col.formula(data, reg);
			col.minVal = Math.min(col.minVal, val);
			col.maxVal = Math.max(col.maxVal, val);
			that.matrix[row][colIdx] = val;
		}

		//update FWOT head
		var subTxt = that.subRowTitleFunction(that.rows[row], data);
		that.go().select("#"+that.rows[row].reg).select('.ac-head-sub')
		.text(subTxt);
		var subsubTxt = that.subSubRowTitleFunction(that.rows[row], data);
		that.go().select("#"+that.rows[row].reg).select('.ac-head-sub-sub')
		.text(subsubTxt);

		processedLineCount++;
		//if all rows are processed, then we can fill
		if (that.rows.length === processedLineCount) {
			fillSvg();
		}
	};

	//pour avion (ligne), accède à WILCO
	for (var i=0; i<this.rows.length; i++) {
		that.matrix[i] = [];
		WILCO.getSampleTableForFwot(this.rows[i].reg, that.params, count, unit, refDate, function(reg, rows) {

			if (that.tags && that.tags.length>0) {
				WILCO.getEventsForFwot(reg, count, unit, refDate, {tag:that.tags}, function(reg, evts) {
					evts.map(function(evt) {
						var row = evt.tags.reduce(function(acc, t) {
							acc[t.id]=1;
							return acc;
						}, {Date:evt.computedDate});
						rows.push(row);
					});
					processLine(reg, rows);
				});
			} else {
				processLine(reg, rows);
			}

		});
	} //end of loop
}
