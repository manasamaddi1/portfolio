import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');  
const projectsContainer = document.querySelector('.projects');  

renderProjects(projects, projectsContainer, 'h2');

// Step 1.6: Dynamically update the title with the project count
const titleElement = document.querySelector('.projects-title');
if (titleElement) {
  titleElement.textContent = `${projects.length} Projects`;
}
