precision mediump float;

attribute vec3 position, nextPosition;
attribute float arcLength, lineWidth;
attribute vec4 color;

uniform vec2 screenShape;
uniform float pixelRatio;
uniform mat4 model, view, projection;

varying vec4 fragColor;
varying vec3 worldPosition;
varying float pixelArcLength;

vec3 project(vec3 p) {
  vec4 clip = projection * view * model * vec4(p, 1.0);
  return clip.xyz / clip.w;
}

void main() {
  vec3 p0 = project(position);
  vec3 p1 = project(nextPosition);
  vec2 tangent = normalize(screenShape * (p1.xy - p0.xy));
  vec2 offset = 0.5 * pixelRatio * lineWidth * vec2(tangent.y, -tangent.x) / screenShape;

  gl_Position = vec4(p0.xy + offset, p0.z, 1.0);

  worldPosition = position;
  pixelArcLength = arcLength;
  fragColor = color;
}
