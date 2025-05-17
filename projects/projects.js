import { fetchJSON } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

let query = '';
let selectedIndex = -1;

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');

let colors = d3.scaleOrdinal(d3.schemeTableau10);

// Renders all project cards
function renderProjectsList(data) {
  projectsContainer.innerHTML = '';
  data.forEach(project => {
    const card = document.createElement('div');
    card.className = 'project-card';

    const title = document.createElement('h2');
    if (project.url) {
      title.innerHTML = `<a href="${project.url}" target="_blank" rel="noopener noreferrer">${project.title}</a>`;
    } else {
      title.textContent = project.title;
    }

    const img = document.createElement('img');
    img.src = project.image;
    img.alt = project.title;

    const year = document.createElement('p');
    year.innerHTML = `<strong>Year:</strong> ${project.year || 'N/A'}`;

    const desc = document.createElement('p');
    desc.textContent = project.description;

    card.appendChild(title);
    card.appendChild(img);
    card.appendChild(year);
    card.appendChild(desc);
    projectsContainer.appendChild(card);
  });
}

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

function filterBySelectionAndQuery(chartData, baseProjects = projects) {
  let filtered;

  if (selectedIndex === -1) {
    filtered = baseProjects.filter((project) => {
      let values = Object.values(project).join('\n').toLowerCase();
      return values.includes(query);
    });
  } else {
    const selectedYear = chartData[selectedIndex].label;

    filtered = baseProjects.filter((project) => {
      let values = Object.values(project).join('\n').toLowerCase();
      let matchesQuery = values.includes(query);
      let matchesYear = project.year == selectedYear;
      return matchesQuery && matchesYear;
    });
  }

  renderProjectsList(filtered);

  const titleElement = document.querySelector('.projects-title');
  if (titleElement) {
    titleElement.textContent = `${filtered.length} Projects`;
  }
}

// Search + Chart Update
const searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
  query = event.target.value.toLowerCase();

  const searchFilteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query);
  });

  const rolledData = d3.rollups(
    searchFilteredProjects,
    v => v.length,
    d => d.year
  ).sort((a, b) => b[0] - a[0]);

  const data = rolledData.map(([year, count]) => ({
    value: count,
    label: year
  }));

  renderChart(data);
  renderLegend(data);
  filterBySelectionAndQuery(data, searchFilteredProjects);
});

// Initial render
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
