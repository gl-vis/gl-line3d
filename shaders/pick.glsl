precision highp float;

#pragma glslify: packFloat = require(glsl-read-float)

uniform float pickId;

varying vec3 worldPosition;
varying float pixelArcLength;
varying vec3 fragColor;

void main() {
  gl_FragColor = vec4(pickId, packFloat(pixelArcLength).xyz);
}