console.log("IT’S ALIVE!");

// Step 3.1: Define the pages
let pages = [
  { url: '', title: 'Home' },
  { url: 'projects', title: 'Projects' },
  { url: 'contact', title: 'Contact' },
  { url: 'cv', title: 'Resume' },
  { url: 'https://github.com/manasamaddi1', title: 'GitHub' }
];

// Step 3.1: Create <nav> element and prepend to body
let nav = document.createElement('nav');
document.body.prepend(nav);

// Step 3.1: Define BASE_PATH depending on location
const BASE_PATH =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "/"
    : "/portfolio/";

// Step 3.1: Add <a> elements dynamically
for (let p of pages) {
  let a = document.createElement('a');

  // Handle internal vs external links
  let isExternal = p.url.startsWith('http');

  // Construct URL
  let url = isExternal ? p.url : BASE_PATH + (p.url ? `${p.url}/index.html` : 'index.html');
  a.href = url;
  a.textContent = p.title;

  // Step 3.2: Highlight current page
  let linkHost = new URL(a.href).host;
  let linkPath = new URL(a.href).pathname;
  a.classList.toggle(
    'current',
    linkHost === location.host && linkPath === location.pathname
  );

  // Step 3.2: Open external links in new tab
  if (isExternal) {
    a.target = "_blank";
  }

  nav.appendChild(a);
}
