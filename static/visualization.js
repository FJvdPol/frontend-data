mapboxgl.accessToken = 'pk.eyJ1IjoiZmp2ZHBvbCIsImEiOiJjam9mcW1hMmUwNm81M3FvOW9vMDM5Mm5iIn0.5xVPYd93TZQEyqchDMNBtw'
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/fjvdpol/cjofretwi5izu2qnxnkrie3y3',
    center: [4.899431, 52.379189],
    zoom: 7
})

d3.json('data.json').then(data => destructData(data))

const destructData = data => {
  const byPlace = d3.nest()
    .key(book => book.place)
    .entries(data)

  console.log(byPlace)
}
