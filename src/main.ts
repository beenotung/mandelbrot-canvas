const { random, floor, min, max, sqrt, pow, exp, E, log } = Math
const win = window as any

const R = 0
const G = 1
const B = 2
const A = 3

const canvas = win.main as HTMLCanvasElement
const rect = canvas.getBoundingClientRect()

const scale = 1
const w = floor(rect.width / scale)
const h = floor(rect.height / scale)
const n = w * h

canvas.width = w
canvas.height = h

const context = canvas.getContext('2d')!
const imageData = context.getImageData(0, 0, w, h)
const data = imageData.data
const len = w * h * 4
const flag = new Array(len).fill(0)

for (let i = 0; i < len; i += 4) {
  data[i + R] = 0
  data[i + G] = 0
  data[i + B] = 0
  data[i + A] = 255
}

let offsetX = -1 / 3
let offsetY = 0
let zoomRate = 1 / 300

function fromXY(x: number, y: number): C {
  return [(x - w / 2) * zoomRate + offsetX, (y - h / 2) * zoomRate + offsetY]
}

let isStop = false
function nextEpoch() {
  flag.fill(0)
  batch = DefaultBatch
  if (isStop) {
    isStop = false
    requestAnimationFrame(loop)
  }
}

interface WheelEvent {
  wheelDelta: number
}
canvas.addEventListener('wheel', event => {
  // ;[offsetX, offsetY] = fromXY(event.x, event.y)
  if (event.wheelDelta > 0) {
    zoomRate *= 0.9
  } else {
    zoomRate *= 1.1
  }
  nextEpoch()
})
canvas.addEventListener('click', event => {
  ;[offsetX, offsetY] = fromXY(event.x, event.y)
  nextEpoch()
})

type C = [real: number, imaginary: number]

let MaxI = 1000
let rs = new Array(MaxI)
let gs = new Array(MaxI)
let bs = new Array(MaxI)
function initRed() {
  for (let i = 0; i < MaxI; i++) {
    let w = i / MaxI
    if (w <= 1 / 3) {
      rs[i] = floor(w * 3 * 255)
      gs[i] = 0
      bs[i] = 0
    } else if (w <= 2 / 3) {
      rs[i] = 255
      gs[i] = floor((w / 2) * 3 * 255)
      bs[i] = 0
    } else {
      rs[i] = 255
      gs[i] = 255
      bs[i] = floor(w * 255)
    }
  }
}
function initPurple() {
  for (let i = 0; i < MaxI; i++) {
    let w = i / MaxI
    if (w <= 1 / 3) {
      rs[i] = floor(((w * 3) / 2) * 255)
      gs[i] = floor(((w * 3) / 4) * 255)
      bs[i] = floor(((w * 3) / 2) * 255)
    } else if (w <= 2 / 3) {
      rs[i] = floor((w / 2) * 3 * 255)
      gs[i] = floor(1 / 4 + ((w - 1 / 3) * 3 * 5) / 12)
      bs[i] = floor((w / 2) * 3 * 255)
    } else {
      rs[i] = 255
      gs[i] = floor((1 - w + 1 / 3) * 255)
      bs[i] = 255
    }
  }
}
let initColor = initRed
initColor()
let colors = {
  red: initRed,
  purple: initPurple,
}
type ColorTheme = keyof typeof colors

function f(z: C, c: C): number {
  let i = 0
  let a: number
  let b: number

  for (; i < MaxI; ) {
    ;[a, b] = z
    if (!Number.isFinite(a * a + b * b)) {
      return i
    }
    i++
    /* acc = z * z */
    z[0] = a * a - b * b
    z[1] = 2 * a * b
    /* acc = acc + c */
    z[0] += c[0]
    z[1] += c[1]
  }
  return -1
}

function tick(): 1 | 0 {
  let x = floor(random() * w)
  let y = floor(random() * h)
  let i = y * w + x

  if (flag[i]) return 0
  flag[i] = 1

  i *= 4

  let c: C = fromXY(x, y)
  let iter = f([0, 0], c)
  if (iter === -1) {
    data[i + R] = 0
    data[i + G] = 0
    data[i + B] = 0
  } else {
    data[i + R] = rs[iter]
    data[i + G] = gs[iter]
    data[i + B] = bs[iter]
  }
  return 1
}

const DefaultBatch = 800
let batch = DefaultBatch
const targetInterval = 100

let isShowLine = true

function loop() {
  if (isStop) return
  // console.log('loop batch:', batch)
  let start = Date.now()
  let take = 0
  for (let i = 0; i < batch; i++) {
    take += tick()
  }
  if (take == 0) {
    console.log('done')
    isStop = true
    return
  }
  let end = Date.now()
  let used = end - start
  // console.log('used:', used)
  if (used > targetInterval) {
    batch = batch * 0.9 + 1
  } else if (used < targetInterval) {
    batch = batch * 1.1
  }
  if (isShowLine) {
    for (let x = 0; x < w; x += 2) {
      let y = floor(h / 2)
      let i = (y * w + x) * 4
      data[i + R] = 255
      data[i + G] = 0
      data[i + B] = 0
    }
    for (let y = 0; y < h; y += 2) {
      let x = floor(w / 2)
      let i = (y * w + x) * 4
      data[i + R] = 255
      data[i + G] = 0
      data[i + B] = 0
    }
  }
  context.putImageData(imageData, 0, 0)
  requestAnimationFrame(loop)
}
requestAnimationFrame(loop)

function restart() {
  isStop = true
  location.reload()
}

function clear() {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let i = (y * w + x) * 4
      data[i + R] = 0
      data[i + G] = 0
      data[i + B] = 0
    }
  }
  nextEpoch()
}

function setMaxI(i: number) {
  MaxI = i
  initColor()
  nextEpoch()
}

function setLine(isShow: boolean) {
  isShowLine = isShow
}

function setColor(color: ColorTheme) {
  initColor = colors[color]
  initColor()
  nextEpoch()
}

function getColor(): ColorTheme {
  for (let color in colors) {
    if (initColor == colors[color as ColorTheme]) {
      return color as ColorTheme
    }
  }
  throw new Error('color not found')
}

function save() {
  localStorage.setItem('x', String(offsetX))
  localStorage.setItem('y', String(offsetY))
  localStorage.setItem('z', String(zoomRate))
  localStorage.setItem('i', String(MaxI))
  localStorage.setItem('l', isShowLine ? 't' : 'f')
  localStorage.setItem('c', getColor())
}
function load() {
  offsetX = +localStorage.getItem('x')! || offsetX
  offsetY = +localStorage.getItem('y')! || offsetY
  zoomRate = +localStorage.getItem('z')! || zoomRate
  MaxI = +localStorage.getItem('i')! || MaxI
  initColor()
  let l = localStorage.getItem('l')
  isShowLine = l == 't' ? true : l == 'f' ? false : isShowLine
  nextEpoch()
  let c = (localStorage.getItem('c') as ColorTheme) || getColor()
  setColor(c)
}

Object.assign(win, {
  canvas,
  context,
  imageData,
  loop,
  data,
  w,
  h,
  n,
  len,
  restart,
  clear,
  setMaxI,
  setLine,
  setColor,
  save,
  load,
})
