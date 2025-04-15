document.body.insertAdjacentHTML(
  'afterbegin',
  `
  <label class="color-scheme">
    Theme:
    <select>
      <option value="light dark">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>
  `
);

let select = document.querySelector('select');

select.addEventListener('input', function (event) {
  console.log('color scheme changed to', event.target.value);
  document.documentElement.style.setProperty('color-scheme', event.target.value);
});





console.log("IT'S ALIVE!");

// Define the pages and their URLs
let pages = [
  { url: '', title: 'Home' },
  { url: 'projects', title: 'Projects' },
  { url: 'cv', title: 'CV' },
  { url: 'contact', title: 'Contact' },
  { url: 'https://github.com/manasamaddi1', title: 'GitHub' }
];

// Create and add the nav element to the top of the body
let nav = document.createElement('nav');
document.body.prepend(nav);

// Determine the base path depending on whether we are local or on GitHub Pages
const BASE_PATH =
  (location.hostname === "localhost" || location.hostname === "127.0.0.1")
    ? "/"
    : "/portfolio/"; // Change to your GitHub repo name if it's not "portfolio"

// Loop through pages and create navigation links
for (let p of pages) {
  let url = p.url;
  let title = p.title;

  // Add BASE_PATH if it's a relative URL
  if (!url.startsWith('http')) {
    url = BASE_PATH + url;
  }

  // Create the link element
  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;

  // Highlight the current page
  if (a.host === location.host && a.pathname === location.pathname) {
    a.classList.add('current');
  }

  // Open external links (like GitHub) in a new tab
  if (a.host !== location.host) {
    a.target = "_blank";
  }

  // Add the link to the nav
  nav.append(a);
}
