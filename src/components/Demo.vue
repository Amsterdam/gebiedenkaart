<template>
  <div class="container-fluid">
    <h3>D3 + Vue choropleth demo Amsterdam.</h3>
    <choropleth :geojson="geojson"></choropleth>
  </div>
</template>

<script>
import geojsonHelpers from '../services/geojson-helpers'
import Choropleth from './Choropleth2'

export default {
  data () {
    return {
      geojson: null
    }
  },
  async mounted () {
    // Below you can choose from 'buurt', 'wijk', 'gebiedsgerichtwerken', 'stadsdeel'
    let geojson = await geojsonHelpers.loadGeoJSONFromWFS('buurt')
    // It is also possible to use the gebieden API to retrieve geometry, uncomment next line:
    /* let geojson = await geojsonHelpers.loadGeoJSONFromAPI('stadsdeel') */
    let bbga = await geojsonHelpers.loadBBGANumbers('BEVSUR_P', 2017)
    geojsonHelpers.addDataToGeoJSON(geojson, {data: bbga})

    console.log('Data is complete', geojson)
    this.geojson = geojson
  },
  components: {
    'choropleth': Choropleth
  }
}
</script>

<style>
</style>
