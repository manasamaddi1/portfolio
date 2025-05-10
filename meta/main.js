import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

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

// Load and process
// let data = await loadData();
// let commits = processCommits(data);
// console.log(commits);


function renderCommitInfo(data, commits) {
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

function renderScatterPlot(data, commits) {
  const width = 1000;
  const height = 600;

  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  // Scales
  const xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, width])
    .nice();

  const yScale = d3.scaleLinear()
    .domain([0, 24])
    .range([height, 0]);

  // Draw dots
  const dots = svg.append('g').attr('class', 'dots');

  dots
    .selectAll('circle')
    .data(commits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', 5)
    .attr('fill', 'steelblue');
}



let data = await loadData();
let commits = processCommits(data);

renderCommitInfo(data, commits);
renderScatterPlot(data, commits);


