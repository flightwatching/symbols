#fwot-matrix

`fwot-matrix` displays a table where
* lines are a set of fwots
* columns are configurable with your own formulas.

## How to use the matrix in a dashboard
`fwot-matrix` is a symbol. It can be included in any SVG dashbaord using the <symbol> and accessing it with

```
<use id="matrix_anim" ... xlink:href="#fwot-matrix">
</use>
```

The content of the symbol has no importance, as it is completely removed at fwot-matrix initialization.

Now you have 2 functions to handle the matrix: `init` and `updateMatrix`

First you have to call init to initialize the matrix:

```
matrix_anim.init(
	fwots,           // array of fwots
	subRowTitle,     //function(fwot) that returns a string
	subSubRowTitle,  //function(fwot) that returns a string
	cols,            //an array that contains a structure describing each column
	params,          //param name array to fetch from server
	tags,            //tag name array to fetch from server
	width,           //width of the matrix
	height           //height of the matrix
)
```

then you can fill it:

```
matrix_anim.updateMatrix(
  count,    //number of days, month, weeks...
  unit,     //unit of count: minutes, hours, days, weeks, months, years
  refDate,  //null of a string to which we have to request the params
  prefilter // function(fwot, rows) that is called before updating the matrix. returns the table of data to use in the matrix (see columns structure) );
```
