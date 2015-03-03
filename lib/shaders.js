var glslify       = require('glslify')
var createShader  = require('gl-shader')

var forward = glslify({
  vert: '../shaders/vertex.glsl',
  frag: '../shaders/fragment.glsl',
  sourceOnly: true
})

var pick = glslify({
  vert: '../shaders/vertex.glsl',
  frag: '../shaders/pick.glsl',
  sourceOnly: true
})

exports.createShader = function(gl) {
  return createShader(gl, forward)
}

exports.createPickShader = function(gl) {
  return createShader(gl, pick)
}