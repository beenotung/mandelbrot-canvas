export let { random, floor, min, max, sqrt, pow, exp, E, log } = Math

export let R = 0
export let G = 1
export let B = 2
export let A = 3

export let canvas = document.getElementById('main') as HTMLCanvasElement
export let rect = canvas.getBoundingClientRect()

export let scale = 1
export let w = floor(rect.width / scale)
export let h = floor(rect.height / scale)

canvas.width = w
canvas.height = h

// Initialize WebGL context
export let gl =
  canvas.getContext('webgl') ||
  (canvas.getContext('experimental-webgl') as WebGLRenderingContext)
if (!gl) {
  throw new Error('WebGL not supported')
}

// Enable necessary extensions
gl.getExtension('OES_standard_derivatives')
export let vaoExt = gl.getExtension('OES_vertex_array_object')
if (!vaoExt) {
  throw new Error('OES_vertex_array_object extension not supported')
}

// Set up viewport
gl.viewport(0, 0, w, h)
gl.clearColor(0, 0, 0, 1)

// Shader compilation helper
export function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  let shader = gl.createShader(type)
  if (!shader) return null

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compilation error:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }

  return shader
}

// Program creation helper
export function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
): WebGLProgram | null {
  let program = gl.createProgram()
  if (!program) return null

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program linking error:', gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }

  return program
}

// Vertex shader - simple pass-through for full-screen quad
let vertexShaderSource = /* glsl */ `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

// Fragment shader - Mandelbrot computation
let fragmentShaderSource = /* glsl */ `
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_offset;
uniform float u_zoom;
uniform int u_maxIterations;
uniform int u_showLines;
uniform int u_colorTheme;

varying vec2 v_uv;

void main() {
  // Maintain 1:1 X:Y scaling for mathematical accuracy
  vec2 centered_uv = v_uv - 0.5;

  // Adjust for canvas aspect ratio to ensure square mathematical pixels
  float aspect = u_resolution.x / u_resolution.y;
  if (aspect > 1.0) {
    // Wide canvas: scale X to match Y's range
    centered_uv.x *= aspect;
  } else {
    // Tall canvas: scale Y to match X's range
    centered_uv.y /= aspect;
  }

  vec2 c = centered_uv / u_zoom + u_offset;
  vec2 z = vec2(0.0);

  int iterations = 0;
  for (int i = 0; i < 100000; i++) {
    if (i >= u_maxIterations) break;

    float x = z.x * z.x - z.y * z.y + c.x;
    float y = 2.0 * z.x * z.y + c.y;

    if (x * x + y * y > 4.0) break;

    z = vec2(x, y);
    iterations = i + 1;
  }

  float t = float(iterations) / float(u_maxIterations);

  vec3 color;
  if (t >= 1.0) {
    color = vec3(0.0);
  } else {
    if (u_colorTheme == 0) {
      // Original Red theme (red -> yellow -> white)
      if (t <= 1.0/3.0) {
        color = vec3(t * 3.0, 0.0, 0.0);
      } else if (t <= 2.0/3.0) {
        color = vec3(1.0, (t - 1.0/3.0) * 3.0, 0.0);
      } else {
        color = vec3(1.0, 1.0, (t - 2.0/3.0) * 3.0);
      }
    } else if (u_colorTheme == 1) {
      // Vanilla Purple theme - smooth purple gradients
      if (t <= 1.0/3.0) {
        float tt = t * 3.0;
        color = vec3(tt * 0.6, tt * 0.2, tt * 0.8);
      } else if (t <= 2.0/3.0) {
        float tt = (t - 1.0/3.0) * 3.0;
        color = vec3(0.6 + tt * 0.4, 0.2 + tt * 0.3, 0.8 + tt * 0.2);
      } else {
        float tt = (t - 2.0/3.0) * 3.0;
        color = vec3(1.0, 0.5 + tt * 0.5, 1.0);
      }
    } else if (u_colorTheme == 2) {
      // Blue theme - clear gradients
      if (t <= 1.0/3.0) {
        float tt = t * 3.0;
        color = vec3(0.0, tt * 0.4, tt * 0.8);
      } else if (t <= 2.0/3.0) {
        float tt = (t - 1.0/3.0) * 3.0;
        color = vec3(tt * 0.2, 0.4 + tt * 0.3, 0.8 + tt * 0.2);
      } else {
        float tt = (t - 2.0/3.0) * 3.0;
        color = vec3(0.2 + tt * 0.3, 0.7 + tt * 0.3, 1.0);
      }
    } else if (u_colorTheme == 3) {
      // Green theme
      if (t <= 1.0/3.0) {
        float tt = t * 3.0;
        color = vec3(0.0, tt * 0.6, 0.0);
      } else if (t <= 2.0/3.0) {
        float tt = (t - 1.0/3.0) * 3.0;
        color = vec3(tt * 0.4, 0.6 + tt * 0.4, tt * 0.2);
      } else {
        float tt = (t - 2.0/3.0) * 3.0;
        color = vec3(0.4 + tt * 0.6, 1.0, 0.2 + tt * 0.8);
      }
    } else if (u_colorTheme == 4) {
      // Gold theme
      if (t <= 1.0/3.0) {
        float tt = t * 3.0;
        color = vec3(tt * 0.8, tt * 0.4, 0.0);
      } else if (t <= 2.0/3.0) {
        float tt = (t - 1.0/3.0) * 3.0;
        color = vec3(0.8 + tt * 0.2, 0.4 + tt * 0.4, tt * 0.1);
      } else {
        float tt = (t - 2.0/3.0) * 3.0;
        color = vec3(1.0, 0.8 + tt * 0.2, tt * 0.2);
      }
    } else if (u_colorTheme == 5) {
      // Ocean theme - deep blues and teals
      if (t <= 1.0/3.0) {
        float tt = t * 3.0;
        color = vec3(0.0, tt * 0.2, tt * 0.5);
      } else if (t <= 2.0/3.0) {
        float tt = (t - 1.0/3.0) * 3.0;
        color = vec3(tt * 0.1, 0.2 + tt * 0.4, 0.5 + tt * 0.3);
      } else {
        float tt = (t - 2.0/3.0) * 3.0;
        color = vec3(0.1 + tt * 0.3, 0.6 + tt * 0.3, 0.8 + tt * 0.2);
      }
    } else if (u_colorTheme == 6) {
      // Rainbow theme - spectrum colors
      if (t <= 1.0/6.0) {
        float tt = t * 6.0;
        color = vec3(tt, 0.0, 1.0); // Purple to blue
      } else if (t <= 2.0/6.0) {
        float tt = (t - 1.0/6.0) * 6.0;
        color = vec3(1.0, 0.0, 1.0 - tt); // Blue to cyan
      } else if (t <= 3.0/6.0) {
        float tt = (t - 2.0/6.0) * 6.0;
        color = vec3(1.0, tt, 0.0); // Cyan to green
      } else if (t <= 4.0/6.0) {
        float tt = (t - 3.0/6.0) * 6.0;
        color = vec3(1.0 - tt, 1.0, 0.0); // Green to yellow
      } else if (t <= 5.0/6.0) {
        float tt = (t - 4.0/6.0) * 6.0;
        color = vec3(0.0, 1.0, tt); // Yellow to orange
      } else {
        float tt = (t - 5.0/6.0) * 6.0;
        color = vec3(tt, 1.0 - tt * 0.5, 1.0); // Orange to red
      }
    } else if (u_colorTheme == 7) {
      // Fire theme - bright flame colors
      if (t <= 1.0/3.0) {
        float tt = t * 3.0;
        color = vec3(1.0, tt * 0.6, 0.0); // Bright orange
      } else if (t <= 2.0/3.0) {
        float tt = (t - 1.0/3.0) * 3.0;
        color = vec3(1.0, 0.6 + tt * 0.4, tt * 0.8); // Orange to yellow
      } else {
        float tt = (t - 2.0/3.0) * 3.0;
        color = vec3(1.0, 1.0, 0.8 + tt * 0.2); // Yellow to white
      }
    } else {
      // Monochrome theme - greyscale
      float grey = t * 0.8 + 0.2; // From dark to light grey
      color = vec3(grey, grey, grey);
    }
  }

  // Draw center lines if enabled
  if (u_showLines == 1) {
    vec2 center = vec2(0.5, 0.5);
    float lineWidth = 1.0 / max(u_resolution.x, u_resolution.y);
    if (abs(v_uv.x - center.x) < lineWidth || abs(v_uv.y - center.y) < lineWidth) {
      color = vec3(1.0, 0.0, 0.0);
    }
  }

  gl_FragColor = vec4(color, 1.0);
}
`

// Create shader program
let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

if (!vertexShader || !fragmentShader) {
  throw new Error('Failed to create shaders')
}

export let program = createProgram(gl, vertexShader, fragmentShader)
if (!program) {
  throw new Error('Failed to create shader program')
}

// Get attribute and uniform locations
export let positionAttributeLocation = gl.getAttribLocation(
  program,
  'a_position',
)
export let resolutionUniformLocation = gl.getUniformLocation(
  program,
  'u_resolution',
)
export let offsetUniformLocation = gl.getUniformLocation(program, 'u_offset')
export let zoomUniformLocation = gl.getUniformLocation(program, 'u_zoom')
export let maxIterationsUniformLocation = gl.getUniformLocation(
  program,
  'u_maxIterations',
)
export let showLinesUniformLocation = gl.getUniformLocation(
  program,
  'u_showLines',
)
export let colorThemeUniformLocation = gl.getUniformLocation(
  program,
  'u_colorTheme',
)

// Create quad geometry (full-screen)
let positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])

export let positionBuffer = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

// Set up vertex array
export let vao = vaoExt.createVertexArrayOES()
vaoExt.bindVertexArrayOES(vao)
gl.enableVertexAttribArray(positionAttributeLocation)
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)

// Use the shader program
gl.useProgram(program)

// Set resolution uniform
gl.uniform2f(resolutionUniformLocation, w, h)
