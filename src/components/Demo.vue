<template>
  <div class="container-fluid">
    <h3>D3 + Vue choropleth demo Amsterdam.</h3>
    <choropleth :geojson="geojson" :data="data"></choropleth>
  </div>
</template>

<script>
import util from '../services/util'
// import geojsonExtent from '@mapbox/geojson-extent'
import Choropleth from './Choropleth2'
import Vue from 'vue'

export default {
  data () {
    return {
      geojson: null,
      data: null
    }
  },
  async mounted () {
    /* let geojson = await this.loadWFS() */
    console.log('Loading map data')
    let geojson = await this.loadGeoJSON()
    console.log(geojson)
    this.geojson = geojson

    console.log('Loading BBGA numbers')
    let bbga = await this.loadBBGANumbers('BEVSUR_P', 2017)
    console.log(bbga)
    this.data = bbga

    console.log('now do the map thing')
  },
  components: {
    'choropleth': Choropleth
  },
  methods: {
    async loadGeoJSON () {
      const url = 'https://api.data.amsterdam.nl/gebieden/buurt/'
      let results = await util.readPaginatedData(
        url,
        {},
        util.getPaginatedData,
        util.getNextPageHAL
      )

      // results = results.slice(0, 2) // for debugging, speeds up downloads

      let promisedFeatures = results.map(
        d => this.extractFeature(d._links.self.href)
      )

      let awaitedFeatures = await Promise.all(promisedFeatures)

      let geojson = {
        type: 'FeatureCollection',
        features: awaitedFeatures
      }

      return geojson
    },
    async extractFeature (url) {
      let results = await util.readData(url)
      let tmp = {
        type: 'Feature',
        properties: {
          vollcode: results.volledige_code
        },
        geometry: results.geometrie
      }
      return tmp
    },
    async loadBBGANumbers (variable, year) {
      const url = `https://api.data.amsterdam.nl/bbga/cijfers/?variabele=${variable}&jaar=${year}`
      let data = await util.readPaginatedData(
        url,
        {},
        util.getPaginatedData,
        util.getNextPageHAL
      )

      let kvs = data.map(
        d => [d.gebiedcode15, d.waarde]
      )
      return kvs
    },
    async loadWFS () {
      let url = `https://map.data.amsterdam.nl/maps/gebieden?request=getfeature&version=1.1.0&service=wfs&outputformat=geojson&typename=buurt`
      let response = await Vue.axios.get(url)
      for (let feature of response.data.features) {
        feature.properties.vollcode = feature.properties.code
      }

      return response.data
    }
  }
}
</script>

<style>

</style>
