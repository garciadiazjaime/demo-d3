const D3Node = require('d3-node')
const puppeteer = require('puppeteer')

function getLineChart({
  data,
  selector: _selector = '#chart',
  container: _container = `
    <div id="container">
      <h2>Line Chart Title</h2>
      <div id="chart"></div>
    </div>
  `,
  width: _width = 960,
  height: _height = 500,
  margin: _margin = {
    top: 10,
    right: 20,
    bottom: 20,
    left: 25,
  },
} = {}) {
  const d3n = new D3Node({
    selector: _selector,
    container: _container,
  })

  const { d3 } = d3n

  const width = _width - _margin.left - _margin.right
  const height = _height - _margin.top - _margin.bottom

  const svg = d3n.createSVG(_width, _height)
    .append('g')
    .attr('transform', `translate(${_margin.left}, ${_margin.top})`)

  const g = svg.append('g')

  const xScale = d3.scaleBand()
    .domain(data.map(d => d.label))
    .rangeRound([0, width])

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .rangeRound([height, 0])

  const lineChart = d3.line()
    .x(d => xScale(d.label))
    .y(d => yScale(d.value))

  g.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(xScale))

  g.append('g').call(d3.axisLeft(yScale))

  g.append('g')
    .attr('fill', 'none')
    .selectAll('path')
    .data([data])
    .enter()
    .append('path')
    .attr('stroke', 'steelblue')
    .attr('transform', `translate(120, 0)`)
    .attr('d', lineChart)

  return d3n
}

async function captureImage(html, { path }) {
  const browser = await puppeteer.launch()

  const page = await browser.newPage()

  page.setContent(html)

  await page.screenshot({ path })

  await browser.close()
}

function saveImage(dest, d3n) {
  const html = d3n.html()
  const ext = 'png'
  captureImage(html, {
      path: `${dest}.${ext}`, 
  })
}


function main() {
  const data = [{
      label: 'label 1',
      value: 10
    },
    {
      label: 'label 2',
      value: 20
    },
    {
      label: 'label 3',
      value: 40
    },
  ]

  saveImage('./data/output', getLineChart({
    data,
    container: `<div id="container">
      <h1>Line Chart generated using D3 and nodejs</h1>
      <div id="chart"></div>
    </div>`,
    width: 800,
    height: 500,
    lineWidth: 2,
  }))

  console.log('Image generated :) look at: "data/output.png"')
}

main()
