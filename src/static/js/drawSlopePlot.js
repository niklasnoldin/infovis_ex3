import { PRIMARY_COLOR, SECONDARY_COLOR } from "/static/js/staticValues.js";
import { color } from "/static/js/helpers.js";
export default function (id, data) {
  const margin = { top: 10, right: 10, bottom: 30, left: 60 },
    width = 500 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

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

  const shape = d3.scaleOrdinal(
    data.map((d) => d.time.getDate()),
    d3.symbols.map((s) => d3.symbol().type(s)())
  );

  const circles = svg
    .append("g")
    .style("clip-path", "url(#clipPath-slope)")
    .selectAll()
    .data(d3.shuffle([...data]))
    .enter()
    .append("path")
    .attr("transform", (d) => `translate(${x(d.slope)},${y(d.heartRate)})`)
    .attr("d", (d) => shape(d.time.getDate()))
    .style("fill", (d) => color(d.time.getDate()))
    .style("opacity", 0.1);

  const brush = d3
    .brush() // Add the brush feature using the d3.brush function
    .extent([
      [0, 0],
      [width, height],
    ]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
    .on("end", updateChart);

  svg.append("g").attr("id", "brush-slope").call(brush);

  const legend = svg
    .append("g")
    .selectAll()
    .data([17, 18, 19, 20, 21])
    .enter()
    .append("g")
    .attr("transform", (d, i) => `translate(20, ${10 + i * 15})`);
  legend
    .append("path")
    .attr("d", (d) => shape(d))
    .attr("transform", "scale(0.75)")
    .style("fill", "black");
  legend
    .append("text")
    .attr("font-size", "10")
    .attr("text-anchor", "center")
    .attr("y", 3.5)
    .attr("x", 10)
    .text((d) => d + ". March");

  legend.on("mouseenter", (value) => {
    circles.filter((d) => d.time.getDate() !== value).style("opacity", 0);
  });
  legend.on("mouseleave", (value) => {
    circles.style("opacity", 0.1);
  });

  let idleTimeout;
  function idled() {
    idleTimeout = null;
  }

  function updateChart() {
    if (!d3.event.selection) {
      if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350)); // This allows to wait a little bit
      x.domain(d3.extent(data, (d) => d.slope));
      y.domain(d3.extent(data, (d) => d.heartRate));
    } else {
      x.domain([
        x.invert(d3.event.selection[0][0]),
        x.invert(d3.event.selection[1][0]),
      ]);
      y.domain([
        y.invert(d3.event.selection[1][1]),
        y.invert(d3.event.selection[0][1]),
      ]);
      d3.select("#brush-slope").call(brush.move, null);
    }

    bottomAxis.transition().duration(1000).call(d3.axisBottom(x));
    leftAxis.transition().duration(1000).call(d3.axisLeft(y));

    circles
      .transition()
      .duration(1000)
      .attr("transform", (d) => `translate(${x(d.slope)},${y(d.heartRate)})`);
  }
}
