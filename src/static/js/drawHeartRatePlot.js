import { PRIMARY_COLOR, SECONDARY_COLOR } from "/static/js/staticValues.js";
import { removeDateFromTime, color } from "/static/js/helpers.js";
export default function (id, data) {
  const margin = { top: 10, right: 30, bottom: 65, left: 60 },
    width = 500 - margin.left - margin.right,
    height = 180 - margin.top - margin.bottom;

  const dates = d3
    .nest()
    .key((d) => d.time.getDate())
    .entries(data);

  const timeExtent = [
    new Date(2022, 1, 1, 7, 30),
    new Date(2022, 1, 1, 18, 30),
  ];

  const svg = d3
    .select(id)
    .selectAll("charts")
    .data(dates)
    .enter()
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
    .attr("id", "clipPath-heartRate")
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
    .domain(timeExtent)
    .range([padding, width - padding]);
  const bottomAxis = svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  bottomAxis
    .append("text")
    .attr("class", "x label")
    .attr("fill", PRIMARY_COLOR)
    .text((d) => d.values[0].time.toLocaleDateString());

  bottomAxis
    .selectAll("text")
    .attr("y", 0)
    .attr("x", -9)
    .attr("dy", ".35em")
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "end");

  // Add Y axis
  const y = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.heartRate))
    .range([height - padding, padding]);

  const leftAxis = svg.append("g").call(d3.axisLeft(y));

  leftAxis
    .append("text")
    .attr("class", "x label")
    .attr("text-anchor", "center")
    .attr("x", height / -2.5)
    .attr("y", -margin.left + 24)
    .attr("transform", "rotate(-90)")
    .attr("fill", PRIMARY_COLOR)
    .text("Heart rate");

  const lines = svg
    .append("path")
    .style("clip-path", "url(#clipPath-heartRate)")
    .attr("d", (d) =>
      d3
        .line()
        .x((d) => x(removeDateFromTime(d.time)))
        .y((d) => y(d.heartRate))(d.values)
    )
    .style("fill", "none")
    .style("stroke", (d) => color(d.key))
    .style("opacity", 0.5)
    .style("stroke-width", 1);

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
      x.domain(timeExtent);
    } else {
      x.domain([x.invert(extent[0]), x.invert(extent[1])]);
      d3.select(".brush").call(brush.move, null); // This remove the grey brush area as soon as the selection has been done
    }

    bottomAxis.transition().duration(1000).call(d3.axisBottom(x));
    bottomAxis
      .selectAll("text")
      .attr("y", 0)
      .attr("x", -9)
      .attr("dy", ".35em")
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "end");

    lines
      .transition()
      .duration(1000)
      .attr("d", (d) =>
        d3
          .line()
          .x((d) => x(removeDateFromTime(d.time)))
          .y((d) => y(d.heartRate))(d.values)
      );
  }
}
