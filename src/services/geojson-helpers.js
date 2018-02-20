import util from './util'
import Vue from 'vue'
import * as d3 from 'd3'

function remapGeoJSONLabel (geojson, labelProperty) {
  // overwrite all properties of a GeoJSON, keep only the area label and call it label
  debugger
  geojson = geojson.map(
    function (d) {
      d.properties = {label: d.properties[labelProperty]}
      return d
    }
  )
  debugger
}

function addDataToGeoJSON (geojson, extra) {
  // assumes input geojson with areas that are labeled with a property 'label'
  // assumes extra is an object with
  // 'data' like [[areaLabel, value], ...]
  // 'links' linke [[areaLabel, url], ...]

  if (extra.hasOwnProperty('data')) {
    let dataMap = new Map(extra.data)
    geojson.features = geojson.features.map(
      function (feature) {
        feature.properties.value = dataMap.get(feature.properties.label)
        return feature
      }
    )
  }
  if (extra.hasOwnProperty('links')) {
    let dataMap = new Map(extra.links)
    geojson.features = geojson.features.map(
      function (feature) {
        feature.properties.link = dataMap.get(feature.properties.label)
        return feature
      }
    )
  }
  return geojson
}

// Functions that deal with the Datapunt gebieden API and corresponding WFS services.

const LABEL_PROPERTIES = new Map([
  ['buurt', 'volledige_code'],
  ['wijk', 'volledige_code'],
  ['stadsdeel', 'code'],
  ['gebiedsgerichtwerken', 'code']
])

async function loadGeoJSONFromAPI (areaType) {
  // Uses gebieden API (is slow compared to accessing WFS service).
  // first find all the detail pages for each area in the data set
  console.assert(LABEL_PROPERTIES.has(areaType), 'Area type unknown.')
  const url = `https://api.data.amsterdam.nl/gebieden/${areaType}/`
  let results = await util.readPaginatedData(
    url,
    {},
    util.getPaginatedData,
    util.getNextPageHAL
  )

  // results = results.slice(0, 2) // for debugging, speeds up downloads
  // Download a feature for each area, set its 'label' property.
  let labelProperty = LABEL_PROPERTIES.get(areaType)
  let promisedFeatures = results.map(
    d => extractFeature(d._links.self.href, labelProperty)
  )

  let awaitedFeatures = await Promise.all(promisedFeatures)

  let geojson = {
    type: 'FeatureCollection',
    features: awaitedFeatures
  }

  return geojson
}

async function extractFeature (url, labelProperty) {
  // Uses gebieden API.
  // Extract a GeoJSON feature from area detail page.
  let results = await util.readData(url)
  let feature = {
    type: 'Feature',
    properties: {
      label: results[labelProperty]
    },
    geometry: results.geometrie
  }
  return feature
}

// WFS handling (needs extra hardcoded code mapping because of inconsistency between gebieden
// API, BBGA API and gebieden WFS)

async function loadGeoJSONFromWFS (areaType) {
  if (areaType === 'wijk') {
    areaType = 'buurtcombinatie'
  }
  let url = `https://map.data.amsterdam.nl/maps/gebieden?request=getfeature&version=1.1.0&service=wfs&outputformat=geojson&typename=${areaType}`
  let response = await Vue.axios.get(url)

  // naming is inconsistent with BBGA, hence:
  const areaCodes = await loadExtraCodeMapping()
  let features = null

  if (areaType === 'buurt') {
    let mapping = new Map(areaCodes.map(
      d => [d.BRT_VOLLCODE.slice(1), d.BRT_VOLLCODE]
    ))

    features = response.data.features.map(
      function (feature) {
        return {
          type: 'Feature',
          properties: {
            label: mapping.get(feature.properties.code)
          },
          geometry: feature.geometry
        }
      }
    )
  } else if (areaType === 'buurtcombinatie') {
    features = response.data.features.map(
      function (feature) {
        return {
          type: 'Feature',
          properties: {
            label: feature.properties.vollcode
          },
          geometry: feature.geometry
        }
      }
    )
  } else if (areaType === 'stadsdeel') {
    features = response.data.features.map(
      function (feature) {
        return {
          type: 'Feature',
          properties: {
            label: feature.properties.code
          },
          geometry: feature.geometry
        }
      }
    )
  } else if (areaType === 'gebiedsgerichtwerken') {
    features = response.data.features.map(
      function (feature) {
        return {
          type: 'Feature',
          properties: {
            label: feature.properties.code
          },
          geometry: feature.geometry
        }
      }
    )
  }
  return {
    type: 'FeatureCollection',
    features: features
  }
}

async function loadExtraCodeMapping () {
  let url = '/static/brt-bce-sdl-ggw.csv' // provided by Rob K.
  let response = await Vue.axios.get(url)
  let customFormat = d3.dsvFormat(';')

  return customFormat.parse(response.data)
}

// Functions that deal with BBGA data
async function loadBBGANumbers (variable, year) {
  // TODO: download pages in parallel (access count on first page, construct all URLs, download in parallel)
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
}

export default {
  addDataToGeoJSON,
  remapGeoJSONLabel,
  loadGeoJSONFromAPI,
  loadGeoJSONFromWFS,
  loadBBGANumbers,
  loadExtraCodeMapping
}
