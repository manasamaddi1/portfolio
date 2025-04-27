const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"
  : "/portfolio/";

const header = document.createElement('header');
header.className = 'site-header';

const nav = document.createElement('nav');
const pages = [
  { url: '', title: 'Home' },
  { url: 'projects', title: 'Projects' },
  { url: 'cv', title: 'CV' },
  { url: 'contact', title: 'Contact' },
  { url: 'https://github.com/manasamaddi1', title: 'GitHub' }
];

for (let p of pages) {
  let url = p.url;
  let title = p.title;

  if (!url.startsWith('http')) {
    url = BASE_PATH + url;
  }

  const a = document.createElement('a');
  a.href = url;
  a.textContent = title;

  if (a.host === location.host && a.pathname === location.pathname) {
    a.classList.add('current');
  }

  if (a.host !== location.host) {
    a.target = "_blank";
  }

  nav.appendChild(a);
}

const themeLabel = document.createElement('label');
themeLabel.className = 'color-scheme';
themeLabel.innerHTML = `
  Theme:&nbsp&nbsp; 
  <select>
    <option value="light dark">Automatic</option>
    <option value="light">Light</option>
    <option value="dark">Dark</option>
  </select>
`;

header.appendChild(nav);
document.body.prepend(header);       
document.body.prepend(themeLabel);  


const select = themeLabel.querySelector('select');

function setColorScheme(colorScheme) {
  document.documentElement.style.setProperty('color-scheme', colorScheme);
  select.value = colorScheme;
  localStorage.colorScheme = colorScheme;
}

if ("colorScheme" in localStorage) {
  setColorScheme(localStorage.colorScheme);
}

select.addEventListener('input', function (event) {
  setColorScheme(event.target.value);
});




export async function fetchJSON(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    const data = await response.json();

    console.log('Fetched data:', data);

    return data;

  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}



export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  if (!containerElement) {
    console.error('Container element not found.');
    return;
  }
  containerElement.innerHTML = '';

  for (const project of projects) {
    const article = document.createElement('article');

    const titleTag = document.createElement(headingLevel);
    titleTag.textContent = project.title;

    const image = document.createElement('img');
    image.src = project.image || 'https://via.placeholder.com/300x200';
    image.alt = project.title;

    const year = document.createElement('div');
    year.className = 'project-year';
    year.textContent = `Year: ${project.year ?? 'N/A'}`;

    const desc = document.createElement('p');
    desc.className = 'project-description';
    desc.textContent = project.description || 'No description available.';

    article.appendChild(titleTag);
    article.appendChild(image);
    article.appendChild(desc);

    article.appendChild(titleTag);
    article.appendChild(image);
    article.appendChild(year);
    article.appendChild(desc);
    containerElement.appendChild(article);
  }
}

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}



