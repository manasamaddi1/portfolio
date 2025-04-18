// --- Theme switcher dropdown ---
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

let select = document.querySelector('.color-scheme select');

// Function to set color scheme and save preference
function setColorScheme(colorScheme) {
  document.documentElement.style.setProperty('color-scheme', colorScheme);
  select.value = colorScheme;
  localStorage.colorScheme = colorScheme;
}

// Load saved theme preference on page load
if ("colorScheme" in localStorage) {
  setColorScheme(localStorage.colorScheme);
}

// Change theme when dropdown is used
select.addEventListener('input', function(event) {
  setColorScheme(event.target.value);
});


// --- Navigation bar ---
const pages = [
  { url: '', title: 'Home' },
  { url: 'projects', title: 'Projects' },
  { url: 'cv', title: 'CV' },
  { url: 'contact', title: 'Contact' },
  { url: 'https://github.com/manasamaddi1', title: 'GitHub' }
];

const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"
  : "/portfolio/"; // replace with your GitHub repo name if different

const nav = document.createElement('nav');
document.body.prepend(nav);

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

// --- Contact form handling ---
// const form = document.querySelector('#contact-form');

// form?.addEventListener('submit', e => {
//   e.preventDefault();

//   const subject = encodeURIComponent(form.subject.value);
//   const body = encodeURIComponent(form.message.value);

//   const mailto = `mailto:lmaddi@ucsd.edu?subject=${subject}&body=${body}`;
//   window.location.href = mailto;
// });

