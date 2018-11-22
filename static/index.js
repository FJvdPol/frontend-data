(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const state = require('../state.js')
const pie = require('../d3/pie.js')
const helper = require('../helpers/helper.js')

module.exports = () => {
	Vue.component('loader', {
		props: ['text'],
		template: '<h2>{{ text }}</h2>'
	})

	Vue.component('pie-chart', {
		props: ['data', 'id'],
		mounted() {
			pie.draw(this.id, this.data)
		},
		watch: {
			data() {
				pie.update(this.id, this.data)
			}
		},
		template: '<div :id="this.id"></div>'
	})

	const app = new Vue({
		el: '#app',
		data() {
			return state
		},
		methods: {
			changeFilter: e => {
				helper.filterGenre(e.target.value)
				map.update('map', state.data.cities)
			}
		}
	})
}

},{"../d3/pie.js":3,"../helpers/helper.js":6,"../state.js":7}],2:[function(require,module,exports){
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

		// Get Mapbox map canvas container // jorditost
		const chart = d3.select(this.mapbox.getCanvasContainer())

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

		// Update on map interaction
		this.mapbox.on('viewreset', () => this.move('map'))
		this.mapbox.on('move', () => this.move('map'))
		this.mapbox.on('moveend', () => this.move('map'))
		this.mapbox.on('zoom', () => this.move('map'))
	},

	move(element) {
		d3.select(`#${element} g`)
			.selectAll('circle')
			.transition()
			.duration(0)
			.attr('cx', d => this.project(d.coords).x)
			.attr('cy', d => this.project(d.coords).y)
			.attr('r', d => this.radius(d.total))
	},

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

	project(coords) {
		// Project publishers coordinates to the map's current state // jorditost
		return this.mapbox.project(new mapboxgl.LngLat(+coords[0], +coords[1]))
	},

	radius(amount) {
		const startZoom = 6
		const minPointSize = 15
		const radiusExp = (this.mapbox.getZoom() - startZoom) * 0.75 + 1
		return (amount * radiusExp) / 2 + minPointSize > minPointSize
			? Math.sqrt((amount * radiusExp) / 2 + minPointSize)
			: Math.sqrt(minPointSize)
		// Math.sqrt -> https://developers.google.com/maps/documentation/javascript/examples/circle-simple
	}
}

module.exports = map

},{"./showcity.js":4,"./tooltip.js":5}],3:[function(require,module,exports){
/* global d3 */
const tooltip = require('./tooltip.js')

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
		// https://github.com/d3/d3-scale#continuous-scales
		// http://www.jeromecukier.net/2011/08/11/d3-scales-and-color/
		const color = d3
			.scaleLinear()
			.domain([0, Math.round(data.length / 2), data.length])
			.range(['#BBE4A0', '#52A8AF', '#00305C'])

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
			.append('g')
			.classed('arc', true)
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
		return (window.innerWidth - 100) / 2 > 150
			? 150
			: (window.innerWidth - 100) / 2
	}
}

module.exports = pie

},{"./tooltip.js":5}],4:[function(require,module,exports){
/* global d3 */
const state = require('../state.js')

const city = {
	configure(mapbox) {
		this.mapbox = mapbox
	},
	show(city, index, all) {
		state.set('city', {
			name: city.key,
			amount: city.total,
			publishers: city.values
				.map(publisher => ({
					title: publisher.key,
					total: publisher.values.length
				}))
				.sort((a, b) => a.total - b.total)
		})

		// Make the clicked circle full color
		d3.selectAll('circle').style('opacity', '')
		d3.select(all[index]).style('opacity', 1)

		// on mobile, put the map center more to the top of the screen to accomodate for the city info div
		const center =
			window.innerWidth > 40 * 16
				? [city.coords[0], city.coords[1]]
				: [city.coords[0], city.coords[1] - 0.3]

		this.mapbox.flyTo({
			center,
			speed: 0.3,
			curve: 2,
			zoom: 8
		})
	}
}

module.exports = city

},{"../state.js":7}],5:[function(require,module,exports){
/* global d3 */
const tooltip = {
	show(element, text) {
		d3.select(`#${element} .tooltip`)
			.style('left', `${d3.event.pageX}px`) // dennis
			.style('top', `${d3.event.pageY - 30}px`) // dennis
			.transition()
			.duration(300)
			.style('opacity', 0.8)
			.select('h4')
			.text(text)
	},
	hide(element) {
		d3.select(`#${element} .tooltip`)
			.transition()
			.duration(300)
			.style('opacity', 0)
	}
}

module.exports = tooltip

},{}],6:[function(require,module,exports){
/* global d3 */
const state = require('../state.js')
const helper = {
	groupCities(data, coordinates) {
		const cities = d3
			.nest()
			.key(book => book.publication.place)
			.key(book => book.publication.publisher)
			.entries(data)
			.map(city => {
				// match equals true if city is in coordinates database
				const match = coordinates.find(
					place => place.city.toLowerCase() === city.key.toLowerCase()
				)
				if (!match) {
					return null
				}
				const total = city.values
					.map(publisher => publisher.values.length)
					.reduce((a, b) => a + b, 0)

				const coords = [Number(match.lng), Number(match.lat)]

				return {
					...city,
					total,
					coords
				}
			})
			.filter(city => city !== null)
		return cities
	},

	filterGenre(genre) {
		let data

		if (genre === 'all') {
			data = state.data.total
		} else {
			data = state.data.total.filter(book => book.genres.includes(genre))
		}

		d3.selectAll('circle')
			.style('fill', '')
			.style('stroke', '')

		state.set('city', {
			...state.city,
			name: ''
		})
		state.set(data, {
			...state.data,
			cities: this.groupCities(data, state.data.coordinates),
			amount: data.length
		})
	},

	formatData(results) {
		const coordinates = results[0].concat(results[1])

		const hasPublication = results[2]
			.filter(book => book.publication.place && book.publication.publisher)
			.map(book => {
				// Make sure random characters are removed from the publication city name
				book.publication.place = book.publication.place
					.replace(/[^a-zA-Z,\s]+/g, '')
					.trim()
					.split(',')[0]
				// Make sure inconsistencies in naming of publishers get grouped together
				book.publication.publisher = book.publication.publisher
					.replace(/[^a-zA-Z,\s]+/g, '')
					.replace('Uitgeverij', '')
					.replace('uitgeverij', '')
					.trim()
					.split(',')[0]
					.toLowerCase()
					// https://joshtronic.com/2016/02/14/how-to-capitalize-the-first-letter-in-a-string-in-javascript/
					.replace(/^\w/, c => c.toUpperCase())
				return book
			})

		const genres = hasPublication
			.map(book => book.genres)
			.reduce((total, bookGenres) => total.concat(bookGenres), [])
			.sort()

		const cities = this.groupCities(hasPublication, coordinates)
		return {
			cities: cities,
			// Here new Set generates an array with only unique values from a different array
			genres: [...new Set(genres)],
			amount: hasPublication.length,
			total: hasPublication,
			coordinates: coordinates
		}
	}
}

module.exports = helper

},{"../state.js":7}],7:[function(require,module,exports){
const state = {
	set(property, value) {
		this[property] = value
	},
	loaded: false,
	currentCity: 0,
	data: {
		genres: [],
		amount: 0,
		cities: [],
		total: []
	},
	city: {
		name: '',
		amount: 0,
		publishers: []
	}
}

module.exports = state

},{}],8:[function(require,module,exports){
/* global d3 Vue mapboxgl */
const state = require('./state.js')
const map = require('./d3/map.js')
const pie = require('./d3/pie.js')
const helper = require('./helpers/helper.js')
const layout = require('./components/vue.js')

layout()

mapboxgl.accessToken =
	'pk.eyJ1IjoiZmp2ZHBvbCIsImEiOiJjam9mcW1hMmUwNm81M3FvOW9vMDM5Mm5iIn0.5xVPYd93TZQEyqchDMNBtw'

const mapbox = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/fjvdpol/cjojwbcm50dkc2rtfo3m4vs6i',
	center: [4.899431, 52.379189],
	zoom: 5,
	pitch: 40,
	minZoom: 2
})

mapbox.on('load', () => {
	Promise.all([
		d3.csv('data/codesnetherlands.csv'),
		d3.csv('data/worldcities.csv'),
		d3.json('data/wouterdata.json')
	])
		.then(results => {
			state.set('data', helper.formatData(results))

			map.configure(mapbox)
			map.create(state.data.cities)

			state.set('loaded', true)

			mapbox.flyTo({
				zoom: 6,
				speed: 0.4
			})
		})
		.catch(err => {
			console.log(err)
		})
})

},{"./components/vue.js":1,"./d3/map.js":2,"./d3/pie.js":3,"./helpers/helper.js":6,"./state.js":7}]},{},[8]);
