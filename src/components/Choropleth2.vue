<template>
  <div></div>
</template>

<script>
// TODO: Make width and height parametrizable.
// TODO: See about responsiveness
// NOTE: Assumes RD new coordinate system (EPSG:28992) this
import * as d3 from 'd3'
import ch from '../services/choropleth-d3'

const width = 600
const height = 600

console.log('Hello something is working i presume?!')

export default {
  props: [
    'geojson'
  ],
  methods: {
    // check that we can ensure the DOM is ready
    created () {
      console.log('Choropleth2 is active')
    },
    mounted () {
      // assumes v-if is used to only mount when geojson is available
      console.log('mounted')
    },
    drawMap () {
      console.assert(this.geojson.features, 'GeoJSON data needed for map')

      let svg = d3.select(this.$el).append('svg')
        .attr('width', width)
        .attr('height', height)

      // set up path generator
      let cartesianProjection = ch.generateCartesianProjection(
        width, height, this.geojson
      )
      let colorScale = ch.generateColorScale(this.geojson, d3.interpolateViridis)

      // draw map
      let selection = svg.selectAll('path.borders')
        .data(this.geojson.features, d => d.properties.label)

      let choropleth = ch.baseChoropleth()
        .projection(cartesianProjection)
        .colorScale(colorScale)

      choropleth(selection)
    }
  },
  watch: {
    geojson (to, from) {
      // trigger initial draw only when data is available
      if (to) {
        if (to) {
          this.drawMap()
        }
      }
    }
  }
}
</script>

<style>
path.borders {
  stroke: black;
  stroke-width: 1px;
  /* fill: none */
}
</style>
