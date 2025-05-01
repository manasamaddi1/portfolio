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

// ----------- Step 1.4–1.6: D3 Pie Chart Setup -----------

// Data to visualize (Step 1.5 updated data)
const data = [1, 2, 3, 4, 5, 5];

// Arc generator
const arcGenerator = d3.arc()
  .innerRadius(0)
  .outerRadius(50);

// Create pie slice angle data
const sliceGenerator = d3.pie();
const arcData = sliceGenerator(data);

// Convert to SVG path strings
const arcs = arcData.map(d => arcGenerator(d));

// Color scale using D3 built-in palette
const colors = d3.scaleOrdinal(d3.schemeTableau10);

// Append all paths to the SVG and shift to the left
const svg = d3.select('#projects-pie-plot');

svg.selectAll('path')
  .data(arcs)
  .join('path')
  .attr('d', d => d)
  .attr('fill', (_, i) => colors(i))
  .attr('transform', 'translate(-40, 0)');  // Shift the pie left
