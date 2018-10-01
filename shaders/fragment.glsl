precision mediump float;

uniform vec3      clipBounds[2];
uniform sampler2D dashTexture;
uniform float     dashScale;
uniform float     opacity;

varying vec3    worldPosition;
varying float   pixelArcLength;
varying vec4    fragColor;

bool outOfRange(float a, float b, float p) {
  if (p > max(a, b)) return true;
  if (p < min(a, b)) return true;
  return false;
}

void main() {
  if (outOfRange(clipBounds[0].x, clipBounds[1].x, worldPosition.x)) discard;
  if (outOfRange(clipBounds[0].y, clipBounds[1].y, worldPosition.y)) discard;
  if (outOfRange(clipBounds[0].z, clipBounds[1].z, worldPosition.z)) discard;

  float dashWeight = texture2D(dashTexture, vec2(dashScale * pixelArcLength, 0)).r;
  if(dashWeight < 0.5) {
    discard;
  }
  gl_FragColor = fragColor * opacity;
}
