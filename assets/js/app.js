function resize(){
  var svgArea = d3.select("#scatter").select("svg");
  var svgWidth= parseInt(d3.select("#scatter").style("width"));
  var svgHeight= svgWidth - svgWidth / 3.9;

  if (!svgArea.empty()) {
    svgArea.remove();
  }
 
// var w = parseInt(d3.select("#scatter").style("width"));
// var h = w - w / 3.9;
var margin = {
  top: 20,
  right: 100,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";
// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]),
      d3.max(data, d => d[chosenXAxis])
    ])
    .range([0, width]);

  return xLinearScale;

}
function yScale(data, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]),
      d3.max(data, d => d[chosenYAxis])
    ])
    .range([height, 0]);

  return yLinearScale;

}
// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}
// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis, chartGroup) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d=> newYScale(d[chosenYAxis]));
  
  // chartGroup.selectAll("text")
  //   .data(data)
  //   .enter()
  //   .append("text")
  //   .attr("x", d => xLinearScale(d[chosenXAxis]))
  //   .attr("y", d => yLinearScale(d[chosenYAxis]))
  //   .attr("class", "stateText")
  //   .text(d=> d.abbr);

  return circlesGroup;
}
    // function used for updating state abbr with a transition to new locations
    function renderAbbr(abbrGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis) {

      abbrGroup.transition()
          .duration(1000)
          .attr("y", d => xLinearScale  (d[chosenXAxis]))
          .attr("x", d => yLinearScale(d[chosenYAxis]));

      return abbrGroup;
  }

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  var ylabel;
  var xlabel;

  if (chosenXAxis === "poverty") {
    if (chosenYAxis === "obesity"){
      ylabel= "Obesity: "
      xlabel = "Poverty(%): ";
    }
    else if (chosenYAxis === "smokes"){
      ylabel= "Smokes"
      xlabel = "Poverty(%): ";
    }
    else if (chosenYAxis=== "healthcare"){
      ylabel= "Healthcare: "
      xlabel = "Poverty(%): ";
    }  
  }
  else if(chosenXAxis === "age"){
    if (chosenYAxis === "obesity"){
      ylabel= "Obesity: "
      xlabel = "Age(median): ";
    }
    else if (chosenYAxis === "smokes"){
      ylabel= "Smokes"
      xlabel = "Age(median): ";
    }
    else if (chosenYAxis=== "healthcare"){
      ylabel= "Healthcare: "
      xlabel = "Age(median): ";
    }  
  }

  else if (chosenXAxis === "income"){
    if (chosenYAxis === "obesity"){
      ylabel= "Obesity: "
      xlabel = "Household Income(median): ";
    }
    else if (chosenYAxis === "smokes"){
      ylabel= "Smokes"
      xlabel = "Household Income(median): ";
    }
    else if (chosenYAxis=== "healthcare"){
      ylabel= "Healthcare: "
      xlabel = "Household Income(median): ";
    }  
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${ylabel}${d[chosenYAxis]}%<br>${xlabel} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(data, err) {
  if (err) throw err;

  // parse data
  data.forEach(function(d) {
    d.poverty = +d.poverty;
    d.age = +d.age;
    d.obesity = +d.obesity;
    d.smokes = +d.smokes;
    d.healthcare = +d.healthcare;
    d.income = +d.income;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(data, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(data, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 16)
    // .attr("class", d=> )
    .attr("class", "stateCircle")
    .attr("opacity", ".5");
    var stateAbbr = chartGroup.append("g")
    var abbrGroup = stateAbbr.selectAll("text")
    .data(data)
    .enter()
    .append("text")
    .text(d => d.abbr)
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]) + 3)
    .attr("text-anchor", "middle")
    // .style("fill", "white")
    .style("font-size", "12px")

  // Create group for three x and y -axis labels

  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (median)");


var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (median)");

var ylabelsGroup = chartGroup.append("g")
.attr("transform", "rotate(-90)")
.attr("dy", "1em")
  

  var obesityLabel = ylabelsGroup.append("text")
    .attr("x", 0 - (height / 2))
    .attr("y", 20 - margin.left)
    .attr("value", "obesity") // value to grab for event listener
    .classed("active", true)
    .text("Obesity (%)");

  var smokesLabel = ylabelsGroup.append("text")
    .attr("x", 0 - (height / 2))
    .attr("y", 40 - margin.left)
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes (%)");


var healthcareLabel = ylabelsGroup.append("text")
    .attr("x", 0 - (height / 2))
    .attr("y", 60 - margin.left)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("Lacks Healthcare (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  // y axis labels event listener
  ylabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var yvalue = d3.select(this).attr("value");

     if (yvalue !== chosenYAxis) {
      chosenYAxis = yvalue;
      // console.log(chosenYAxis)
      yLinearScale = yScale(data, chosenYAxis);
      yAxis= renderYAxes(yLinearScale, yAxis);
      circlesGroup = renderCircles(circlesGroup,yLinearScale, chosenYAxis, xLinearScale, chosenXAxis, chartGroup);
      abbrGroup = renderAbbr(abbrGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
        // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
      if (chosenYAxis === "obesity"){
        obesityLabel
      .classed("active", true)
      .classed("inactive", false);
      smokesLabel
      .classed("active", false)
      .classed("inactive", true);
      healthcareLabel
      .classed("active", false)
      .classed("inactive", true);
      }
      else if (chosenYAxis === "smokes"){
        obesityLabel
      .classed("active", false)
      .classed("inactive", true);
      smokesLabel
      .classed("active", true)
      .classed("inactive", false);
      healthcareLabel
      .classed("active", false)
      .classed("inactive", true);
      }
      else if (chosenYAxis === "healthcare"){
        obesityLabel
      .classed("active", false)
      .classed("inactive", true);
      smokesLabel
      .classed("active", false)
      .classed("inactive", true);
      healthcareLabel
      .classed("active", true)
      .classed("inactive", false);
      }

     }
    });
  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
    if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;
        
        // console.log(chosenXAxis)
        
        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(data, chosenXAxis);
        
        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);
       
        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup,yLinearScale, chosenYAxis, xLinearScale, chosenXAxis, chartGroup);
        abbrGroup = renderAbbr(abbrGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

//         // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
            
        }
        else if (chosenXAxis === "age"){
            povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {

          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
}); 
};
resize()

d3.select(window).on("resize", resize)