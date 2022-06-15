import { PRIMARY_COLOR, SECONDARY_COLOR } from "/static/js/staticValues.js";
import { color } from "/static/js/helpers.js";
export default function (id, data) {
  const margin = { top: 10, right: 10, bottom: 30, left: 60 },
    width = 400 * 1.618 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

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
    .attr("id", "clipPath-slope")
    .append("rect")
    .attr("x", 1)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "white");

  const padding = 0;
  // Add X axis
  const x = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.slope))
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
    .text("Elevation delta");
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

  const scale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.elevation))
    .range([1, 3]);

  svg
    .append("g")
    .style("clip-path", "url(#clipPath-slope)")
    .selectAll()
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => x(d.slope))
    .attr("cy", (d) => y(d.heartRate))
    .attr("r", (d) => scale(d.elevation))
    .style("fill", (d) => color(d.time.getDate()))
    .style("opacity", 0.05);

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
      x.domain(d3.extent(data, (d) => d.slope));
    } else {
      x.domain([x.invert(extent[0]), x.invert(extent[1])]);
      svg.select(".brush").call(brush.move, null); // This remove the grey brush area as soon as the selection has been done
    }

    bottomAxis.transition().duration(1000).call(d3.axisBottom(x));

    svg
      .selectAll("circle")
      .transition()
      .duration(1000)
      .attr("cx", (d) => x(d.slope))
      .attr("cy", (d) => y(d.heartRate));
  }
}