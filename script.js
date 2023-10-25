// Variabel konfigurasi
const width = 800;
const height = 400;
const margin = { top: 20, right: 20, bottom: 60, left: 60 };
const barWidth = width / 275;

// SVG Container
const svg = d3
  .select(".visHolder")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Tooltip
const tooltip = d3
  .select(".visHolder")
  .append("div")
  .attr("id", "tooltip")
  .style("opacity", 0);

// Overlay
const overlay = d3
  .select(".visHolder")
  .append("div")
  .attr("class", "overlay")
  .style("opacity", 0);

// Fetch data
d3.json(
  "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json"
)
  .then((data) => {
    // Data transformation
    const years = data.data.map((item) => {
      const quarter = ["Q1", "Q2", "Q3", "Q4"][
        (parseInt(item[0].substring(5, 7)) - 1) / 3
      ];
      return `${item[0].substring(0, 4)} ${quarter}`;
    });

    const yearsDate = data.data.map((item) => new Date(item[0]));
    const gdp = data.data.map((item) => item[1]);

    // Scales
    const xScale = d3
      .scaleTime()
      .domain([d3.min(yearsDate), d3.max(yearsDate)])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(gdp)])
      .range([height, 0]);

    // Axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);

    svg.append("g").attr("class", "y-axis").attr("id", "y-axis").call(yAxis);

    // Bars
    svg
      .selectAll(".bar")
      .data(data.data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(new Date(d[0])))
      .attr("y", (d) => yScale(d[1]))
      .attr("width", barWidth)
      .attr("height", (d) => height - yScale(d[1]))
      .style("fill", "#33adff")
      .attr("data-date", (d) => d[0]) // Tambahkan atribut data-date
      .attr("data-gdp", (d) => d[1]) // Tambahkan atribut data-gdp
      .on("mouseover", (event, d) => {
        const [date, gdp] = d;
        const i = data.data.indexOf(d);
        const formattedGDP = gdp.toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");

        overlay
          .transition()
          .duration(0)
          .style("height", `${height - yScale(gdp)}px`)
          .style("width", `${barWidth}px`)
          .style("opacity", 1)
          .style("left", `${i * barWidth + 2}px`)
          .style("top", `${yScale(gdp) + 67}px`)
          .style("transform", "translateX(60px)");

        tooltip
          .transition()
          .duration(200)
          .style("opacity", 1)
          .attr("data-date", date); // Sesuaikan dengan data-date elemen aktif

        tooltip
          .html(`${years[i]}<br>$${formattedGDP} Billion`)
          .style("left", `${i * barWidth}px`)
          .style("top", `${height - 100}px`)
          .style("transform", "translateX(-14px)");
      })
      .on("mouseout", () => {
        tooltip.transition().duration(200).style("opacity", 0);
        overlay.transition().duration(200).style("opacity", 0);
      });
  })
  .catch((e) => console.log(e));
