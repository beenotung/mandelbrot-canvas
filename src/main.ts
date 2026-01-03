console.log('git repo: https://github.com/beenotung/mandelbrot-canvas')

import { gl, w, h } from './webgl.js'
import * as webgl from './webgl.js'
import './cli.js'

import {
  state,
  getMaxI,
  getZoomRate,
  updateIterationsForZoom,
  ColorTheme,
} from './storage.js'

import {
  updateDisplays,
  initUIControls,
  setupEventListeners,
  setNextEpochCallback,
  dom,
} from './ui.js'

// Progressive rendering state
let epoch = 0
let isStop = false

type C = [real: number, imaginary: number]

// Interaction state for progressive rendering
let pending: {
  offsetX: number
  offsetY: number
  zoomExp: number
} | null = null

// Progressive rendering function
function nextEpoch() {
  epoch++
  if (pending) {
    state.offsetX = pending.offsetX
    state.offsetY = pending.offsetY
    state.zoomExp = pending.zoomExp
    pending = null
  }
  render()
}

// Pass nextEpoch to UI handlers
setNextEpochCallback(nextEpoch)

// Render function - WebGL does all the computation in parallel
function render() {
  if (isStop) return

  // Update uniforms
  gl.uniform2f(webgl.offsetUniformLocation, state.offsetX, state.offsetY)
  gl.uniform1f(webgl.zoomUniformLocation, getZoomRate())
  gl.uniform1i(webgl.maxIterationsUniformLocation, getMaxI())
  gl.uniform1i(webgl.showLinesUniformLocation, state.isShowLine ? 1 : 0)
  gl.uniform1i(webgl.colorThemeUniformLocation, state.colorTheme)

  // Clear and draw
  gl.clear(gl.COLOR_BUFFER_BIT)
  if (webgl.vaoExt) webgl.vaoExt.bindVertexArrayOES(webgl.vao)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

  updateDisplays()
}

// Mouse/touch interaction
gl.canvas.addEventListener('wheel', event => {
  event.preventDefault()
  let wheelEvent = event as WheelEvent
  let zoomFactor = Math.pow(1.1, wheelEvent.deltaY > 0 ? -1 : 1)
  let zoomChange = Math.log10(zoomFactor)
  state.zoomExp += zoomChange
  if (state.autoAdjustIterations) {
    updateIterationsForZoom(zoomChange)
  }
  nextEpoch()
})

// Convert screen coordinates to mathematical coordinates (matches shader)
function screenToMath(x: number, y: number): { mathX: number; mathY: number } {
  // x, y are screen coordinates relative to canvas top-left (0,0 to w,h)
  let uvX = x / w // 0 to 1
  let uvY = y / h // 0 to 1

  let centered_uvX = uvX - 0.5 // -0.5 to 0.5
  let centered_uvY = uvY - 0.5 // -0.5 to 0.5

  // Apply aspect ratio correction (exact same as shader for 1:1 pixels)
  let aspect = w / h
  if (aspect > 1.0) {
    // Wide canvas: stretch X to match Y's scale
    centered_uvX *= aspect
  } else {
    // Tall canvas: stretch Y to match X's scale
    centered_uvY /= aspect
  }

  // Convert to mathematical coordinates (same formula as shader)
  let zoomRate = getZoomRate()
  let mathX = centered_uvX / zoomRate + state.offsetX
  let mathY = -centered_uvY / zoomRate + state.offsetY // Flip Y for math coordinates

  return { mathX, mathY }
}

gl.canvas.addEventListener('click', event => {
  let mouseEvent = event as MouseEvent
  let htmlCanvas = gl.canvas as HTMLCanvasElement

  // Get click position relative to canvas
  let screenX = mouseEvent.clientX - htmlCanvas.offsetLeft
  let screenY = mouseEvent.clientY - htmlCanvas.offsetTop

  // Convert to mathematical coordinates
  let { mathX, mathY } = screenToMath(screenX, screenY)

  // Center the view on the clicked mathematical point
  pending = {
    offsetX: mathX,
    offsetY: mathY,
    zoomExp: state.zoomExp,
  }
  nextEpoch()
})

// Keyboard controls for accessibility
document.addEventListener('keydown', event => {
  // Don't handle panning keys when form elements are focused
  let activeElement = document.activeElement
  if (
    activeElement &&
    (activeElement.tagName === 'SELECT' || activeElement.tagName === 'INPUT')
  ) {
    return // Let browser handle form navigation
  }

  let panAmount = getZoomRate() * 0.02 // Even smaller pan amount for precise control

  switch (event.key) {
    case 'ArrowLeft':
      state.offsetX -= panAmount
      nextEpoch()
      break
    case 'ArrowRight':
      state.offsetX += panAmount
      nextEpoch()
      break
    case 'ArrowUp':
      state.offsetY += panAmount
      nextEpoch()
      break
    case 'ArrowDown':
      state.offsetY -= panAmount
      nextEpoch()
      break
    case '+':
    case '=':
      state.zoomExp += 0.05 // Zoom out (increase exponent)
      if (state.autoAdjustIterations) {
        updateIterationsForZoom(0.05)
      }
      nextEpoch()
      break
    case '-':
      state.zoomExp -= 0.05 // Zoom in (decrease exponent)
      if (state.autoAdjustIterations) {
        updateIterationsForZoom(-0.05)
      }
      nextEpoch()
      break
    case '[':
      // Decrease iterations by half
      let newValueMin = Math.max(2, Math.floor(state.manualMaxI / 2))
      state.manualMaxI = newValueMin
      nextEpoch()
      break
    case ']':
      // Increase iterations by double
      let newValueMax = Math.floor(state.manualMaxI * 2)
      state.manualMaxI = Math.max(2, newValueMax)
      nextEpoch()
      break
  }
})

// Initialize everything
initUIControls()
setupEventListeners()
updateDisplays()

// Expose functions for CLI debugging
;(window as any).updateDisplays = updateDisplays
;(window as any).render = render

// Initial render
render()
