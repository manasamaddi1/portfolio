import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
let query = '';


// Fetch project data and render cards
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
  // update query value
  query = event.target.value.toLowerCase(); // optional: case-insensitive

  // filter projects by title
  let filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(query)
  );

  // render filtered projects
  renderProjects(filteredProjects, projectsContainer, 'h2');

  // generate new data for pie chart (projects per year)
  let rolledData = d3.rollups(
    filteredProjects,
    (v) => v.length,
    (d) => d.year,
  );

  let data = rolledData.map(([year, count]) => ({
    value: count,
    label: year,
  }));

  // slice generator
  let sliceGenerator = d3.pie().value((d) => d.value);
  let arcData = sliceGenerator(data);

  // update color scale
  let colors = d3.scaleOrdinal(d3.schemeTableau10);

  // update pie chart
  d3.select('#projects-pie-plot')
    .selectAll('path')
    .data(arcData)
    .join('path')
    .attr('d', d3.arc().innerRadius(0).outerRadius(50))
    .attr('fill', (d, i) => colors(i))
    .attr('transform', 'translate(50, 50)');

  // update legend
  let legend = d3.select('.legend');
  legend.selectAll('li').remove(); // clear old items
  data.forEach((d, idx) => {
    legend.append('li')
      .attr('style', `--color:${colors(idx)}`)
      .attr('class', 'legend-item')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
});


// Update title with project count
const titleElement = document.querySelector('.projects-title');
if (titleElement) {
  titleElement.textContent = `${projects.length} Projects`;
}

// ----------- Step 2.1: D3 Pie Chart with Labels -----------

let rolledData = d3.rollups(
  projects,
  (v) => v.length,
  (d) => d.year,
);

// Sort by year descending (optional for consistent visual order)
rolledData.sort((a, b) => b[0] - a[0]);

let data = rolledData.map(([year, count]) => ({
  value: count,
  label: year
}));


// Arc generator
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

// Slice generator: tells D3 how to access `.value` in each object
let sliceGenerator = d3.pie().value((d) => d.value);

// Generate arc path data
let arcData = sliceGenerator(data);

// Color scale
let colors = d3.scaleOrdinal(d3.schemeTableau10);

// Draw pie slices
d3.select('#projects-pie-plot')
  .selectAll('path')
  .data(arcData)
  .join('path')
  .attr('d', arcGenerator)
  .attr('fill', (d, i) => colors(i))
  .attr('transform', 'translate(50, 50)');

  let legend = d3.select('.legend');
data.forEach((d, idx) => {
  legend.append('li')
    .attr('style', `--color:${colors(idx)}`)
    .attr('class', 'legend-item')
    .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);


});

