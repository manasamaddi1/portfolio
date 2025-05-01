import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// Fetch project data and render cards
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

// Update title with project count
const titleElement = document.querySelector('.projects-title');
if (titleElement) {
  titleElement.textContent = `${projects.length} Projects`;
}

// ----------- Step 2.1: D3 Pie Chart with Labels -----------

let data = [
  { value: 1, label: 'apples' },
  { value: 2, label: 'oranges' },
  { value: 3, label: 'mangos' },
  { value: 4, label: 'pears' },
  { value: 5, label: 'limes' },
  { value: 5, label: 'cherries' },
];

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

