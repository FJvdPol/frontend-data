const vueData = {
  loaded: false,
  currentCity: 0,
  city: {
    name: '',
    total: null
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
  template: '<li>total: <span>{{ text }}</span></li>'
})

Vue.component('bookrow', {
  props: ['book'],
  template:
    '<li><h4>{{ book.title }}</h4><p>{{ book.publisher ? book.publisher : " " }}</p><p>{{ book.year }}</p></li>'
})

const app = new Vue({
  el: '#app',
  data: vueData
})
