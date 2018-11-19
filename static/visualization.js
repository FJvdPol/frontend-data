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

			init(state.data.cities)
		})
		.catch(err => {
			console.log(err)
		})
})

function init(data) {
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
		.on('click', (d, i, all) => showCity(d, i, all))
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
	state.city.name = city.key
	state.city.total = city.total

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

function filterCities(genre) {
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
