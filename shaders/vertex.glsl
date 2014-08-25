precision mediump float;

attribute vec3 position;
attribute float arcLength;
attribute vec4 color;

uniform mat4 model, view, projection;

varying vec4 fragColor;
varying vec3 worldPosition;
varying float pixelArcLength;

void main() {
  vec4 worldCoordinate = model * vec4(position, 1);
  gl_Position = projection * view * worldCoordinate;
  worldPosition = position;
  pixelArcLength = arcLength;
  fragColor = color;
}