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
  vec4 pp = projection * view * model * vec4(p, 1.0);
  return pp.xyz / max(pp.w, 0.0001);
}

void main() {
  vec3 startPoint = project(position);
  vec3 endPoint   = project(nextPosition);

  float clipAngle = atan(
    (endPoint.y - startPoint.y) * screenShape.y,
    (endPoint.x - startPoint.x) * screenShape.x
  );

  vec2 offset = 0.5 * pixelRatio * lineWidth * vec2(
    sin(clipAngle),
    -cos(clipAngle)
  ) / screenShape;

  gl_Position = vec4(startPoint.xy + offset, startPoint.z, 1.0);

  worldPosition = position;
  pixelArcLength = arcLength;
  fragColor = color;
}
