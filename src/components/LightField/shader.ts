export const VERTEX = /* glsl */ `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`

/**
 * Two light fields — violet and orange — rendered as a computed field simulation rather
 * than natural smoke. Each field is a smooth anisotropic potential that keeps moving,
 * rotating and stretching; the sum is drawn as a clean synthetic gradient (no smoke,
 * no drawn lines) with animated film grain that also dithers a soft stepping of
 * intensity, and a slow hue drift through the collision zone.
 * Where the fields overlap a third light appears: lavender → magenta → pink → peach.
 */
export const FRAGMENT = /* glsl */ `
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform vec4  uA;       // violet: center.xy, radius, intensity
uniform vec4  uB;       // orange: center.xy, radius, intensity
uniform vec4  uShape;   // rotation A, rotation B, stretch A, stretch B
uniform float uEnergy;
uniform float uPx;      // canvas pixels per CSS pixel
uniform float uGrain;   // grain frame: a steady counter, independent of the light's flow
uniform vec3  uBg;

float field(vec2 p, vec4 f, float ang, float stretch) {
  vec2 d = p - f.xy;
  float c = cos(ang);
  float s = sin(ang);
  d = vec2(c * d.x - s * d.y, s * d.x + c * d.y);
  d.x /= stretch;
  d.y *= stretch;
  d /= f.z;
  return exp(-dot(d, d) * 2.3) * f.w;
}

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

void main() {
  float m = min(uRes.x, uRes.y);
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / m;
  float t = uTime;

  // Smooth, low-frequency deformation — synthetic flow, not turbulence.
  vec2 w = p;
  w += 0.042 * vec2(sin(p.y * 2.6 + t * 0.35), sin(p.x * 2.2 - t * 0.3));
  w += 0.018 * vec2(sin(p.y * 5.1 - t * 0.5 + 1.3), sin(p.x * 4.7 + t * 0.45));

  float fA = field(w, uA, uShape.x, uShape.z);
  float fB = field(w, uB, uShape.y, uShape.w);
  float ov = fA * fB;
  float S = fA + fB + ov * 1.6;

  // Colour: electric violet, magenta, hot pink, orange.
  vec3 violet   = vec3(0.50, 0.24, 1.0);
  vec3 orange   = vec3(1.0, 0.42, 0.16);
  vec3 lavender = vec3(0.72, 0.52, 1.0);
  vec3 magenta  = vec3(0.86, 0.18, 1.0);
  vec3 rose     = vec3(1.0, 0.26, 0.6);
  vec3 peach    = vec3(1.0, 0.62, 0.46);

  float ratio = fB / (fA + fB + 1e-4);
  vec3 blend = mix(lavender, magenta, smoothstep(0.1, 0.38, ratio));
  blend = mix(blend, rose, smoothstep(0.42, 0.66, ratio));
  blend = mix(blend, peach, smoothstep(0.72, 0.95, ratio));
  vec3 tint = (violet * fA + orange * fB + blend * ov * 1.6) / max(S, 1e-4);

  // Film grain: per-pixel noise, re-rolled ~8 times a second. It also dithers a soft
  // quantisation of the intensity, so the light reads as computed, not painted.
  float g = hash12(floor(gl_FragCoord.xy / max(uPx, 1.0)) + uGrain * 17.31);
  float steps = 20.0;
  float I = 1.0 - exp(-S * uEnergy * 1.6);
  I = mix(I, floor(I * steps + g) / steps, 0.5);

  // Collision zone: a slow, soft hue drift along lines of equal path difference
  // (colour only — no drawn lines).
  float rA = length(w - uA.xy);
  float rB = length(w - uB.xy);
  float wave = 0.5 + 0.5 * sin((rA - rB) * 9.0 - t * 0.5);
  float ovMask = smoothstep(0.04, 0.3, ov * uEnergy * 1.4);
  tint = mix(tint, mix(magenta, rose, wave), ovMask * 0.22);

  // Luminous synthetic light over the dark base, with grain strongest in the light.
  vec3 col = uBg + tint * I * 0.95;
  col += (g - 0.5) * (0.012 + 0.045 * I);
  gl_FragColor = vec4(col, 1.0);
}
`
