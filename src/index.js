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
		d3.json('data/data.json')
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
