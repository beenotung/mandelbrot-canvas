import { state, getMaxI, getZoomRate, updateIterationsForZoom, ColorTheme } from './storage.js'

// Console debugging functions (equivalent to original version)
const cli = {
  // View controls
  restart: () => {
    state.offsetX = -0.5
    state.offsetY = 0
    state.zoomExp = -0.5
    // Trigger UI update and render
    ;(window as any).updateDisplays()
    ;(window as any).render()
  },

  clear: () => {
    // Reset to initial state
    state.offsetX = 0
    state.offsetY = 0
    state.zoomExp = 0
    state.manualMaxI = 1024
    state.autoAdjustIterations = true
    state.isShowLine = false
    state.colorTheme = 0
    ;(window as any).updateDisplays()
    ;(window as any).render()
  },

  // Parameter controls
  setMaxI: (iterations: number) => {
    state.manualMaxI = Math.max(2, iterations)
    ;(window as any).updateDisplays()
    ;(window as any).render()
  },

  setLine: (show: boolean) => {
    state.isShowLine = show
    ;(window as any).render()
  },

  setColor: (themeIndex: number) => {
    state.colorTheme = Math.max(0, Math.min(8, themeIndex)) as ColorTheme
    ;(window as any).updateDisplays()
    ;(window as any).render()
  },

  // State persistence
  save: () => {
    localStorage.setItem('mandelbrot-offsetX', String(state.offsetX))
    localStorage.setItem('mandelbrot-offsetY', String(state.offsetY))
    localStorage.setItem('mandelbrot-zoomExp', String(state.zoomExp))
    localStorage.setItem('mandelbrot-maxI', String(state.manualMaxI))
    localStorage.setItem('mandelbrot-autoAdjust', String(state.autoAdjustIterations))
    localStorage.setItem('mandelbrot-showLines', String(state.isShowLine))
    localStorage.setItem('mandelbrot-colorTheme', String(state.colorTheme))
    console.log('Mandelbrot state saved')
  },

  load: () => {
    state.offsetX = parseFloat(localStorage.getItem('mandelbrot-offsetX') || '0')
    state.offsetY = parseFloat(localStorage.getItem('mandelbrot-offsetY') || '0')
    state.zoomExp = parseFloat(localStorage.getItem('mandelbrot-zoomExp') || '0')
    state.manualMaxI = parseInt(localStorage.getItem('mandelbrot-maxI') || '1024')
    state.autoAdjustIterations = localStorage.getItem('mandelbrot-autoAdjust') === 'true'
    state.isShowLine = localStorage.getItem('mandelbrot-showLines') === 'true'
    state.colorTheme = (parseInt(localStorage.getItem('mandelbrot-colorTheme') || '0') as ColorTheme)
    ;(window as any).updateDisplays()
    ;(window as any).render()
    console.log('Mandelbrot state loaded')
  },

  // Info functions
  getState: () => ({
    offsetX: state.offsetX,
    offsetY: state.offsetY,
    zoomExp: state.zoomExp,
    manualMaxI: state.manualMaxI,
    autoAdjustIterations: state.autoAdjustIterations,
    isShowLine: state.isShowLine,
    colorTheme: state.colorTheme,
    zoomRate: getZoomRate(),
    maxIterations: getMaxI()
  }),

  // Direct render (for debugging)
  render: () => {
    ;(window as any).render()
  }
}

// Expose to global scope
Object.assign(window, cli)

export default cli
