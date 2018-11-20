const state = {
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

Vue.component('loader', {
	props: ['text'],
	template: '<h2>{{ text }}</h2>'
})

Vue.component('city', {
	props: ['text'],
	template: '<li>city: <span>{{ text }}</span></li>'
})

Vue.component('total', {
	props: ['text'],
	template: '<li>Total: <span>{{ text }}</span></li>'
})

Vue.component('bookrow', {
	props: ['book'],
	template:
		'<li><h4>{{ book.title }}</h4><p>{{ book.publisher ? book.publisher : " " }}</p><p>{{ book.year }}</p></li>'
})
Vue.component('test', {
	props: ['id'],
	template: '<p>Test: {{this.id}}</p>'
})

Vue.component('pie-chart', {
	props: ['data', 'id'],
	mounted() {
		drawPie(this.id, this.data)
	},
	watch: {
		data() {
			updatePie(this.id, this.data)
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
			filterGenre(e.target.value)
		}
	}
})
