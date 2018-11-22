/* global d3 */
const state = require('../state.js')
const helper = {
	// https://github.com/d3/d3-scale#continuous-scales
	// http://www.jeromecukier.net/2011/08/11/d3-scales-and-color/
	color(data) {
		return d3
			.scaleLinear()
			.domain([0, Math.round(data.length / 2), data.length])
			.range(['#BBE4A0', '#52A8AF', '#00305C'])
	},

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
		state.set('showbar', false)
		state.set('data', {
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
