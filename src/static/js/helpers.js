export function convertKeyToId(key) {
  return key.toLowerCase().replaceAll(" ", "-");
}
export function removeDateFromTime(date = new Date()) {
  return new Date(
    2022,
    1,
    1,
    date.getHours(),
    date.getMinutes(),
    date.getSeconds()
  );
}
export const color = d3
  .scaleOrdinal()
  .domain([17, 18, 19, 20, 21])
  .range(["#0f0f41", "#68155a", "#b72558", "#ed5d3e", "#ffa600"]);
