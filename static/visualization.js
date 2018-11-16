mapboxgl.accessToken =
  'pk.eyJ1IjoiZmp2ZHBvbCIsImEiOiJjam9mcW1hMmUwNm81M3FvOW9vMDM5Mm5iIn0.5xVPYd93TZQEyqchDMNBtw'
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/fjvdpol/cjofretwi5izu2qnxnkrie3y3',
  center: [4.899431, 52.379189],
  zoom: 7
})

map.on('load', () => {
  // jorditost
  d3.csv('data/codesnetherlands.csv').then(result => {
    const data = {}
    data.coords = result
      .map(obj => ({
        name: obj.woonplaats,
        lat: obj.latitude,
        long: obj.longitude
      }))
      .filter(
        (obj, index, total) =>
          total.findIndex(t => t.name === obj.name) === index
      )

    d3.json('data/data.json').then(result => {
      data.books = result

      data.locatedBooks = data.books
        .map(book => {
          const match = data.coords.find(place => place.name === book.place)
          return match ? { ...book, coords: [+match.long, +match.lat] } : book
        })
        .filter(book => book.coords)

      data.publishers = d3
        .nest()
        .key(book => book.publisher)
        .entries(data.locatedBooks)
        // .filter(publisher => publisher.values.length > 5)

      drawData(data)
    })
  })
})

const drawData = data => {
  console.log(data.coords)
  console.log(data.books.length, data.locatedBooks.length)
  console.log(data.locatedBooks)
  console.log(data.publishers)

  // colors
  const publisherColor = '#BBE4A0'

  // Get Mapbox map canvas container // jorditost
  var canvas = map.getCanvasContainer()

  const startZoom = map.getZoom()

  // Overlay d3 on the map
  const svg = d3
    .select(canvas)
    .append('svg')
    .append('g')
    .attr('fill', publisherColor)
    .attr('stroke', publisherColor)


  // Project publishers coordinates to the map's current state // jorditost
  const project = coords =>
    map.project(new mapboxgl.LngLat(+coords[0], +coords[1]))

  // Draw GeoJSON data with d3
  const circles = svg
    .selectAll('circle')
    .data(data.publishers)
    .enter()
    .append('circle')
    .attr('r', 16)
    .on('click', d => alert(d.key))
    .transition()
    .duration(0)
    .attr('cx', d => project(d.values[0].coords).x)
    .attr('cy', d => project(d.values[0].coords).y)

  // Update function
  const update = transitionTime => {
    transitionTime = typeof transitionTime !== 'undefined' ? transitionTime : 0
    const radiusExp = (map.getZoom() - startZoom) * 0.5 + 0.5
    svg
      .selectAll('circle')
      .transition()
      .duration(transitionTime)
      .attr('r', d => d.values.length * radiusExp > 0 ? d.values.length * radiusExp : 0)
      .attr('cx', d => project(d.values[0].coords).x)
      .attr('cy', d => project(d.values[0].coords).y)
  }

  // Call the update function
  update()

  // Update on map interaction
  map.on('viewreset', () => update(0))
  map.on('move', () => update(0))
  map.on('moveend', () => update(0))
  map.on('zoom', () => update(0))
}
