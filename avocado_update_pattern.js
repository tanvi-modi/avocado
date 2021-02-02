d3.csv("./data/avocadoprices.csv").then(function (data) {
    /*
    SETTING UP THE SVG CANVAS
    */
    const width = document.querySelector("#chart-2").clientWidth;
    const height = document.querySelector("#chart-2").clientHeight;
    const margin = {
        top: 25,
        left: 250,
        right: 250,
        bottom: 75
    };

    /*
    CREATE THE SVG CANVAS
    */
    const svg = d3.select("#chart-2")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    /*
    DEFINE DATA SET
    */

    var dataByYearAndRegion = d3.group(data, d => d.year, d => d.region, d => d.type)

    // Delete unnecessary regions from the data
    dataByYearAndRegion.forEach(function (reg, yr) {
        reg.forEach(function (value, key) {
            if (key != 'Boston') {
                dataByYearAndRegion.get(yr).delete(key);
            }
        });
    });

    console.log(dataByYearAndRegion);

    const averagePrice = {
        min: Math.min(d3.min(data, function (d) {
            if (d.region == 'Boston' && (d.type == "conventional" || d.type == "organic")) {
                return d.averagePrice
            }
        })),
        max: Math.max(d3.max(data, function (d) {
            if (d.region == 'Boston' && (d.type == "conventional" || d.type == "organic")) {
                return d.averagePrice
            }
        }))
    };


    function convert_date(date) {
        var d = new Date(date); //converts the string into date object
        var mnt = d.getMonth();
        var day = d.getDate()
        return mnt + (day) / 30
    }

    /*
    DEFINE SCALES
    */

    const xScale = d3.scaleLinear()
        .domain([0 - 0.5, 12 + 0.5])
        .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
        .domain([averagePrice.min - 0.1, averagePrice.max + 0.1])
        .range([height - margin.bottom, margin.top]);

    /*
    CREATE A LINE GENERATOR
    */

    const line = d3.line()
        .x(function (d) {
            return xScale(convert_date(d.Date));
        })
        .y(function (d) {
            return yScale(+d.averagePrice);
        })
        .curve(d3.curveLinear);


    /*
    GENERATE AXES
    */

    const xAxis = svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height-margin.bottom})`)
        .call(d3.axisBottom().scale(xScale).tickFormat(d3.format("Y")));

    const yAxis = svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft().scale(yScale));

    /*
    DRAW THE MARKS
    */



    let conventional_path = svg.append("path")
        .datum(dataByYearAndRegion.get("2015").get('Boston').get("conventional"))
        .attr("d", function (d) {
            return line(d);
        })
        .attr("stroke", 'tan')
        .attr("fill", "none")
        .attr("stroke-width", 2);

    let conventional_circle = svg.selectAll("circle1")
        .data(dataByYearAndRegion.get("2015").get('Boston').get("conventional"))
        .enter()
        .append("circle")
        .attr('class', 'ccircle')
        .attr("cx", function (d) {
            return xScale(convert_date(d.Date));
        })
        .attr("cy", function (d) {
            return yScale(d.averagePrice);
        })
        .attr("r", 5)
        .attr("fill", 'tan');

    let organic_path = svg.append("path")
        .datum(dataByYearAndRegion.get("2015").get('Boston').get("organic"))
        .attr("d", function (d) {
            return line(d);
        })
        .attr("stroke", '#a7c957')
        .attr("fill", "none")
        .attr("stroke-width", 2);

    let organic_circle = svg.selectAll("circle2")
        .data(dataByYearAndRegion.get("2015").get('Boston').get("organic"))
        .enter()
        .append("circle")
        .attr('class', 'ocircle')
        .attr("cx", function (d) {
            return xScale(convert_date(d.Date));
        })
        .attr("cy", function (d) {
            return yScale(d.averagePrice);
        })
        .attr("r", 5)
        .attr("fill", '#a7c957');
    /*
    ADDING AXIS LABELS

    */
    svg.append("text")
        .attr("class", "axisLabel_left")
        .attr("x", width / 2)
        .attr("y", height - 10)
        .attr("text-anchor", "middle")
        .text("Month Number");

    svg.append("text")
        .attr("class", "axisLabel_bottom")
        .attr("x", -height / 2)
        .attr("y", 160)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Average Price in USD($)");

    /*
    TOOLTIP
    */

    const tooltip = d3.select("#chart-2")
        .append("div")
        .attr("class", "tooltip");

    svg.selectAll("circle").on("mouseover", function (e, d) {

        console.log(d);

        let cx = +d3.select(this).attr("cx");
        let cy = +d3.select(this).attr("cy");
        const tParser = d3.timeParse("%m/%d/%Y")
        formatDate = d3.timeFormat("%d-%b")

        tooltip.style("visibility", "visible")
            .style("left", `${cx}px`)
            .style("top", `${cy}px`)
            .html(`<b>Date:</b> ${formatDate(tParser(d.Date))}<br><b>Type:</b> ${d.type}<br><b>Price:</b> $${d.averagePrice}`);

        d3.select(this)
            .attr("stroke", "#F6C900")
            .attr("stroke-width", 3);

    }).on("mouseout", function () {

        tooltip.style("visibility", "hidden");

        d3.select(this)
            .attr("stroke", "none")
            .attr("stroke-width", 0);

    });

    /* DATA UPDATE */

    function data_update(year) {

        // Data Update for Conventional Data

        conventional_path.datum(dataByYearAndRegion.get(year).get('Boston').get("conventional"))
            .transition()
            .duration(1500)
            .attr("d", line);

        // Update the <circle> elements
        if (year == "2018") { conventional_circle.attr("r", 0) }
        conventional_circle.data(dataByYearAndRegion.get(year).get('Boston').get("conventional"))
            .transition()
            .duration(1500)
            .attr("cx", function (d) {
                return xScale(convert_date(d.Date));
            })
            .attr("cy", function (d) {
                return yScale(d.averagePrice);
            })
            .attr("r", 5)
            .attr("fill", 'tan');
        
        // Data Update for Organic Data
        organic_path.datum(dataByYearAndRegion.get(year).get('Boston').get("organic"))
            .transition()
            .duration(1500)
            .attr("d", line);

        // Update the <circle> elements
        if (year == "2018") { organic_circle.attr("r", 0)}
        organic_circle.data(dataByYearAndRegion.get(year).get('Boston').get("organic"))
            .transition()
            .duration(1500)
            .attr("cx", function (d) {
                return xScale(convert_date(d.Date));
            })
            .attr("cy", function (d) {
                return yScale(d.averagePrice);
            })
            .attr("r", 5)
            .attr("fill", '#a7c957');
    }

    d3.select("#fifteen").on("click", function () {
        data_update("2015")
    });

    d3.select("#sixteen").on("click", function () {
        data_update("2016")
    });

    d3.select("#seventeen").on("click", function () {
        data_update("2017")
    });

    d3.select("#eighteen").on("click", function () {
        data_update("2018")
    });
});