import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

let xScale, yScale;
let commitProgress = 100;
let commits, filteredCommits, data;

let NUM_ITEMS;
let ITEM_HEIGHT = 30;
let VISIBLE_COUNT = 10;

let scrollContainer, spacer, itemsContainer;

async function loadData() {
  const data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: +row.line,
    depth: +row.depth,
    length: +row.length,
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  return data;
}

function processCommits(data) {
  return d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;

      let ret = {
        id: commit,
        url: 'https://github.com/manasamaddi1/portfolio/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(ret, 'lines', {
        value: lines,
        enumerable: false,
        writable: true,
        configurable: true,
      });

      return ret;
    });
}

function renderCommitInfo(data, commits) {
  d3.select('#stats').selectAll('*').remove();

  const stats = [
    { label: 'Total LOC', value: data.length },
    { label: 'Total Commits', value: commits.length },
    { label: 'Unique Files', value: d3.group(data, d => d.file).size },
    { label: 'Max Line Length', value: d3.max(data, d => d.length) },
    {
      label: 'Most Work Done In',
      value: (() => {
        const workByPeriod = d3.rollups(
          data,
          v => v.length,
          d => new Date(d.datetime).getHours()
        );

        const periodCounts = { morning: 0, afternoon: 0, evening: 0, night: 0 };
        for (let [hour, count] of workByPeriod) {
          if (hour >= 5 && hour < 12) periodCounts.morning += count;
          else if (hour >= 12 && hour < 17) periodCounts.afternoon += count;
          else if (hour >= 17 && hour < 21) periodCounts.evening += count;
          else periodCounts.night += count;
        }
        return Object.entries(periodCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
      })()
    }
  ];

  const container = d3.select('#stats').append('div').attr('class', 'stats-grid');

  stats.forEach(stat => {
    const statBox = container.append('div').attr('class', 'stat-box');
    statBox.append('div').attr('class', 'stat-label').text(stat.label);
    statBox.append('div').attr('class', 'stat-value').text(stat.value);
  });
}


function renderItems(startIndex) {
  itemsContainer.selectAll('div').remove();
  const endIndex = Math.min(startIndex + VISIBLE_COUNT, commits.length);
  let newCommitSlice = commits.slice(startIndex, endIndex);
  updateScatterPlot(data, newCommitSlice);
  itemsContainer.selectAll('div')
    .data(newCommitSlice)
    .enter()
    .append('div')
    .text(d => `${d.date} — ${d.author}`)
    .attr('class', 'item')
    .style('position', 'absolute')
    .style('top', (_, idx) => `${idx * ITEM_HEIGHT}px`);
}

function renderFilesList(filteredCommits) {
  let lines = filteredCommits.flatMap((d) => d.lines);
  let files = d3
    .groups(lines, (d) => d.file)
    .map(([name, lines]) => ({ name, lines }));

  // Sort files by descending line count
  files = d3.sort(files, (d) => -d.lines.length);

  // Color by type (CSS, HTML, JS, etc.)
  let fileTypeColors = d3.scaleOrdinal(d3.schemeTableau10);

  // Clear previous display
  d3.select('.files').selectAll('div').remove();

  let filesContainer = d3.select('.files')
    .selectAll('div')
    .data(files)
    .enter()
    .append('div');

  // Add file name + line count
  filesContainer.append('dt')
    .html(d => `<code>${d.name}</code><br><small>${d.lines.length} lines</small>`);

  // Unit dots per line
  const dd = filesContainer.append('dd');
  dd.selectAll('div')
    .data(d => d.lines)
    .enter()
    .append('div')
    .attr('class', 'line')
    .style('background', d => fileTypeColors(d.type));
}


function renderTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const time = document.getElementById('commit-time');
  const author = document.getElementById('commit-author');
  const lines = document.getElementById('commit-lines');

  if (!commit) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime.toLocaleDateString('en', { dateStyle: 'full' });
  time.textContent = commit.datetime.toLocaleTimeString('en');
  author.textContent = commit.author;
  lines.textContent = commit.totalLines;
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX + 15}px`;
  tooltip.style.top = `${event.clientY + 15}px`;
}

function isCommitSelected(selection, commit) {
  if (!selection) return false;
  const [x0, x1] = selection.map(d => d[0]);
  const [y0, y1] = selection.map(d => d[1]);
  const x = xScale(commit.datetime);
  const y = yScale(commit.hourFrac);
  return x >= x0 && x <= x1 && y >= y0 && y <= y1;
}

function renderSelectionCount(selection, commits) {
  const selectedCommits = selection
    ? commits.filter((d) => isCommitSelected(selection, d))
    : [];

  const countElement = document.querySelector('#selection-count');
  countElement.textContent = `${
    selectedCommits.length || 'No'
  } commits selected`;

  return selectedCommits;
}

function renderLanguageBreakdown(selection) {
  const selectedCommits = selection
    ? filteredCommits.filter((d) => isCommitSelected(selection, d))
    : [];

  const container = document.getElementById('language-breakdown');
  container.innerHTML = '';

  if (selectedCommits.length === 0) return;

  const lines = selectedCommits.flatMap((d) => d.lines);

  const breakdown = d3.rollup(
    lines,
    (v) => v.length,
    (d) => d.type,
  );

  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format('.1~%')(proportion);

    container.innerHTML += `
        <div class="lang-group">
        <dt>${language}</dt>
        <dd>${count} lines (${formatted})</dd>
        </div>
    `;
  }
}

function brushed(event) {
  const selection = event.selection;
  d3.selectAll('circle').classed('selected', (d) =>
    isCommitSelected(selection, d)
  );
  renderSelectionCount(selection, filteredCommits);
  renderLanguageBreakdown(selection);
}

function updateScatterPlot(data, filteredCommits) {
  const width = 1000;
  const height = 600;
  d3.select('svg').remove();

  const margin = { top: 10, right: 10, bottom: 30, left: 40 };
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  xScale = d3
    .scaleTime()
    .domain(d3.extent(filteredCommits, d => d.datetime))
    .range([usableArea.left, usableArea.right])
    .nice();

  yScale = d3
    .scaleLinear()
    .domain([0, 24])
    .range([usableArea.bottom, usableArea.top]);

  svg.append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

  svg.selectAll('g').remove();
  const dots = svg.append('g').attr('class', 'dots');

  const [minLines, maxLines] = d3.extent(filteredCommits, d => d.totalLines);
  const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([2, 30]);
  const colorScale = d3.scaleSequential(d3.interpolateCool).domain([0, 24]);

  const sortedCommits = d3.sort(filteredCommits, d => -d.totalLines);

  dots.selectAll('circle').remove();
  dots.selectAll('circle')
    .data(sortedCommits)
    .join('circle')
    .attr('cx', d => xScale(d.datetime))
    .attr('cy', d => yScale(d.hourFrac))
    .attr('r', d => rScale(d.totalLines))
    .attr('fill', d => colorScale(d.hourFrac))
    .style('fill-opacity', 0.7)
    .on('mouseenter', (event, commit) => {
      d3.select(event.currentTarget).style('fill-opacity', 1);
      renderTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mousemove', event => updateTooltipPosition(event))
    .on('mouseleave', event => {
      d3.select(event.currentTarget).style('fill-opacity', 0.7);
      updateTooltipVisibility(false);
    });

  svg.append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(d3.axisBottom(xScale));

  svg.append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(d3.axisLeft(yScale).tickFormat(d => String(d % 24).padStart(2, '0') + ':00'));

  svg.call(d3.brush().on('start brush end', brushed));
  svg.selectAll('.dots, .overlay ~ *').raise();
}

function filterCommitsByTime() {
  filteredCommits = commits.filter(d => d.datetime <= commitMaxTime);
}

function updateDisplayedTime() {
  const selectedTime = d3.select('#selectedTime');
  selectedTime.text(timeScale.invert(commitProgress).toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short"
  }));
  commitMaxTime = timeScale.invert(commitProgress);
  filterCommitsByTime();
  updateScatterPlot(data, filteredCommits);
  renderFilesList(filteredCommits);
  renderCommitInfo(
    filteredCommits.flatMap(d => d.lines),
    filteredCommits
  );
}

data = await loadData();
commits = processCommits(data);


let timeScale = d3.scaleTime(
  [d3.min(commits, (d) => d.datetime), d3.max(commits, (d) => d.datetime)],
  [0, 100]
);
let commitMaxTime = timeScale.invert(commitProgress);

filterCommitsByTime();
renderCommitInfo(data, commits);
updateScatterPlot(data, filteredCommits);
renderFilesList(filteredCommits);

d3.select('#commitSlider').on('input', function () {
  commitProgress = +this.value;
  updateDisplayedTime();
});

updateDisplayedTime();
