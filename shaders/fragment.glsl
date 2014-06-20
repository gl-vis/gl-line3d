precision highp float;

varying vec3 worldPosition;
varying float pixelArcLength;

void main() {
  gl_FragColor = vec4(1,pixelArcLength,0,1);
}