/* global d3 mapboxgl */
const city = require('./showcity.js')
const tooltip = require('./tooltip.js')

const map = {
	configure(mapbox) {
		this.mapbox = mapbox
		city.configure(mapbox)
	},
	create(data, mapbox) {
		const mapPointColor = '#BBE4A0'

		/*
		=== Start source ===
		Get Mapbox map canvas container
		From an example by jorditost
		via https://github.com/jorditost/mapboxgl-d3-playground
		*/
		const chart = d3.select(this.mapbox.getCanvasContainer())
		/* === End source === */

		chart
			.append('div')
			.classed('tooltip', true)
			.style('opacity', 0)
			.append('h4')

		const svg = chart.append('svg')

		svg
			.append('g')
			.attr('fill', mapPointColor)
			.attr('stroke', mapPointColor)

		this.update('map', data)

		this.move('map')

		/*
		=== Start source ===
		Update on map interaction
		From an example by jorditost
		via https://github.com/jorditost/mapboxgl-d3-playground
		*/
		this.mapbox.on('viewreset', () => this.move('map'))
		this.mapbox.on('move', () => this.move('map'))
		this.mapbox.on('moveend', () => this.move('map'))
		this.mapbox.on('zoom', () => this.move('map'))
		/* === End source === */
	},

	/*
	=== Start source ===
	Move function to update map coordinates for map points
	From an example by jorditost
	via https://github.com/jorditost/mapboxgl-d3-playground
	*/
	move(element) {
		d3.select(`#${element} g`)
			.selectAll('circle')
			.transition()
			.duration(0)
			.attr('cx', d => this.project(d.coords).x)
			.attr('cy', d => this.project(d.coords).y)
			.attr('r', d => this.radius(d.total))
	},
	/* === End source === */

	update(element, data) {
		const transition = 300

		const chart = d3.select(`#${element} svg g`)

		const circles = chart.selectAll('circle').data(data)

		circles
			.transition()
			.duration(transition)
			.attr('r', 0)
			.transition()
			.duration(0)
			.attr('cx', d => this.project(d.coords).x)
			.attr('cy', d => this.project(d.coords).y)
			.transition()
			.duration(transition)
			.attr('r', d => this.radius(d.total))

		circles
			.enter()
			.append('circle')
			.attr('r', 0)
			.attr('cx', d => this.project(d.coords).x)
			.attr('cy', d => this.project(d.coords).y)
			.on('mouseover', d => tooltip.show(element, `${d.key}: ${d.total} books`))
			.on('mouseout', () => tooltip.hide(element))
			.on('click', (d, i, all) => {
				tooltip.hide(element)
				city.show(d, i, all)
			})
			.transition()
			.delay(transition)
			.duration(transition)
			.attr('r', d => this.radius(d.total))

		circles
			.exit()
			.transition()
			.duration(transition)
			.attr('r', 0)
			.remove()
	},

	/*
	=== Start source ===
	Projection function to project points on the map based on the current scroll or move state
	From an example by jorditost
	via https://github.com/jorditost/mapboxgl-d3-playground
	*/
	project(coords) {
		return this.mapbox.project(new mapboxgl.LngLat(+coords[0], +coords[1]))
	},
	/* === End source === */

	radius(amount) {
		const startZoom = 6
		const minPointSize = 15
		const radiusExp = (this.mapbox.getZoom() - startZoom) * 0.75 + 1
		return amount * radiusExp + minPointSize > minPointSize
			? Math.sqrt(amount * radiusExp + minPointSize)
			: Math.sqrt(minPointSize)
		/*
		Math.sqrt based on example by google which they use in drawing more true-to-life map points -> https://developers.google.com/maps/documentation/javascript/examples/circle-simple
		*/
	}
}

module.exports = map
