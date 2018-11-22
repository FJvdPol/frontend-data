const state = require('../state.js')
const pie = require('../d3/pie.js')
const bar = require('../d3/bar.js')
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

	Vue.component('bar-chart', {
		props: ['screen', 'data', 'id'],
		mounted() {
			bar.draw(this.id, this.data)
		},
		watch: {
			data() {
				bar.update(this.id, this.data)
			},
			screen() {
				document.querySelector(`#${this.id}`).innerHTML = ''
				bar.draw(this.id, this.data)
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
			},
			metadataClass: () => {
				if (state.city.name && state.showbar) {
					return 'metadata-holder city'
				} else if (state.city.name) {
					return 'metadata-holder city full'
				}
				return 'metadata-holder'
			}
		}
	})
}
