const tooltip = require('./tooltip.js')
const helper = require('../helpers/helper.js')
const state = require('../state.js')

const bar = {
	margin: { top: 20, right: 30, bottom: 100, left: 80 },

	draw(element, data) {
		const chart = d3.select(`#${element}`)

		chart
			.append('div')
			.classed('tooltip', true)
			.style('opacity', 0)
			.append('h4')

		const svg = chart
			.append('svg')
			.attr('width', this.width())
			.attr('height', this.height())

		const axis = svg.append('g').classed('axis', true)

		axis.append('g').classed('xAxis', true)

		axis.append('g').classed('yAxis', true)

		// axis titles: https://bl.ocks.org/d3noob/23e42c8f67210ac6c678db2cd07a747e
		axis
			.append('text')
			.attr(
				'transform',
				`rotate(90) translate(${this.height() - this.margin.bottom / 2}, ${0 -
					this.width()})`
			)
			.attr('dy', '0.75em')
			.style('text-anchor', 'middle')
			.style('color', 'var(--color-main)')
			.text('Publishers')

		axis
			.append('text')
			.attr(
				'transform',
				`rotate(-90) translate(${0 -
					this.height() / 2 +
					this.margin.bottom / 2}, ${10})`
			)
			.attr('dy', '0.75em')
			.style('text-anchor', 'middle')
			.style('color', 'var(--color-main)')
			.text('Amount of books')

		svg.append('g').classed('parent', true)

		this.update(element, data)
	},

	update(element, data) {
		const color = helper.color(data)

		const svg = d3.select(`#${element} svg`)

		const chart = d3.select(`#${element} .parent`)

		const rect = chart.selectAll('rect').data(data)

		// start source: https://beta.observablehq.com/@mbostock/d3-bar-chart
		const x = d3
			.scaleBand()
			.domain(data.map(d => d.title))
			.range([this.margin.left, this.width() - this.margin.right])
			.padding(0.1)

		const y = d3
			.scaleLinear()
			.domain([0, d3.max(data, d => d.total)])
			.nice()
			.range([this.height() - this.margin.bottom, this.margin.top])

		const xAxis = g =>
			g
				.attr('transform', `translate(0,${this.height() - this.margin.bottom})`)
				.call(d3.axisBottom(x).tickSizeOuter(0))
				.selectAll('text')
				.attr('y', 0)
				.attr('x', 10)
				.attr('dy', '.35em')
				.attr('transform', 'rotate(90)')
				.style('text-anchor', 'start')

		const yAxis = g =>
			g
				.attr('transform', `translate(${this.margin.left},0)`)
				.call(d3.axisLeft(y))
				.call(g => g.select('.domain').remove())

		svg.select('.xAxis').call(xAxis)

		svg.select('.yAxis').call(yAxis)
		// end source

		rect
			.enter()
			.append('rect')
			.attr('title', (d, i) => d.title)
			.on('mouseover', d =>
				tooltip.show(element, `${d.title}: ${d.total} books`)
			)
			.on('mouseout', () => tooltip.hide(element))
			.style('fill', (d, i) => color(i))
			.attr('x', (d, i) => x(d.title))
			.attr('y', d => this.height() - this.margin.bottom)
			.attr('height', () => 0)
			.attr('width', x.bandwidth())
			.transition()
			.duration(500)
			.attr('y', d => y(d.total))
			.attr('height', d => y(0) - y(d.total))

		rect
			.style('fill', (d, i) => color(i))
			.attr('x', (d, i) => x(d.title))
			.attr('y', d => this.height() - this.margin.bottom)
			.attr('height', () => 0)
			.attr('width', x.bandwidth())
			.transition()
			.duration(500)
			.attr('y', d => y(d.total))
			.attr('height', d => y(0) - y(d.total))

		rect.exit().remove()
	},

	height() {
		return this.width() / 2
	},

	width() {
		return state.fullscreen
			? window.innerWidth - 6 * 16
			: window.innerWidth / 1.75 // (20 - 3) * 16
	}
}

module.exports = bar
