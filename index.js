import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';

// Load and display latest 3 projects
const projects = await fetchJSON('./lib/projects.json');
const latestProjects = projects.slice(0, 3);
const projectsContainer = document.querySelector('.projects');

if (projectsContainer) {
  renderProjects(latestProjects, projectsContainer, 'h2');
}

// Load and display GitHub profile stats
const githubData = await fetchGitHubData('manasamaddi1');

const profileStats = document.querySelector('#profile-stats');
if (profileStats) {
  profileStats.innerHTML = `
    <dl>
      <dt>Followers</dt><dd>${githubData.followers}</dd>
      <dt>Following</dt><dd>${githubData.following}</dd>
      <dt>Public Repos</dt><dd>${githubData.public_repos}</dd>
      <dt>Public Gists</dt><dd>${githubData.public_gists}</dd>
    </dl>
  `;
}

// // Optional additional GitHub section
// const githubSection = document.createElement('section');
// githubSection.innerHTML = `
//   <h2>GitHub Profile</h2>
//   <p><strong>@${githubData.login}</strong> has <strong>${githubData.followers}</strong> followers and is following <strong>${githubData.following}</strong> users.</p>
//   <p>Public repos: <strong>${githubData.public_repos}</strong></p>
// `;
// document.body.appendChild(githubSection);
