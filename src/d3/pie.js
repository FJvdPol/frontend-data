/* global d3 */
const tooltip = require('./tooltip.js')
const helper = require('../helpers/helper.js')

const pie = {
	draw(element, data) {
		const height = this.width()
		const width = this.width()

		const chart = d3.select(`#${element}`)

		chart
			.append('div')
			.classed('tooltip', true)
			.style('opacity', 0)
			.append('h4')

		chart
			.append('svg')
			.attr('width', width)
			.attr('height', height)
			.append('g')
			.classed('parent', true)
			.attr('transform', `translate(${width / 2}, ${height / 2})`)

		this.update(element, data)
	},

	update(element, data) {
		const color = helper.color(data)

		const radius = this.width() / 2

		// http://www.cagrimmett.com/til/2016/08/19/d3-pie-chart.html
		const arc = d3
			.arc()
			.outerRadius(radius)
			.innerRadius(0)

		// http://www.cagrimmett.com/til/2016/08/19/d3-pie-chart.html
		const pie = d3
			.pie()
			.sort(null)
			.value(d => d.total)

		const chart = d3.select(`#${element} .parent`)

		const path = chart.selectAll('path').data(pie(data))

		path
			.enter()
			.append('path')
			.attr('title', (d, i) => d.data.title)
			.on('mouseover', d =>
				tooltip.show(element, `${d.data.title}: ${d.value} books`)
			)
			.on('mouseout', () => tooltip.hide(element))
			.style('fill', (d, i) => color(i))
			// saves initial arc value // Mike Bostock (https://bl.ocks.org/mbostock/1346410)
			.each((d, i, all) => (all[i]._current = d))
			.transition()
			.duration(500)
			.attrTween('d', enterTween)

		path
			.transition()
			.style('fill', (d, i) => color(i))
			.duration(500)
			// redraw the arcs
			.attrTween('d', arcTween)

		path.exit().remove()

		// same as next function but still don't know how to work with next function to go from 0 on enter
		function enterTween(d) {
			d.innerRadius = 0
			var i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d)
			return t => arc(i(t))
		}
		// interpolate between previous endpoint of datapoint arc and new endpoint
		// Mike Bostock (https://bl.ocks.org/mbostock/1346410)
		function arcTween(d) {
			const i = d3.interpolate(this._current, d)
			this._current = i(0)
			return t => arc(i(t))
		}
	},

	// Makes sure the pie charts (which are rendered next to eachother) don't exceed their container limit.
	// On mobile makes sure the charts are half of the viewport with a leftover space of 50 each
	width() {
		return window.innerWidth - 100 > 40 * 16
			? 200
			: (window.innerWidth - 100) / 2
	}
}

module.exports = pie
