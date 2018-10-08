precision mediump float;

#pragma glslify: packFloat = require(glsl-read-float)
#pragma glslify: outOfRange = require(./reversed-scenes-out-of-range.glsl)

uniform float pickId;
uniform vec3 clipBounds[2];

varying vec3 worldPosition;
varying float pixelArcLength;
varying vec4 fragColor;

void main() {
  if ((outOfRange(clipBounds[0].x, clipBounds[1].x, worldPosition.x)) ||
      (outOfRange(clipBounds[0].y, clipBounds[1].y, worldPosition.y)) ||
      (outOfRange(clipBounds[0].z, clipBounds[1].z, worldPosition.z))) discard;

  gl_FragColor = vec4(pickId/255.0, packFloat(pixelArcLength).xyz);
}