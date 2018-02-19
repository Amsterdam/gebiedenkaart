import geojsonExtent from '@mapbox/geojson-extent'
import * as d3 from 'd3'

// TODO: accept colorscale (domain should be controlled from outside of module)
// TODO: draw a legend

// For RD new coordinates (EPSG:28992) we use a Cartesian projection
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

function generateColorScale (geojson, interpolator) {
  // Assumes the geojson data has a property value that is to be color coded
  let extent = d3.extent(geojson.features, function (feature) {
    return feature.properties.value
  })

  let colorScale = d3.scaleSequential(interpolator)
    .domain(extent)

  return colorScale
}

// See: https://bost.ocks.org/mike/chart/ for this style of reusable charts
function baseChoropleth () {
  let projection = null // should be d3 projection
  // See: https://github.com/d3/d3-scale-chromatic
  let colorScale = function (d) { return 'none' }

  function my (selection) {
    // are the properties we need set?
    console.assert(projection !== null, 'We need projection')

    // d3 drawing stuff
    let pathGenerator = d3.geoPath()
      .projection(projection)

    selection.enter().append('path')
      .attr('fill', d => colorScale(d.properties.value) || 'none') // TODO: check!
      .attr('stroke', 'gray')
      .attr('d', pathGenerator)
  }

  my.projection = function (value) {
    if (arguments.length) {
      projection = value
      return my
    } else {
      return projection
    }
  }

  my.colorScale = function (value) {
    if (arguments.length) {
      colorScale = value
      return my
    } else {
      return colorScale
    }
  }

  return my
}

export default {
  baseChoropleth,
  generateCartesianProjection,
  generateColorScale
}
