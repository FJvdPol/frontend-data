mapboxgl.accessToken =
	'pk.eyJ1IjoiZmp2ZHBvbCIsImEiOiJjam9mcW1hMmUwNm81M3FvOW9vMDM5Mm5iIn0.5xVPYd93TZQEyqchDMNBtw'
const map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/fjvdpol/cjojwbcm50dkc2rtfo3m4vs6i',
	center: [4.899431, 52.379189],
	zoom: 5,
	pitch: 40,
	minZoom: 3
})

map.on('load', () => {
	Promise.all([
		d3.csv('data/codesnetherlands.csv'),
		d3.csv('data/worldcities.csv'),
		d3.json('data/wouterdata.json')
	])
		.then(results => {
			const coordinates = results[0].concat(results[1])

			const hasPublication = results[2]
				.filter(book => book.publication.place && book.publication.publisher)
				.map(book => {
					book.publication.place = book.publication.place
						.replace(/[^a-zA-Z,\s]+/g, '')
						.trim()
						.split(',')[0]
					return book
				})

			const genres = hasPublication
				.map(book => book.genres)
				.reduce((total, bookGenres) => total.concat(bookGenres), [])
				.sort()

			state.data = {
				cities: groupCities(hasPublication, coordinates),
				// new Set pakt alleen alle unieke waardes uit de array
				genres: [...new Set(genres)],
				amount: hasPublication.length,
				total: hasPublication,
				coordinates: coordinates
			}

			createCircles(state.data.cities)
		})
		.catch(err => {
			console.log(err)
		})
})

function createCircles(data) {
	const mapPointColor = '#BBE4A0'

	state.loaded = true

	map.flyTo({
		zoom: 6,
		speed: 0.4
	})

	// Get Mapbox map canvas container // jorditost
	const canvas = map.getCanvasContainer()

	const svg = d3
		.select(canvas)
		.append('svg')
		.append('g')
		.attr('fill', mapPointColor)
		.attr('stroke', mapPointColor)

	updateCircles(data)

	updateMap()

	// Update on map interaction
	map.on('viewreset', () => updateMap())
	map.on('move', () => updateMap())
	map.on('moveend', () => updateMap())
	map.on('zoom', () => updateMap())
}

function updateCircles(data) {
	const transition = 300

	const circles = d3
		.select('g')
		.selectAll('circle')
		.data(data)

	circles
		.transition()
		.duration(transition)
		.attr('r', 0)
		.transition()
		.duration(0)
		.attr('cx', d => project(d.coords).x)
		.attr('cy', d => project(d.coords).y)
		.transition()
		.duration(transition)
		.attr('r', d => getRadius(d.total))

	circles
		.enter()
		.append('circle')
		.attr('r', 0)
		.attr('cx', d => project(d.coords).x)
		.attr('cy', d => project(d.coords).y)
		.on('click', (d, i, all) => {
			console.log(d)
			return showCity(d, i, all)
		})
		.transition()
		.delay(transition)
		.duration(transition)
		.attr('r', d => getRadius(d.total))

	circles
		.exit()
		.transition()
		.duration(transition)
		.attr('r', 0)
		.remove()
}

function updateMap() {
	d3.select('g')
		.selectAll('circle')
		.transition()
		.duration(0)
		.attr('cx', d => project(d.coords).x)
		.attr('cy', d => project(d.coords).y)
		.attr('r', d => getRadius(d.total))
}

// Project publishers coordinates to the map's current state // jorditost
function project(coords) {
	return map.project(new mapboxgl.LngLat(+coords[0], +coords[1]))
}

function getRadius(amount) {
	const startZoom = 6
	const minPointSize = 5
	const radiusExp = (map.getZoom() - startZoom) * 0.75 + 1
	return (amount * radiusExp) / 10 + minPointSize > minPointSize
		? (amount * radiusExp) / 10 + minPointSize
		: minPointSize
}

function showCity(city, index, all) {
	console.log(city)
	state.city.name = city.key
	state.city.amount = city.total
	state.city.publishers = city.values.map(publisher => publisher.values.length)

	d3.selectAll('circle')
		.style('fill', '')
		.style('stroke', '')
	d3.select(all[index])
		.style('fill', 'var(--color-accent)')
		.style('stroke', 'var(--color-accent)')

	map.flyTo({
		center: [city.coords[0], city.coords[1]],
		speed: 0.3,
		curve: 2,
		zoom: 7
	})
}

function groupCities(data, coordinates) {
	const cities = d3
		.nest()
		.key(book => book.publication.place)
		.key(book => book.publication.publisher)
		.entries(data)
		.map(city => {
			const match = coordinates.find(
				place => place.city.toLowerCase() === city.key.toLowerCase()
			)
			if (!match) {
				return city
			}
			return {
				...city,
				total: city.values
					.map(publisher => publisher.values.length)
					.reduce((a, b) => a + b, 0),
				coords: [Number(match.lng), Number(match.lat)]
			}
		})
		.filter(city => city.coords)
	return cities
}

function filterGenre(genre) {
	console.log('filtering...')
	let data
	if (genre === 'all') {
		data = state.data.total
	} else {
		data = state.data.total.filter(book => book.genres.includes(genre))
	}
	d3.selectAll('circle')
		.style('fill', '')
		.style('stroke', '')
	state.city.name = ''
	state.data.cities = groupCities(data, state.data.coordinates)
	state.data.amount = data.length
	updateCircles(state.data.cities)
}

function getPieWidth() {
	return (window.innerWidth - 100) / 2 > 150 ? 150 : (window.innerWidth - 100) / 2
}

function updatePie(element, data) {
	console.log(element, data)
	const color = d3.scaleOrdinal()
		.domain(data)
		.range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length + 1))

	const radius = getPieWidth() / 2

	const arc = d3
		.arc()
		.outerRadius(radius)
		.innerRadius(0)

	const pie = d3
		.pie()
		.sort((a, b) => a - b)
		.value(d => d)

	const chart = d3.select(`#${element} .parent`)

	const path = chart
		.selectAll('path')
		.data(pie(data))

	path.enter()
		.append('g')
		.classed('arc', true)
		.append('path')
		.attr('d', arc)
		.style('fill', (d, i) => color(i))
		// saves initial arc value // Mike Bostock (https://bl.ocks.org/mbostock/1346410)
		.each((d, i, all) => all[i]._current = d)
		.transition()
		.duration(500)
		.attrTween('d', enterTween)


	path
		.transition()
		.style('fill', (d, i) => color(i))
		.duration(500)
		// redraw the arcs
		.attrTween('d', arcTween)

	path
		.exit()
		.remove()

	// same as next function but still don't know how to work with next function to go from 0 on enter
	function enterTween(d) {
		d.innerRadius = 0;
		var i = d3.interpolate({startAgnle: 0, endAngle: 0}, d)
		return (t) => arc(i(t))
	}
	// interpolate between previous endpoint of datapoint arc and new endpoint
	// Mike Bostock (https://bl.ocks.org/mbostock/1346410)
	function arcTween(d) {
	  const i = d3.interpolate(this._current, d)
	  this._current = i(0)
	  return (t) => arc(i(t))
	}
}

function drawPie(element, data) {
	const height = getPieWidth()
	const width = getPieWidth()

	d3.select(`#${element}`)
		.append('svg')
		.attr('width', width)
		.attr('height', height)
		.append('g')
		.classed('parent', true)
		.attr('transform', `translate(${width / 2}, ${height / 2})`)

	updatePie(element, data)
}
