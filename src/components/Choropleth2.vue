<template>
  <div></div>
</template>

<script>
// TODO: Make width and height parametrizable.
// TODO: See about responsiveness
// NOTE: Assumes RD new coordinate system (EPSG:28992) this
// is what api.data.amsterdam.nl/gebieden/* endpoints provide.
import * as d3 from 'd3'
import ch from '../services/choropleth-d3'

const width = 600
const height = 600

export default {
  props: [
    'geojson',
    'data'
  ],
  methods: {
    // check that we can ensure the DOM is ready
    drawMap () {
      console.log('Data should be here:', this.geojson.features, this.data)
      console.assert(this.geojson, 'GeoJSON data needed for map')
      console.assert(this.data.length, 'Data needed')

      let svg = d3.select(this.$el).append('svg')
        .attr('width', width)
        .attr('height', height)

      // set up path generator
      let cartesianProjection = ch.generateCartesianProjection(
        width, height, this.geojson
      )

      // draw map
      let selection = svg.selectAll('path.borders')
        .data(this.geojson.features)

      let choropleth = ch.baseChoropleth()
        .projection(cartesianProjection)
        .data(this.data) // stupid naming!
        .label(d => d.properties.vollcode)
        .interpolator(d3.interpolateViridis)

      choropleth(selection)
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
