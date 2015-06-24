var glslify       = require('glslify')
var createShader  = require('gl-shader')

var vertSrc = glslify('../shaders/vertex.glsl')
var forwardFrag = glslify('../shaders/fragment.glsl')
var pickFrag = glslify('../shaders/pick.glsl')

exports.createShader = function(gl) {
  return createShader(gl, vertSrc, forwardFrag)
}

exports.createPickShader = function(gl) {
  return createShader(gl, vertSrc, pickFrag)
}
