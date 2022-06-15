import { PRIMARY_COLOR, SECONDARY_COLOR } from "/static/js/staticValues.js";
import { color } from "/static/js/helpers.js";
export default function (id, data) {
  const margin = { top: 10, right: 10, bottom: 30, left: 60 },
    width = 400 * 1.618 - margin.left - margin.right,
    height = 400 * 1.618 - margin.top - margin.bottom;
  console.log(data);
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
    .attr("id", "clipPath-last")
    .append("rect")
    .attr("x", 1)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "white");

  const padding = 10;
  // Add X axis
  const x = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.location[0]))
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
    .text("Longitude");
  // Add Y axis
  const y = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.location[1]))
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
    .text("Latitude");

  const scale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.elevation))
    .range([1, 10]);

  const circles = svg
    .append("g")
    .style("clip-path", "url(#clipPath-last)")
    .selectAll()
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => x(d.location[0]))
    .attr("cy", (d) => y(d.location[1]))
    .attr("r", (d) => scale(d.elevation))
    .style("fill", (d) => color(d.time.getDate()))
    .style("opacity", 0.05);

  const legend = svg
    .append("g")
    .selectAll()
    .data([1, 5, 10])
    .enter()
    .append("g")
    .attr("transform", (d, i) => `translate(25, ${25 + i * 25})`);
  legend
    .append("circle")
    .attr("r", (d) => d)
    .style("fill", "black");
  legend
    .append("text")
    .attr("text-anchor", "center")
    .attr("y", 8)
    .attr("x", 20)
    .text((d) => `${Math.round(scale.invert(d))}m`);

  const brush = d3
    .brush() // Add the brush feature using the d3.brush function
    .extent([
      [0, 0],
      [width, height],
    ]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
    .on("end", updateChart);

  svg.append("g").attr("id", "brush-last").call(brush);

  let idleTimeout;
  function idled() {
    idleTimeout = null;
  }

  function updateChart() {
    if (!d3.event.selection) {
      if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350)); // This allows to wait a little bit
      x.domain(d3.extent(data, (d) => d.location[0]));
      y.domain(d3.extent(data, (d) => d.location[1]));
    } else {
      x.domain([
        x.invert(d3.event.selection[0][0]),
        x.invert(d3.event.selection[1][0]),
      ]);
      y.domain([
        y.invert(d3.event.selection[1][1]),
        y.invert(d3.event.selection[0][1]),
      ]);
      d3.select("#brush-last").call(brush.move, null);
    }

    bottomAxis.transition().duration(1000).call(d3.axisBottom(x));
    leftAxis.transition().duration(1000).call(d3.axisLeft(y));

    circles
      .transition()
      .duration(1000)
      .attr("cx", (d) => x(d.location[0]))
      .attr("cy", (d) => y(d.location[1]));
  }
}
