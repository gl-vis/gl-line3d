precision mediump float;

#pragma glslify: packFloat = require(glsl-read-float)

uniform float pickId;
uniform vec3 clipBounds[2];

varying vec3 worldPosition;
varying float pixelArcLength;
varying vec4 fragColor;

bool outOfRange(float a, float b, float p) {
  if (p > max(a, b)) return true;
  if (p < min(a, b)) return true;
  return false;
}

void main() {
  if (outOfRange(clipBounds[0].x, clipBounds[1].x, worldPosition.x)) discard;
  if (outOfRange(clipBounds[0].y, clipBounds[1].y, worldPosition.y)) discard;
  if (outOfRange(clipBounds[0].z, clipBounds[1].z, worldPosition.z)) discard;

  gl_FragColor = vec4(pickId/255.0, packFloat(pixelArcLength).xyz);
}