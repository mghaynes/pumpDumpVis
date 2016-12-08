var lg_width = parseInt(d3.select('#hype_heatmap').style('width'), 10)
var md_width = parseInt(d3.select('#hype_histogram').style('width'), 10)

// Create dc chart objects                                      
var hypeHeatMap = dc.heatMap("#hype_heatmap");

// Load data
d3.json("/data/stocks.json", function(error, data) {
    // Convert date strings to Date objects
    data.forEach(function(d) {
        d.date = new Date(d.date);
        if (d.price === 'NaN'){
          d.price = NaN
        }
    });
    
    // Create crossfilter object
    
    var ndx = crossfilter(data); 
    
    
    // Establish date range
    var dateDim = ndx.dimension(function(d) {return d.date;});
    var dateSumGroup = dateDim.group().reduceSum(function(d){return d.hype});

    var minDate = new Date(dateDim.bottom(1)[0].date),
        maxDate = new Date(dateDim.top(1)[0].date)

    // Create crossfilter filters
    var heatDim = ndx.dimension(function(d){
        return [d.date, d.id]
    })

    var heatGroup = heatDim.group().reduce(
                /* callback for when data is added to the current filter results */
                function (p, v) {
                    ++p.count;
                    p.hype = v.hype;
                    p.price = v.price;
                    p.ticker = v.ticker
                    return p;
                },
                /* callback for when data is removed from the current filter results */
                function (p, v) {
                    --p.count;
                    p.hype = null
                    p.price = v.price
                    p.ticker = v.ticker
                    return p;
                },
                /* initialize p */
                function () {
                    return {count: 0, hype: null, price: null, ticker: null};
                }
            );
    var hypeDimension = ndx.dimension(function (d) {
       return d.hype;
    }),
        minHype = hypeDimension.bottom(1)[0].hype
        maxHype = hypeDimension.top(1)[0].hype

        hypeCountGroup = hypeDimension.group().reduceCount();
    priceDimension = ndx.dimension(function (d) {
       return d.price;
    })

    var priceCountGroup = priceDimension.group().reduceCount(),
        maxPrice = priceDimension.top(1)[0].price

    var heatColorMapping = function(d) {
        if (d === null){
           return d3.scale.linear().domain([0,0]).range(["#e5e5e5", "#e5e5e5"])(d);        
        }
        if (d < 0) {
            return d3.scale.linear().domain([minHype, 0]).range(["green", "#e2ffe9"])(d);
        }
        else if (d === 0) {
          return d3.scale.linear().domain([0, 0]).range(["#addfff", "#addfff"])(d);
        }
        else {
            return d3.scale.linear().domain([0, maxHype]).range(["#ffe5e2", "red"])(d);
        }
    };
    heatColorMapping.domain = function() {
        return [minHype,maxHype];
    };
    var stockDim = ndx.dimension(function(d) {return d.id;}),
        selectedStock = null


    hypeHeatMap
      .width(lg_width)
      .height(275)
      .dimension(heatDim)
      .group(heatGroup)
      .keyAccessor(function(d) { return d.key[0]; })
      .valueAccessor(function(d) { return d.key[1]; })
      .colorAccessor(function(d) { return d.value.hype; })  
      .title(function(d) {
        return "Stock: " + idToLabel(d.key[1]) + "\n" +
               "Date: " + parseDate(d.key[0]) + "\n" +
               "Price: $" + d.value.price + "\n" +
               "Hype: " + d.value.hype
        })
      .margins({top: 10, right: 30, bottom: 40, left: 40})
      .colors(heatColorMapping)
      .calculateColorDomain()      
      .yAxisOnClick(function(d) {
        if (selectedStock !== d) {
          stockDim.filterAll()
          stockDim.filter(d)  
          selectedStock = d
          var dateDim = ndx.dimension(function(d) {return d.date;})
          var priceGroup = dateDim.group().reduceSum(function(d) {return +d.price})
          var volumeGroup = dateDim.group().reduceSum(function(d) {return d.shareVol})
          d3.select('#stock_name').text(idToLabel(d))
          d3.select('#hold_price').append('div').attr('id','price_chart')
          d3.select('#hold_volume').append('div').attr('id','volume_chart')
          priceChart = dc.lineChart('#price_chart')
          priceChart
            .margins({top: 10, right: 30, bottom: 20, left: 70})
            .width(lg_width)
            .height(100)
            .x(d3.time.scale().domain([minDate, maxDate]))
            .renderArea(false)
            .brushOn(false)
            .renderDataPoints(true)
            .clipPadding(10)
            .yAxisLabel("Price")
            .dimension(dateDim)
            .group(priceGroup)
            .render()
          volumeChart = dc.barChart('#volume_chart')
            .margins({top: 10, right: 30, bottom: 20, left: 70})
            .width(lg_width)
            .height(100)
            .xUnits(function(d) {return 100})
            .x(d3.time.scale().domain([minDate, maxDate]))
            .brushOn(false)
            .clipPadding(10)
            .yAxisLabel("Volume")
            .dimension(dateDim)
            .group(volumeGroup)
            .render()
        }
        else {
          selectedStock = null
          d3.select('#stock_name').text('')
          d3.select('#price_chart').remove()
          d3.select('#volume_chart').remove()
          stockDim.filterAll()
        }
        dc.redrawAll()
      })
      .on("renderlet", function(chart) {
          chart.selectAll("g.box-group > rect")
               .attr("rx", null)
               .attr("ry", null)
          chart.selectAll(".rows.axis")
                .selectAll("text")
                .text(function(d){
                    return idToLabel(d)
                })
          chart.selectAll(".cols.axis")
                .selectAll("text")
                .text(function(d){
                    var label = d3.select(this).text()
                    return parseDate(new Date(label))
                })
                .style("text-anchor","end")
                .attr("transform", function(d) {
                        var textbox = d3.select(this),
                         x = +textbox.attr("x"),
                         y = +textbox.attr("y") 
                        return "rotate(-45,"+x+","+y+")";
                })
        })
      .on('preRender', function(chart) {
      // try to hide flickering from renderlet
      chart.transitionDuration(0);
      })
      .on('postRender', function(chart) {
      chart.transitionDuration(0);
      }); 

    var slider_chart_height = 160
    var hypeHistogram = dc.barChart("#hype_histogram")
                          .width(md_width)
                          .height(slider_chart_height)
                          .dimension(hypeDimension)
                          .group(hypeCountGroup)
                          .xUnits(function(d) {return 50})                          
                          .x(d3.scale.linear().domain([minHype, maxHype]))
                          .yAxisLabel("Frequency")
                          .xAxisLabel("Hype")
                          .elasticX(true)
                          .elasticY(true)
    hypeHistogram.xAxisMax = function() { return 1.02 * maxHype }
    hypeHistogram.xAxisMin = function() { return .98 * minHype }


    var priceHistogram = dc.barChart("#price_histogram")
                          .width(md_width)
                          .height(slider_chart_height)
                          .dimension(priceDimension)
                          .group(priceCountGroup)
                          .xUnits(function(d) {return 50})
                          .x(d3.scale.linear().domain([0,maxPrice]))
                          .yAxisLabel("Frequency")
                          .xAxisLabel("Price")
                          .elasticX(true)
                          .elasticY(true)
    priceHistogram.xAxisMax = function() { return 1.05 * maxPrice }
    priceHistogram.xAxisMin = function() { return -0.005 }

    
    var dateChart = dc.barChart("#date_chart")
                      .margins({top: 10, right: 30, bottom: 20, left: 70})
                      .width(lg_width)
                      .height(slider_chart_height)
                      .dimension(dateDim)
                      .group(dateSumGroup)
                      .x(d3.time.scale().domain([minDate,maxDate]))
                      .yAxisLabel("Cumulative Hype")
                      .elasticY(true)
                      .on("renderlet", function(chart) {
                          dc.events.trigger(function(){
                          })
                    })
    dateChart.xAxisMax = function() {return new Date(maxDate).setDate(maxDate.getDate() + 3);}
    dateChart.xAxisMin = function() {return new Date(minDate).setDate(minDate.getDate() - 3);}


    dc.renderAll();
}); //end d3.json function

parseDate = d3.time.format("%m/%d/%y")

function idToLabel(id) {
    if (id==="1" || id===1) { return "ADVT" }
    if (id==="2" || id===2) { return "BIEL" }
    if (id==="3" || id===3) { return "CNUCF" }
    if (id==="4" || id===4) { return "CYNK" }
    if (id==="5" || id===5) { return "EEGI" }
    if (id==="6" || id===6) { return "ERBB" }
    if (id==="7" || id===7) { return "FFFC" }
    if (id==="8" || id===8) { return "FWDG" }
    if (id==="9" || id===9) { return "GCLL" }
    if (id==="10" || id===10) { return "GRUA" }
    if (id==="11" || id===11) { return "ICNM" }
    if (id==="12" || id===12) { return "JTCMF" }
    if (id==="13" || id===13) { return "MJMJ" }
    if (id==="14" || id===14) { return "NERG" }
    if (id==="15" || id===15) { return "NWCI" }
    if (id==="16" || id===16) { return "SFYWQ" }
    if (id==="17" || id===17) { return "TBEV" }
    if (id==="18" || id===18) { return "UPOT" }      
    return id
}
