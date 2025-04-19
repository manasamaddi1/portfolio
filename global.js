// --- Navigation bar + Theme switcher ---
const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"
  : "/portfolio/";

const header = document.createElement('header');
header.className = 'site-header';

// Create nav
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

// Create theme switcher
const themeLabel = document.createElement('label');
themeLabel.className = 'color-scheme';
themeLabel.innerHTML = `
  Theme:&nbsp; 
  <select>
    <option value="light dark">Automatic</option>
    <option value="light">Light</option>
    <option value="dark">Dark</option>
  </select>
`;

// Add nav and switcher into header
header.appendChild(nav);
header.appendChild(themeLabel);

// Add header to the page
document.body.prepend(header);

// --- Theme switcher logic ---
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
