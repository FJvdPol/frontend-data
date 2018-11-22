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
