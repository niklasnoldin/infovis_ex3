import { convertKeyToId } from "/static/js/helpers.js";
export default function (id, data) {
  const countries = Object.keys(data);
  const values = Object.values(data).map((val, idx) => ({
    ...val,
    country: countries[idx],
  }));

  const margin = { top: 10, right: 30, bottom: 30, left: 60 },
    width = 800 - margin.left - margin.right,
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

  const padding = 20;
  // Add X axis
  const x = d3
    .scaleLinear()
    .domain(d3.extent(values, (d) => d["PC 1"]))
    // .domain([-1, 1])
    .range([padding, width - padding]);
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add Y axis
  const y = d3
    .scaleLinear()
    .domain(d3.extent(values, (d) => d["PC 2"]))
    // .domain([-1, 1])
    .range([height - padding, padding]);
  svg.append("g").call(d3.axisLeft(y));

  svg
    .append("g")
    .selectAll("dot")
    .data(values)
    .enter()
    .append("circle")
    .attr("id", (d) => convertKeyToId(d.country))
    .attr("cx", function (d) {
      return x(d["PC 1"]);
    })
    .attr("cy", function (d) {
      return y(d["PC 2"]);
    })
    .style("opacity", 0.5)
    .attr("r", 2)
    .attr("stroke", "transparent")
    .style("fill", "black");
}
