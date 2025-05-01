import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

let query = '';
let selectedIndex = -1; 

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

let colors = d3.scaleOrdinal(d3.schemeTableau10);

function renderChart(data) {
  const sliceGenerator = d3.pie().value(d => d.value);
  const arcData = sliceGenerator(data);
  const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  const svg = d3.select('#projects-pie-plot');
  svg.selectAll('path').remove();

  arcData.forEach((d, i) => {
    svg.append('path')
      .attr('d', arcGenerator(d))
      .attr('transform', 'translate(50, 50)')
      .attr('fill', colors(i))
      .attr('class', selectedIndex === i ? 'selected' : '')
      .on('click', () => {
        selectedIndex = selectedIndex === i ? -1 : i;
        renderChart(data);
        renderLegend(data);
        filterBySelectionAndQuery(data);
      });
  });

  svg.selectAll('path').style('cursor', 'pointer');
}


function renderLegend(data) {
  const legend = d3.select('.legend');
  legend.selectAll('li').remove();

  data.forEach((d, idx) => {
    legend.append('li')
      .attr('style', `--color:${colors(idx)}`)
      .attr('class', `legend-item ${selectedIndex === idx ? 'selected' : ''}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on('click', () => {
        selectedIndex = selectedIndex === idx ? -1 : idx;
        renderChart(data);
        renderLegend(data);
        filterBySelectionAndQuery(data);
      });
  });
}


function filterBySelectionAndQuery(chartData) {
  let filtered;

  if (selectedIndex === -1) {
    filtered = projects.filter((project) => {
      let values = Object.values(project).join('\n').toLowerCase();
      return values.includes(query);
    });
  } else {

    const selectedYear = chartData[selectedIndex].label;

    filtered = projects.filter((project) => {
      let values = Object.values(project).join('\n').toLowerCase();
      let matchesQuery = values.includes(query);
      let matchesYear = project.year == selectedYear;
      return matchesQuery && matchesYear;
    });
  }

  renderProjects(filtered, projectsContainer, 'h2');

  const titleElement = document.querySelector('.projects-title');
  if (titleElement) {
    titleElement.textContent = `${filtered.length} Projects`;
  }
}

const searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
  query = event.target.value.toLowerCase();

  const rolledData = d3.rollups(
    projects.filter((project) => {
      let values = Object.values(project).join('\n').toLowerCase();
      return values.includes(query);
    }),
    v => v.length,
    d => d.year
  ).sort((a, b) => b[0] - a[0]);

  const data = rolledData.map(([year, count]) => ({ value: count, label: year }));

  renderChart(data);
  renderLegend(data);
  filterBySelectionAndQuery(data);
});


const rolled = d3.rollups(
  projects,
  v => v.length,
  d => d.year
).sort((a, b) => b[0] - a[0]);

const initialData = rolled.map(([year, count]) => ({
  value: count,
  label: year
}));

renderChart(initialData);
renderLegend(initialData);
filterBySelectionAndQuery(initialData);


const titleElement = document.querySelector('.projects-title');
if (titleElement) {
  titleElement.textContent = `${projects.length} Projects`;
}
