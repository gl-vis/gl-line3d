precision highp float;

uniform vec3 clipBounds[2];

varying vec3 worldPosition;
varying float pixelArcLength;
varying vec3 fragColor;

void main() {
  if(any(lessThan(worldPosition, clipBounds[0])) || any(greaterThan(worldPosition, clipBounds[1]))) {
    discard;
  }
  gl_FragColor = vec4(fragColor, 1);
}