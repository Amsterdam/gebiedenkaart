import geojsonExtent from '@mapbox/geojson-extent'
import * as d3 from 'd3'

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

// Generate a color scale
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

// See: https://bost.ocks.org/mike/chart/ for this style of reusable charts
function baseChoropleth () {
  let width = 600 // consider getting this from the SVG element properties
  let height = 600
  let projection = null // should be d3 projection
  let label = null // should be accessor function
  // See: https://github.com/d3/d3-scale-chromatic
  let interpolator = null // should be a d3 color interpolator from d3-chromatic
  let data = null // should be array of two-element arrays (label, value)
  let label2value = null

  function my (selection) {
    // are the properties we need set?
    console.assert(label !== null, 'Provide an accessor function for the field containing the geometry label.')
    console.assert(interpolator !== null, 'Provide an d3-chromatic interpolator function.')
    console.assert(data !== null, 'Provide data to color code')
    console.assert(projection !== null, 'We need projection')

    // d3 drawing stuff
    let pathGenerator = d3.geoPath()
      .projection(projection)
    let colorScale = d3.scaleSequential(interpolator)
      // .domain(d3.extent(data, d => d[1]))
      .domain([0, 20])

    // consider removing the old chart first (TBD / TODO)
    // debugger
    selection.enter().append('path')
      .attr('fill', function (d) {
        // label(d) -> extract label from geojson feature
        // label2value(label) -> find value for given feature
        // colorScale(value) -> get a color we can use for the fill attribute of path elements
        let value = label2value.get(label(d))
        console.log('Label, value, color', label(d), value, colorScale(value))
        return colorScale(value)
      })
      .attr('stroke', 'black')
      .attr('d', pathGenerator)
  }

  // getters and setters for various parameters
  my.width = function (value) {
    if (arguments.length) {
      width = value
      return my
    } else {
      return width
    }
  }

  my.height = function (value) {
    if (arguments.length) {
      height = value
      return my
    } else {
      return height
    }
  }

  my.label = function (value) {
    console.log('LABEL ACCESSOR SHOULD BE SET')
    if (arguments.length) {
      label = value
      console.log('ARGHHH', label)
      return my
    } else {
      return label
    }
  }

  my.projection = function (value) {
    if (arguments.length) {
      projection = value
      return my
    } else {
      return projection
    }
  }

  my.interpolator = function (value) {
    if (arguments.length) {
      interpolator = value
      return my
    } else {
      return interpolator
    }
  }

  my.data = function (value) {
    if (arguments.length) {
      data = value
      label2value = new Map(data)
      return my
    } else {
      return data
    }
  }

  return my
}

export default {
  baseChoropleth,
  generateCartesianProjection,
  generateColorScale
}
