precision mediump float;

uniform vec3      clipBounds[2];
uniform sampler2D dashTexture;
uniform float     dashScale;

varying vec3    worldPosition;
varying float   pixelArcLength;
varying vec3    fragColor;

void main() {
  if(any(lessThan(worldPosition, clipBounds[0])) || any(greaterThan(worldPosition, clipBounds[1]))) {
    discard;
  }
  float dashWeight = texture2D(dashTexture, vec2(dashScale * pixelArcLength, 0)).r;
  if(dashWeight < 0.5) {
    discard;
  }
  gl_FragColor = vec4(fragColor, 1);
}