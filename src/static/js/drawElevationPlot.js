import { PRIMARY_COLOR, SECONDARY_COLOR } from "/static/js/staticValues.js";
export default function (id, data) {
  const margin = { top: 10, right: 30, bottom: 30, left: 60 },
    width = 485 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

  const svg = d3
    .select(id)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr(
      "viewBox",
      `0 0 ${width + margin.left + margin.right} ${
        height + margin.top + margin.bottom
      }`
    )
    .append("g")
    .attr("id", "scatter-content")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg
    .append("defs")
    .append("clipPath")
    .attr("id", "clipPath")
    .append("rect")
    .attr("x", 1)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "white");

  const padding = 0;
  // Add X axis
  const x = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d["time"]))
    .range([padding, width - padding]);
  const bottomAxis = svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));
  bottomAxis
    .append("text")
    .attr("class", "x label")
    .attr("text-anchor", "center")
    .attr("x", width / 2)
    .attr("y", margin.bottom)
    .attr("fill", PRIMARY_COLOR)
    .text("Time");
  // Add Y axis
  const y = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d["elevation"]))
    .range([height - padding, padding]);

  const leftAxis = svg.append("g").call(d3.axisLeft(y));
  leftAxis
    .append("text")
    .attr("class", "x label")
    .attr("text-anchor", "center")
    .attr("x", height / -4)
    .attr("y", -margin.left + 16)
    .attr("transform", "rotate(-90)")
    .attr("fill", PRIMARY_COLOR)
    .text("Elevation (meters above sealevel)");

  svg
    .append("linearGradient")
    .attr("id", "line-gradient")
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", 0)
    .attr("y1", y(0))
    .attr("x2", 0)
    .attr("y2", y(d3.max(data, (d) => d.elevation)))
    .selectAll("stop")
    .data([
      { offset: "50%", color: SECONDARY_COLOR },
      { offset: "100%", color: "white" },
    ])
    .enter()
    .append("stop")
    .attr("offset", function (d) {
      return d.offset;
    })
    .attr("stop-color", function (d) {
      return d.color;
    });

  svg
    .append("path")
    .style("clip-path", "url(#clipPath)")
    .attr("id", "line_background")
    .datum(data)
    .attr(
      "d",
      d3
        .area()
        .x((d) => x(d.time))
        .y0(y(d3.min(data, (d) => d.elevation)))
        .y1((d) => y(d.elevation))
    )
    .style("fill", "url(#line-gradient)");

  svg
    .append("path")
    .style("clip-path", "url(#clipPath)")
    .attr("id", "line_path")
    .datum(data)
    .attr(
      "d",
      d3
        .line()
        .x((d) => x(d.time))
        .y((d) => y(d.elevation))
    )
    .attr("fill", "none")
    .attr("stroke", PRIMARY_COLOR)
    .attr("stroke-width", 1);

  const brush = d3
    .brushX() // Add the brush feature using the d3.brush function
    .extent([
      [0, 0],
      [width, height],
    ]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
    .on("end", updateChart);

  svg.append("g").attr("class", "brush").call(brush);

  let idleTimeout;
  function idled() {
    idleTimeout = null;
  }

  function updateChart() {
    const extent = d3.event.selection;

    // If no selection, back to initial coordinate. Otherwise, update X axis domain
    if (!extent) {
      if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350)); // This allows to wait a little bit
      x.domain(d3.extent(data, (d) => d["time"]));
    } else {
      x.domain([x.invert(extent[0]), x.invert(extent[1])]);
      svg.select(".brush").call(brush.move, null); // This remove the grey brush area as soon as the selection has been done
    }

    bottomAxis.transition().duration(1000).call(d3.axisBottom(x));

    svg
      .select("#line_background")
      .transition()
      .duration(1000)
      .attr(
        "d",
        d3
          .area()
          .x((d) => x(d.time))
          .y0(y(d3.min(data, (d) => d.elevation)))
          .y1((d) => y(d.elevation))
      );
    svg
      .select("#line_path")
      .transition()
      .duration(1000)
      .attr(
        "d",
        d3
          .line()
          .x((d) => x(d.time))
          .y((d) => y(d.elevation))
      );
  }
}
