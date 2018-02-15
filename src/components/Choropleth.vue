<template>
  <div></div>
</template>

<script>
// TODO: Make width and height parametrizable.
// TODO: See about responsiveness
// NOTE: Assumes RD new coordinate system (EPSG:28992) this
// is what api.data.amsterdam.nl/gebieden/* endpoints provide.
import * as d3 from 'd3'
import geojsonExtent from '@mapbox/geojson-extent'

const width = 600
const height = 600

// NOTE: We treat RD as a Cartesian coordinate system, setup projections:
function generateCartesianProjection (width, height, geojson) {
  let extent = geojsonExtent(geojson) // WSEN
  let wScale = width / (extent[2] - extent[0])
  let hScale = height / (extent[3] - extent[1])

  let x = d3.scaleLinear().domain([extent[0], extent[2]])
  let y = d3.scaleLinear().domain([extent[1], extent[3]])

  if (wScale < hScale) {
    x.range([0, width])
    // y should use same scale factor as x, calculate the relevant range given that constraint
    let newHeight = wScale * (extent[3] - extent[1])
    let offset = (height - newHeight) / 2
    y.range([height - offset, offset])
  } else {
    y.range([height, 0])
    // x should use same scale factor as y, calculate the relevant range given that constraint
    let newWidth = Math.abs(hScale * (extent[2] - extent[0]))
    let offset = (width - newWidth) / 2
    x.range([offset, width - offset])
  }

  var cartesianProjection = d3.geoTransform({
    point: function (px, py) {
      this.stream.point(x(px), y(py))
    }
  })

  return cartesianProjection
}

function generateColorScale (data) {
  // assumes data is an array of 2 element arrays with value second entry the value
  let extent = d3.extent(data, function (d) {
    return d[1]
  })

  console.log('Colorscale --- Extent of data is', extent)
  let colorScale = d3.scaleSequential(d3.interpolateViridis)
    .domain(extent)

  return colorScale
}

export default {
  props: [
    'geojson',
    'data'
  ],
  mounted () {},
  methods: {
    drawMap () {
      console.log('Data should be here:', this.geojson.features, this.data)
      console.assert(this.geojson, 'GeoJSON data needed for map')
      console.assert(this.data.length, 'Data needed')

      let svg = d3.select(this.$el).append('svg')
        .attr('width', width)
        .attr('height', height)

      // set up path generator
      let cartesianProjection = generateCartesianProjection(
        width, height, this.geojson
      )
      let pathGen = d3.geoPath().projection(cartesianProjection)
      let colorScale = generateColorScale(this.data)
      // draw map
      let vollcode2val = new Map(this.data)

      svg.selectAll('path.borders')
        .data(this.geojson.features)
        .enter().append('path')
        .attr('class', 'borders')
        .attr('fill', function (d, i) {
          console.log(colorScale.domain())
          console.log('value', vollcode2val.get(d.properties.vollcode))
          let color = colorScale(vollcode2val.get(d.properties.vollcode))
          console.log('color', color)
          return color
        })
        .attr('d', pathGen)
    }
  },
  watch: {
    geojson (to, from) {
      if (to.features.length) {
        if (this.data) {
          console.log('We have geojson and data.')
          this.drawMap()
        }
      }
    },
    data (to, from) {
      if (to.length) {
        if (this.geojson) {
          console.log('We have data and geojson.')
          this.drawMap()
        }
      }
    }
  }
}
// TODO: 1) move map drawing to its own function or method
//       2) watch data and geojson variables, trigger map redraw when both are not null
//       3) we probably want SVG element before map appears
//       4) see whether we can scope the styles somehow (D3 is ignorant of this)
</script>

<style>
path.borders {
  stroke: black;
  stroke-width: 1px;
  /* fill: none */
}
</style>
