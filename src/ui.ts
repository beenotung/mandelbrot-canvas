import { state, getMaxI, ColorTheme, updateIterationsForZoom } from './storage.js'

// Import functions that need to be called from event handlers
let nextEpochCallback: () => void

export function setNextEpochCallback(callback: () => void) {
  nextEpochCallback = callback
}

export let dom = {
  iterationsInput: document.getElementById('iterations') as HTMLInputElement,
  iterationsMinusBtn: document.getElementById(
    'iterations-minus',
  ) as HTMLButtonElement,
  iterationsPlusBtn: document.getElementById(
    'iterations-plus',
  ) as HTMLButtonElement,
  autoAdjustCheckbox: document.getElementById(
    'auto-adjust',
  ) as HTMLInputElement,
  showLinesCheckbox: document.getElementById('show-lines') as HTMLInputElement,
  colorThemeSelect: document.getElementById('color-theme') as HTMLSelectElement,
  offsetXDisplay: document.getElementById('offset-x') as HTMLSpanElement,
  offsetYDisplay: document.getElementById('offset-y') as HTMLSpanElement,
  zoomDisplay: document.getElementById('zoom-level') as HTMLSpanElement,
  currentIterationsDisplay: document.getElementById(
    'current-iterations',
  ) as HTMLSpanElement,
  showShortcutsCheckbox: document.getElementById(
    'show-shortcuts',
  ) as HTMLInputElement,
  shortcutsHelp: document.getElementById('shortcuts-help') as HTMLDivElement,
  resetViewBtn: document.getElementById('reset-view') as HTMLButtonElement,
  // Mobile controls
  togglePanelBtn: document.getElementById('toggle-panel') as HTMLButtonElement,
  zoomInBtn: document.getElementById('zoom-in') as HTMLButtonElement,
  zoomOutBtn: document.getElementById('zoom-out') as HTMLButtonElement,
  controlsPanel: document.getElementById('controls') as HTMLDivElement,
}

// Function to update display values
export function updateDisplays() {
  if (dom.offsetXDisplay)
    dom.offsetXDisplay.textContent = state.offsetX.toFixed(6)
  if (dom.offsetYDisplay)
    dom.offsetYDisplay.textContent = state.offsetY.toFixed(6)
  if (dom.zoomDisplay) dom.zoomDisplay.textContent = state.zoomExp.toFixed(3)
  if (dom.currentIterationsDisplay)
    dom.currentIterationsDisplay.textContent = getMaxI().toString()

  // Update iterations input field based on auto-adjust state
  if (dom.iterationsInput) {
    dom.iterationsInput.value = state.autoAdjustIterations
      ? getMaxI().toString()
      : state.manualMaxI.toString()
  }
}

export function initUIControls() {
  dom.iterationsInput.value = state.autoAdjustIterations
    ? getMaxI().toString()
    : state.manualMaxI.toString()
  dom.autoAdjustCheckbox.checked = state.autoAdjustIterations
  dom.showLinesCheckbox.checked = state.isShowLine
  dom.colorThemeSelect.value = String(state.colorTheme)
  dom.showShortcutsCheckbox.checked = state.showShortcuts
  dom.shortcutsHelp.style.display = state.showShortcuts ? 'flex' : 'none'
}

// UI event listeners
export function setupEventListeners() {
  // Iteration controls
  dom.iterationsInput.addEventListener('change', () => {
    // Only allow manual input when auto-adjust is disabled
    if (!state.autoAdjustIterations) {
      let value = parseInt(dom.iterationsInput.value)
      if (value >= 2) {
        // Set iterations (minimum 2)
        state.manualMaxI = value
        updateDisplays()
        if (nextEpochCallback) nextEpochCallback()
      } else {
        // Reset to valid value
        dom.iterationsInput.value = String(state.manualMaxI)
      }
    } else {
      // Reset to computed value when auto-adjust is enabled
      dom.iterationsInput.value = getMaxI().toString()
    }
  })

  dom.iterationsMinusBtn.addEventListener('click', () => {
    let newValue = Math.max(2, Math.floor(state.manualMaxI / 2)) // Half the iterations
    state.manualMaxI = newValue
    updateDisplays()
    if (nextEpochCallback) nextEpochCallback()
  })

  dom.iterationsPlusBtn.addEventListener('click', () => {
    let newValue = Math.floor(state.manualMaxI * 2) // Double the iterations
    state.manualMaxI = Math.max(2, newValue)
    updateDisplays()
    if (nextEpochCallback) nextEpochCallback()
  })

  // Auto-adjust checkbox
  dom.autoAdjustCheckbox.addEventListener('change', () => {
    state.autoAdjustIterations = dom.autoAdjustCheckbox.checked
    updateDisplays()
  })

  // Show lines checkbox
  dom.showLinesCheckbox.addEventListener('change', () => {
    state.isShowLine = dom.showLinesCheckbox.checked
  })

  // Color theme select
  dom.colorThemeSelect.addEventListener('change', () => {
    state.colorTheme = parseInt(dom.colorThemeSelect.value) as ColorTheme
  })

  // Show shortcuts checkbox
  dom.showShortcutsCheckbox.addEventListener('change', () => {
    state.showShortcuts = dom.showShortcutsCheckbox.checked
    dom.shortcutsHelp.style.display = state.showShortcuts ? 'flex' : 'none'
  })

  // Reset view button
  dom.resetViewBtn.addEventListener('click', () => {
    state.offsetX = -0.5
    state.offsetY = 0
    state.zoomExp = -0.5 // Zoomed out for better overview
    state.manualMaxI = 128 // Reasonable default iterations
    updateDisplays()
    if (nextEpochCallback) nextEpochCallback()
  })

  // Mobile controls
  dom.togglePanelBtn.addEventListener('click', () => {
    let isVisible = dom.controlsPanel.style.display !== 'none'
    dom.controlsPanel.style.display = isVisible ? 'none' : 'block'
    dom.togglePanelBtn.textContent = isVisible ? '⚙️' : '✕'
  })

  dom.zoomInBtn.addEventListener('click', () => {
    state.zoomExp += 0.1 // Zoom in
    if (state.autoAdjustIterations) {
      updateIterationsForZoom(0.1)
    }
    if (nextEpochCallback) nextEpochCallback()
  })

  dom.zoomOutBtn.addEventListener('click', () => {
    state.zoomExp -= 0.1 // Zoom out
    if (state.autoAdjustIterations) {
      updateIterationsForZoom(-0.1)
    }
    if (nextEpochCallback) nextEpochCallback()
  })
}
