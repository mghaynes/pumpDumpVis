# Pump and Dump Interactive Visualization
Team 3, CSE6242 (Data and Visual Analytics)

This visualization uses JavaScript. Therefore, you will need an http server to see it. Some of the packages used in the visualization are downloaded from a CDN, so you will also need internet access. A quick way to get the visualization running is to first clone the git repo. Then, in the local directory that contains the repo, run the followg command:
```
python -m SimpleHTTPServer
```

Once the server is running, open a web browser and go to localhost:8000. You should see the visualization.

## How to Use the Visualization

The visualization consists of several connected charts.

### The Heat Map
The heat map is the main visualizaiton. The y-axis is a list of stocks, the x-axis is time. The map coloration is based on the hype score for a stock on a given day. If there is no twitter data on a given day, the stock is assigned a hype score of 0, and the map is colored a neutral, light blue color. If the stock has positive hype (which roughly corresponds to positive twitter sentiment), the map is colored red on a sliding scale. That is, more hyped stocks are darker red, while less hyped stocks are pink. In a similar vane, a sliding green scale is used for stocks with negative hype. The intuition behind this is that pump and dump schemes aim to promote stocks for gain. Therefore, a stock with a lot of positive sentiment is potentially a pump and dump candidate, while a stock with negative sentiment is probably not a pump and dump candidate. From the heat map, the user can quickly ascertain which stocks might be worth further investigation.

#### Semantic Zoom
The user can select a stock of interest on the heat map by clicking on the stock. Doing so greys out the other stocks on the chart, leaving only the coloring for the selected stock visible. In addition, selecting a stock creates a price and volume chart for the selected stock beneath the heat map. Only one stock at a time can be selected. To show all stocks again, simply click on the currently displayed stock a second time.

### Slider Charts
There are three slider charts: date slider, hype slider, and price slider.

The date slider allows the user to select a specific date range of interest. The user simply clicks on the first date of interest and drags to the last date of interest. This creates a brush effect showing which dates are selected. On the heat map, unselected dates are greyed out. On the hype and price slider, values not present in the date range are removed.

The hype slider and price slider work in a similar vane to the date slider. These sliders allow the user to select hype range or price range of interest and see only stocks that match that criteria colored on the heat map. For example, if the user only wants to see stocks with positive hype, the user merely selects stocks with hype greater than 0 using the hype slider.

#### Date Chart
In addition to being a slider, the y-axis on the date chart shows cumulative hype by day. The resulting spike chart allows the user to see at a glance general trends for hype. For example, a wide spread pump and dump scheme involving multiple stocks would cause the cumulative hype score to spike, thus visually indicating an area of interest for an analyst.

#### Hype Chart
In addition to being a slider, the y-axis on the date chart shows a hype histogram. 

#### Price Chart
In addition to being a slider, the y-axis on the price chart shows a price histogram. 

## Updating Stock Data
We pulled financial stock data and twitter data separately. In addition, we created a financial file for each stock and a hype file for each stock. We use a script to merge these disparate files. To merge them, put all the hype related files in a folder named 'hype'. Put all the stock data in a folder named 'stocks'. Then run the merge code with the following command:
```
python mergedata.py
```
###### Have questions or want to contribute to this visualization? Email me at mghaynes@gatech.edu. 
