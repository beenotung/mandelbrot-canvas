// Color themes (0 = red, 1 = purple)
export type ColorTheme = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

// State with auto-persistence using Proxy
export type State = {
  offsetX: number
  offsetY: number
  zoomExp: number
  manualMaxI: number
  autoAdjustIterations: boolean
  isShowLine: boolean
  showShortcuts: boolean
  colorTheme: ColorTheme
}

let initialState: State = {
  offsetX: +localStorage.getItem('x')! || -0.5,
  offsetY: +localStorage.getItem('y')! || 0,
  zoomExp: +localStorage.getItem('z')! || 0, // Initial zoomExp for 10^0 = 1.0 (normal zoom)
  manualMaxI: +localStorage.getItem('i')! || 1024,
  autoAdjustIterations: localStorage.getItem('a') === '1' || false,
  isShowLine: localStorage.getItem('l') === '1' || true,
  showShortcuts: localStorage.getItem('s') === '1' || false,
  colorTheme: (parseInt(localStorage.getItem('c')!) as ColorTheme) || 0,
}

let storageKeys = {
  offsetX: 'x',
  offsetY: 'y',
  zoomExp: 'z',
  manualMaxI: 'i',
  autoAdjustIterations: 'a',
  isShowLine: 'l',
  showShortcuts: 's',
  colorTheme: 'c',
} as const

export let state = new Proxy(initialState, {
  // Auto-persist to localStorage
  set(target, _prop, value) {
    let prop = _prop as keyof State

    ;(target as any)[prop] = value

    let key = storageKeys[prop]
    if (key) {
      if (typeof value === 'boolean') {
        localStorage.setItem(key, value ? '1' : '0')
      } else {
        localStorage.setItem(key, String(value))
      }
    }

    return true
  },
}) as State

// Convert between zoomExp and zoomRate
export function getZoomRate() {
  return Math.pow(10, state.zoomExp)
}

export function updateIterationsForZoom(zoomChange: number) {
  // Adjust iterations relative to current value
  let factor = zoomChange > 0 ? 1.2 : 0.8 // 20% increase/decrease per zoom step
  let newIterations = Math.floor(state.manualMaxI * factor)
  state.manualMaxI = Math.max(2, newIterations)
}

export function getMaxI() {
  // manualMaxI is now adjusted to the appropriate value for current zoom when auto-adjust is enabled
  return Math.max(2, state.manualMaxI)
}
