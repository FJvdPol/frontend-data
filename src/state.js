const state = {
	set(property, value) {
		this[property] = value
	},
	loaded: false,
	currentCity: 0,
	showbar: false,
	fullscreen: false,
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
