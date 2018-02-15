import Vue from 'vue'

// Helper function to access next link (used with readData)
const getNoNext = r => null
const getNextPage = r => r.data.next
const getNextPageHAL = r => r.data._links.next.href

const getNormalData = r => r.data
const getPaginatedData = r => r.data.results
const getGeoJSONData = r => r.data.results.features

// Access paginated resource
async function readPaginatedData (
  url,
  headers = {},
  getData = r => getPaginatedData,
  getNext = r => getNextPage
) {
  let next = url
  let results = []
  while (next) {
    try {
      let response = await Vue.axios.get(next, { headers })
      next = getNext(response)
      results = results.concat(getData(response))
    } catch (e) {
      console.error('Request failed', e)
      next = null
    }
  }
  return results
}

function resultsAsGeoJSON (features) {
  return {
    type: 'FeatureCollection',
    features
  }
}

async function readData (url) {
  let response = await Vue.axios.get(url)
  return response.data
}

export default {
  readPaginatedData,
  readData,
  resultsAsGeoJSON,
  // helper functions:
  getNoNext,
  getNextPage,
  getNextPageHAL,
  getNormalData,
  getPaginatedData,
  getGeoJSONData
}
