'use strict'

module.exports = createLinePlot

var createBuffer  = require('gl-buffer')
var createVAO     = require('gl-vao')
var createTexture = require('gl-texture2d')
var glslify       = require('glslify')
var unpackFloat   = require('glsl-read-float')
var bsearch       = require('binary-search-bounds')
var ndarray       = require('ndarray')

var createShader = glslify({
  vert: './shaders/vertex.glsl',
  frag: './shaders/fragment.glsl'
})

var createPickShader = glslify({
  vert: './shaders/vertex.glsl',
  frag: './shaders/pick.glsl'
})

var identity = [1,0,0,0,
                0,1,0,0,
                0,0,1,0,
                0,0,0,1]

function distance(a, b) {
  var s = 0.0
  for(var i=0; i<3; ++i) {
    var d = a[i] - b[i]
    s += d*d
  }
  return Math.sqrt(s)
}

function filterClipBounds(bounds) {
  var result = [[-1e6,-1e6,-1e6], [1e6,1e6,1e6]]
  for(var i=0; i<3; ++i) {
    result[0][i] = Math.max(bounds[0][i], result[0][i])
    result[1][i] = Math.min(bounds[1][i], result[1][i])
  }
  return result
}

function PickResult(tau, position) {
  this.arcLength = tau
  this.position = position
}

function LinePlot(gl, shader, pickShader, buffer, vao, texture) {
  this.gl           = gl
  this.shader       = shader
  this.pickShader   = pickShader
  this.buffer       = buffer
  this.vao          = vao
  this.clipBounds   = [[-Infinity,-Infinity,-Infinity], 
                       [ Infinity, Infinity, Infinity]]
  this.points       = []
  this.arcLength    = []
  this.vertexCount  = 0
  this.bounds       = [[0,0,0],[0,0,0]]
  this.pickId       = 0
  this.lineWidth    = 1
  this.texture      = texture
  this.dashScale    = 1
}

var proto = LinePlot.prototype

proto.draw = function(camera) {
  var gl      = this.gl
  var shader  = this.shader
  var vao     = this.vao
  gl.lineWidth(this.lineWidth)
  shader.bind()
  shader.uniforms = {
    model:        camera.model      || identity,
    view:         camera.view       || identity,
    projection:   camera.projection || identity,
    clipBounds:   filterClipBounds(this.clipBounds),
    dashTexture:  this.texture.bind(),
    dashScale:    this.dashScale / this.arcLength[this.arcLength.length-1]
  }
  vao.bind()
  vao.draw(gl.LINES, this.vertexCount)
}

proto.drawPick = function(camera) {
  var gl      = this.gl
  var shader  = this.pickShader
  var vao     = this.vao
  gl.lineWidth(this.lineWidth)
  shader.bind()
  shader.uniforms = {
    model:      camera.model      || identity,
    view:       camera.view       || identity,
    projection: camera.projection || identity,
    pickId:     this.pickId,
    clipBounds: filterClipBounds(this.clipBounds)
  }
  vao.bind()
  vao.draw(gl.LINES, this.vertexCount)
}

proto.update = function(options) {
  if("pickId" in options) {
    this.pickId = options.pickId
  }
  if("lineWidth" in options) {
    this.lineWidth = options.lineWidth
  }
  if("dashScale" in options) {
    this.dashScale = options.dashScale
  }

  var positions = options.position || options.positions
  if(!positions) {
    return
  }
  
  //Default color
  var colors = options.color || options.colors || [0,0,0]

  //Recalculate buffer data
  var buffer = []
  var arcLengthArray = []
  var pointArray = []
  var arcLength = 0.0
  var vertexCount = 0
  var bounds = [[ Infinity, Infinity, Infinity],
                [-Infinity,-Infinity,-Infinity]]
  for(var i=1; i<positions.length; ++i) {
    var a = positions[i-1]
    var b = positions[i]

    arcLengthArray.push(arcLength)
    pointArray.push(a.slice())

    for(var j=0; j<3; ++j) {
      bounds[0][j] = Math.min(bounds[0][j], a[j], b[j])
      bounds[1][j] = Math.max(bounds[1][j], a[j], b[j])
    }

    var acolor, bcolor
    if(Array.isArray(colors[0])) {
      acolor = colors[i-1]
      bcolor = colors[i]
    } else {
      acolor = bcolor = colors
    }

    var t0 = arcLength
    arcLength += distance(a, b)
    buffer.push(a[0], a[1], a[2], t0,        acolor[0], acolor[1], acolor[2],
                b[0], b[1], b[2], arcLength, bcolor[0], bcolor[1], bcolor[2])

    vertexCount += 2
  }
  this.buffer.update(buffer)

  arcLengthArray.push(arcLength)
  pointArray.push(positions[positions.length-1].slice())

  this.bounds = bounds

  this.vertexCount = vertexCount

  this.points = pointArray
  this.arcLength = arcLengthArray

  if('dashes' in options) {
    var dashArray = options.dashes

    //Calculate prefix sum
    var prefixSum = dashArray.slice()
    prefixSum.unshift(0)
    for(var i=1; i<prefixSum.length; ++i) {
      prefixSum[i] = prefixSum[i-1] + prefixSum[i]
    }

    var dashTexture = ndarray(new Array(256*4), [256, 1, 4])
    for(var i=0; i<256; ++i) {
      for(var j=0; j<4; ++j) {
        dashTexture.set(i,0,j, 0)
      }
      if(bsearch.le(prefixSum, prefixSum[prefixSum.length-1]*i/255.0) & 1) {
        dashTexture.set(i,0,0, 0)
      } else {
        dashTexture.set(i,0,0, 255)
      }
    }

    this.texture.setPixels(dashTexture)
  }
}

proto.dispose = function() {
  this.shader.dispose()
  this.vao.dispose()
  this.buffer.dispose()
}

proto.pick = function(selection) {
  if(!selection) {
    return null
  }
  if(selection.id !== this.pickId) {
    return null
  }
  var tau = unpackFloat(
    selection.value[0],
    selection.value[1],
    selection.value[2],
    0)
  var index = bsearch.le(this.arcLength, tau)
  if(index < 0) {
    return null
  }
  if(index === this.arcLength.length-1) {
    return new PickResult(
      this.arcLength[this.arcLength.length-1], 
      this.points[this.points.length-1].slice())
  }
  var a = this.points[index]
  var b = this.points[index+1]
  var t = (tau - this.arcLength[index]) / (this.arcLength[index+1] - this.arcLength[index])
  var ti = 1.0 - t
  var x = [0,0,0]
  for(var i=0; i<3; ++i) {
    x[i] = ti * a[i] + t * b[i]
  }
  return new PickResult(tau, x)
}

function createLinePlot(gl, options) {
  var shader = createShader(gl)
  shader.attributes.position.location   = 0
  shader.attributes.arcLength.location  = 1
  shader.attributes.color.location      = 2

  var pickShader = createPickShader(gl)
  pickShader.attributes.position.location   = 0
  pickShader.attributes.arcLength.location  = 1
  pickShader.attributes.color.location      = 2

  var buffer = createBuffer(gl)
  var vao = createVAO(gl, [
      {
        'buffer': buffer,
        'size': 3,
        'offset': 0,
        'stride': 28
      },
      { 
        'buffer': buffer,
        'size': 1,
        'offset': 12,
        'stride': 28
      },
      {
        'buffer': buffer,
        'size': 3,
        'offset': 16,
        'stride': 28
      }
    ])

  //Create texture for dash pattern
  var defaultTexture = ndarray(new Array(256*4), [256,1,4])
  for(var i=0; i<256*4; ++i) {
    defaultTexture.data[i] = 255
  }
  var texture = createTexture(gl, defaultTexture)
  texture.wrap = gl.REPEAT

  var linePlot = new LinePlot(gl, shader, pickShader, buffer, vao, texture)
  linePlot.update(options)
  return linePlot
}