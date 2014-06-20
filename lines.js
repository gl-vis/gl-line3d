"use strict"

var createBuffer = require("gl-buffer")
var createVAO = require("gl-vao")
var glslify = require("glslify")

var createShader = glslify({
  vert: "./shaders/vertex.glsl",
  frag: "./shaders/fragment.glsl"
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
  return Math.sqrt(d)
}

function LinePlot(gl, shader, buffer, vao) {
  this.gl = gl
  this.shader = shader
  this.buffer = buffer
  this.vao = vao
  this.vertexCount = 0
  this.bounds = [[0,0,0],[0,0,0]]
}

var proto = LinePlot.prototype

proto.draw = function(camera) {
  var gl = this.gl
  var shader = this.shader
  var vao = this.vao
  shader.bind()
  shader.uniforms = {
    model: camera.model || identity,
    view: camera.view || identity,
    projection: camera.projection || identity
  }
  vao.bind()
  vao.draw(gl.LINES, this.vertexCount)
}

proto.update = function(options) {
  var positions = options.position || options.positions
  if(!positions) {
    return
  }
  
  //Recalculate buffer data
  var buffer = []
  var arcLength = 0.0
  var bounds = [[ Infinity, Infinity, Infinity],
                [-Infinity,-Infinity,-Infinity]]
  for(var i=1; i<positions.length; ++i) {
    var a = positions[i-1]
    var b = positions[i]
    for(var j=0; j<3; ++j) {
      bounds[0][j] = Math.min(bounds[0][j], a[j], b[j])
      bounds[1][j] = Math.max(bounds[1][j], a[j], b[j])
    }
    var t0 = arcLength
    arcLength += distance(a, b)
    buffer.push(a[0], a[1], a[2], t0, 
                b[0], b[1], b[2], arcLength)
  }
  this.buffer.update(buffer)
  this.bounds = bounds
}

proto.dispose = function() {
  this.shader.dispose()
  this.vao.dispose()
  this.buffer.dispose()
}

function createLinePlot(gl, options) {
  var shader = createShader(gl)
  shader.attributes.position.location = 0
  shader.attributes.arcLength.location = 1

  var buffer = createBuffer(gl)
  var vao = createVAO(gl, [
      {
        "buffer": buffer,
        "size": 3,
        "offset": 0,
        "stride": 16
      },
      { 
        "buffer": buffer,
        "size": 1,
        "offset": 12,
        "stride": 16
      }
    ])

  var linePlot = new LinePlot(gl, buffer, vao)
  linePlot.update(options)

  return LinePlot
}