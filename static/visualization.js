mapboxgl.accessToken =
  'pk.eyJ1IjoiZmp2ZHBvbCIsImEiOiJjam9mcW1hMmUwNm81M3FvOW9vMDM5Mm5iIn0.5xVPYd93TZQEyqchDMNBtw'
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/fjvdpol/cjojwbcm50dkc2rtfo3m4vs6i',
  center: [4.899431, 52.379189],
  zoom: 5,
  pitch: 40
})

map.on('load', () => {
  Promise.all([
    d3.csv('data/codesnetherlands.csv'),
    d3.json('data/data.json')
  ]).then(results => {
    const data = {}

    const coordinates = results[0]
      .map(obj => ({
        name: obj.woonplaats,
        lat: obj.latitude,
        long: obj.longitude
      }))
      .filter(
        (obj, index, total) =>
          total.findIndex(t => t.name === obj.name) === index
      )

    data.total = results[1].length

    data.booksWithCity = results[1]
      .map(book => {
        const match = coordinates.find(place => place.name === book.place)
        return match ? { ...book, coords: [+match.long, +match.lat] } : book
      })
      .filter(book => book.coords)

    data.cities = d3
      .nest()
      .key(book => book.place)
      .key(book => book.publisher)
      .entries(data.booksWithCity)
      .map(city => ({
        ...city,
        total: city.values
          .map(publisher => publisher.values.length)
          .reduce((a, b) => a + b, 0),
        coords: city.values[0].values[0].coords
      }))

    drawData(data)
  })
})

const drawData = data => {
  console.log(data)
  vueData.loaded = true

  map.flyTo({
    zoom: 7,
    speed: 0.4
  })

  // Colors
  const publisherColor = '#BBE4A0'

  // Get Mapbox map canvas container // jorditost
  const canvas = map.getCanvasContainer()

  const startZoom = 7

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

  const showCity = (city, index, all) => {
    vueData.city.name = city.key
    vueData.city.total = city.total
    vueData.currentCity = index
    console.log(vueData.city)

    d3.selectAll('circle')
      .style('fill', '')
      .style('stroke', '')
    d3.select(all[index])
      .style('fill', 'var(--color-accent)')
      .style('stroke', 'var(--color-accent)')

    map.flyTo({
      center: [city.coords[0], city.coords[1]],
      speed: 0.3,
      curve: 2
    })
  }

  // Draw GeoJSON data with d3
  svg
    .selectAll('circle')
    .data(data.cities)
    .enter()
    .append('circle')
    .attr('r', 16)
    .on('click', (d, i, all) => showCity(d, i, all))
    .transition()
    .duration(0)
    .attr('cx', d => project(d.coords).x)
    .attr('cy', d => project(d.coords).y)

  // Update function
  const update = transitionTime => {
    transitionTime = typeof transitionTime === 'undefined' ? 0 : transitionTime
    const radiusExp = (map.getZoom() - startZoom) * 0.75 + 1
    svg
      .selectAll('circle')
      .transition()
      .duration(transitionTime)
      .attr('r', d =>
        (d.total * radiusExp) / 10 + 3 > 0 ? (d.total * radiusExp) / 10 + 3 : 0
      )
      .attr('cx', d => project(d.coords).x)
      .attr('cy', d => project(d.coords).y)
  }

  // Call the update function
  update()

  // Update on map interaction
  map.on('viewreset', () => update(0))
  map.on('move', () => update(0))
  map.on('moveend', () => update(0))
  map.on('zoom', () => update(0))
}
