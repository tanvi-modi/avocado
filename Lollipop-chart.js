d3.csv("./data/avocadoprices.csv").then(function (data) {

    /*
    DEFINE DIMENSIONS OF SVG + CREATE SVG CANVAS
    */
    const width = document.querySelector("#chart-1").clientWidth;
    const height = document.querySelector("#chart-1").clientHeight;
    const margin = { top: 10, left: 250, right: 15, bottom: 250 };
    

    const svg = d3.select("#chart-1")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
        

    /*
    FILTER THE DATA
    */
    // var dataByRegionAndTypeAndYear = d3.group(data, d => d.region, d => d.type, d => d.year)
    var avrgDataByRegionAndTypeAndYear = d3.rollup(data, v => d3.mean(v, d => d.averagePrice), d => d.region, d => d.type, d => d.year)

    const regions = ["SanFrancisco", "LasVegas", "WestTexNewMexico", "SanDiego", "Chicago", "Detroit", "Columbus", "Nashville", "Boston", "NewYork", "Philadelphia", "Pittsburg", "Houston", "Orlando", "Baltimore", "Atlanta"];

    // Delete unnecessary regions from the data
    avrgDataByRegionAndTypeAndYear.forEach(function (value, key) {
        if (!regions.includes(key)) {
            // dataByRegionAndTypeAndYear.delete(key);
            avrgDataByRegionAndTypeAndYear.delete(key);
        }
    });

    console.log(avrgDataByRegionAndTypeAndYear);

    /*
    DETERMINE MIN AND MAX VALUES OF VARIABLES
    */

    const averagePrice = {
        min: Math.min(
            d3.min(avrgDataByRegionAndTypeAndYear, function (d) {
                return Math.min(
                    d[1].get('organic').get("2015"), d[1].get('organic').get("2018"),
                    d[1].get('conventional').get("2015"), d[1].get('conventional').get("2018")
                )
            }),
        ),

        max: Math.max(
            d3.max(avrgDataByRegionAndTypeAndYear, function (d) {
                return Math.max(
                    d[1].get('organic').get("2015"), d[1].get('organic').get("2018"),
                    d[1].get('conventional').get("2015"), d[1].get('conventional').get("2018")
                )
            }),
        )
    };

    /*
    CREATE SCALES
    */
    const xScale = d3.scaleLinear()
        .domain([averagePrice.min - 0.02, averagePrice.max + 0.02])
        .range([margin.left, width - margin.right]);

    const yScale = d3.scaleBand()
        .domain(regions)
        .range([height - margin.bottom , margin.top])
        .padding(1);


    //  Check if the tickFormat or ticks is necessary 
    const xAxisGrid = d3.axisBottom(xScale).tickSize(-height).tickFormat('');
    const yAxisGrid = d3.axisLeft(yScale).tickSize(-width).tickFormat('');


    const line = d3.line()
        .x(function(d) { return xScale(d.year); })
        .y(function(d) { return yScale(d.production); })
    .curve(d3.curveLinear);

    /*
    DRAW AXES/GRID LINES
    */
    const xAxis = svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom().scale(xScale));

    const yAxis = svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft().scale(yScale));

    svg.append("g")
        .attr("class", "x-axis-grid")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(xAxisGrid);


    svg.append("g")
        .attr("class", "y-axis-grid")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(yAxisGrid);
        
    /*
    PLOT LINES
    */

    function plot_line(data, type, start_year, end_year, stroke, stroke_width) {
        svg.selectAll("myline")
            .data(data)
            .enter()
            .append("line")
            .attr("x1", function (d) {
                return xScale(d[1].get(type).get(start_year));
            })
            .attr("x2", function (d) {
                return xScale(d[1].get(type).get(end_year));
            })
            .attr("y1", function (d) {
                return yScale(d[0]);
            })
            .attr("y2", function (d) {
                return yScale(d[0]);
            })
            .attr("stroke", stroke)
            .attr("stroke-width", stroke_width)
    };

    // PLOTTING CONNECTING LINE FOR CONVENTIONAL
    plot_line(avrgDataByRegionAndTypeAndYear, 'conventional', "2015", "2018", "darkgrey", 1)

    // PLOTTING CONNECTING LINE FOR ORGANIC 
    plot_line(avrgDataByRegionAndTypeAndYear, 'organic', "2015", "2018", "darkgrey", 1)

    /*
    DRAW CIRCLE
    */

    function draw_circle(data, name, type, year, radius, fill, stroke = null, stroke_width = 0) {
        svg.selectAll(name)
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function (d) {
                return xScale(d[1].get(type).get(year));
            })
            .attr("cy", function (d) {
                return yScale(d[0]);
            })
            .attr("r", radius)
            .attr("fill", fill)
            .attr("stroke", stroke)
            .attr("stroke-width", stroke_width);;
    };

    // PLOTTING CIRCLE FOR 2015 (conventional)
    draw_circle(avrgDataByRegionAndTypeAndYear, "circle1", 'conventional', "2015", 7, "saddlebrown")

    // PLOTTING CIRCLE FOR 2018 (conventional)
    draw_circle(avrgDataByRegionAndTypeAndYear, "circle2", 'conventional', "2018", 7, "tan", "#b07d62", 2.5)

    // PLOTTING CIRCLE FOR 2015 (organic)
    draw_circle(avrgDataByRegionAndTypeAndYear, "circle3", 'organic', "2015", 7, "darkgreen")

    // PLOTTING CIRCLE FOR 2018 (organic)
    draw_circle(avrgDataByRegionAndTypeAndYear, "circle4", 'organic', "2018", 7, "#a7c957", "#6a994e", 2.5)

    // DRAW AXIS LABELS
    const xAxisLabel = svg.append("text")
        .attr("class", "axisLabel_bottom")
        .attr("x", width / 2 - 60)
        .attr("y", height - margin.bottom + 85)
        .text("Average Avocado Price in USD($)");

    const yAxisLabel = svg.append("text")
        .attr("class", "axisLabel_left")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2 + 100)
        .attr("y", margin.left / 2)
        .text("State");

    // TOOLTIP 
    const tooltip = d3.select("#chart-1")
        .append("div")
        .attr("class", "tooltip");

    var stroke, stroke_width; // this will remember the original stroke color and its width after mouse over is done.

    svg.selectAll("circle").on("mouseover", function (e, d) {
        let cx = +d3.select(this).attr("cx");
        let cy = d3.select(this).attr("cy");
        let price = xScale.invert(cx).toFixed(2)
        stroke = d3.select(this).attr("stroke");
        stroke_width = d3.select(this).attr("stroke-width");
        let type = null;
        let year = null;

        d[1].forEach(function (year_average, t) {
            year_average.forEach(function (average, y) {
                if (average.toFixed(2) == price) {
                    type = t;
                    year = y;
                }
            });
        });

        tooltip.style("visibility", "visible")
            .style("left", `${cx}px`)
            .style("top", `${cy}px`)
            .html(`<b>Region:</b> ${d[0]}<br><b>Type:</b> ${type}<br><b>Year:</b> ${year}<br><b>Price:</b> $${price}`);
        d3.select(this)
            .attr("stroke", "#333533")
            .attr("stroke-width", 4)
    }).on("mouseout", function () {
        tooltip.style("visibility", "hidden")
        d3.select(this)
            .attr("stroke", stroke)
            .attr("stroke-width", stroke_width);
    });
});


