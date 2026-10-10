// Draws a tixy grid on a canvas, and tells you which dot was clicked.
import { compile, rawValue, dotValue, usesTime } from './engine.js'

const COLORS = { bg: '#000', pip: '#333', white: '#fff', red: '#ff3b3b', pick: '#0f0', diff: '#ffcc00' }

export class Grid {
  constructor({ size = 8, code = '', px = 300, onPick = null, label = '', thumb = false } = {}) {
    this.thumb = thumb
    this.canvas = document.createElement('canvas')
    this.canvas.className = 'grid'
    if (label) this.canvas.setAttribute('aria-label', label)
    this.size = size
    this.picked = null
    this.diffs = null // dot numbers to outline because they don't match the target
    this.labels = null // 't', 'i', 'x' or 'y': print that number in every dot
    this.onPick = onPick
    this.setCode(code)
    this.setPixels(px)
    if (onPick) {
      this.canvas.classList.add('pickable')
      this.canvas.addEventListener('click', e => {
        const cell = this.cellAt(e)
        if (cell) onPick(cell)
      })
    }
  }

  setCode(code) {
    this.code = code
    const fn = compile(code)
    if (fn || !code) this.fn = fn // keep showing the last working code while typing
    this.broken = !fn && !!code && !!code.trim()
    this.timed = usesTime(code)
  }

  setPixels(px) {
    // thumbnails are always exactly px wide; big grids use whole pixels so dots stay crisp
    const cell = this.thumb ? px / this.size : Math.max(2, Math.floor(px / this.size))
    this.cell = cell
    const css = cell * this.size
    const dpr = window.devicePixelRatio || 1
    this.canvas.style.width = css + 'px'
    this.canvas.style.height = css + 'px'
    this.canvas.width = Math.round(css * dpr)
    this.canvas.height = Math.round(css * dpr)
    this.ctx = this.canvas.getContext('2d')
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  cellAt(e) {
    const r = this.canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - r.left) / (r.width / this.size))
    const y = Math.floor((e.clientY - r.top) / (r.height / this.size))
    if (x < 0 || y < 0 || x >= this.size || y >= this.size) return null
    return { x, y, i: y * this.size + x }
  }

  // Returns the dot values it drew.
  draw(t) {
    const { ctx, cell, size } = this
    const css = cell * size
    ctx.fillStyle = COLORS.bg
    ctx.fillRect(0, 0, css, css)
    const values = new Array(size * size)
    const white = new Path2D(), red = new Path2D(), pips = new Path2D()
    let i = 0
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const v = dotValue(rawValue(this.fn, t, i, x, y))
        values[i] = v
        const cx = x * cell + cell / 2
        const cy = y * cell + cell / 2
        if (!this.thumb) pips.rect(cx - 1, cy - 1, 2, 2)
        if (v !== 0) {
          const path = v > 0 ? white : red
          path.moveTo(cx, cy)
          path.arc(cx, cy, Math.abs(v) * (this.thumb ? cell / 2.2 : cell / 2 - 1), 0, Math.PI * 2)
        }
        i++
      }
    }
    ctx.fillStyle = COLORS.pip
    ctx.fill(pips)
    ctx.fillStyle = COLORS.white
    ctx.fill(white)
    ctx.fillStyle = COLORS.red
    ctx.fill(red)

    if (this.diffs) {
      // a yellow ring around each dot that doesn't match yet
      ctx.strokeStyle = COLORS.diff
      ctx.lineWidth = Math.max(2, cell / 14)
      const ring = new Path2D()
      for (const k of this.diffs) {
        const cx = (k % size) * cell + cell / 2, cy = Math.floor(k / size) * cell + cell / 2
        ring.moveTo(cx + cell / 2 - ctx.lineWidth / 2, cy)
        ring.arc(cx, cy, cell / 2 - ctx.lineWidth / 2, 0, Math.PI * 2)
      }
      ctx.stroke(ring)
    }
    if (this.labels && this.labelsFit()) this.drawLabels(values, t)
    if (this.picked) {
      const { x, y } = this.picked
      ctx.strokeStyle = COLORS.pick
      ctx.lineWidth = Math.max(2, cell / 8)
      ctx.beginPath()
      ctx.arc(x * cell + cell / 2, y * cell + cell / 2, cell / 2 - ctx.lineWidth / 2, 0, Math.PI * 2)
      ctx.stroke()
    }
    return values
  }

  labelFont() {
    // t is shown like "12.3" and code values like "false", so leave room for 4 or 5 characters
    const chars = this.labels === 't' ? 4 : this.labels === 'code' ? 5
      : String(this.labels === 'i' ? this.size * this.size - 1 : this.size - 1).length
    return Math.min(this.cell * 0.5, this.cell * 1.15 / chars)
  }

  // What to print in one dot.
  labelText(t, i, x, y) {
    switch (this.labels) {
      case 't': return t < 100 ? t.toFixed(1) : String(Math.floor(t))
      case 'i': return String(i)
      case 'x': return String(x)
      case 'y': return String(y)
      case 'code': return showValue(rawValue(this.fn, t, i, x, y))
    }
    return ''
  }

  // Too small to read on big grids with small dots.
  labelsFit() {
    return !this.thumb && this.labelFont() >= 7
  }

  drawLabels(values, t) {
    const { ctx, cell, size } = this
    const most = this.labelFont()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    let i = 0
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const v = values[i]
        const n = this.labelText(t, i, x, y)
        // short values like "1" stay big; longer ones like "false" shrink to fit
        const font = this.labels === 'code' ? Math.min(most * 1.6, this.cell * 0.5, this.cell * 1.15 / Math.max(n.length, 1)) : most
        ctx.font = `bold ${font}px ui-monospace, Menlo, Consolas, monospace`
        const radius = Math.abs(v) * (cell / 2 - 1)
        // dark text on a white dot, white text on a red dot, grey on an empty spot
        // the text sits "on" the dot only if the dot is big enough to hold all of it
        const onDot = radius * 2 >= Math.max(ctx.measureText(n).width, font) + 2
        const cx = x * cell + cell / 2, cy = y * cell + cell / 2 + 1
        if (!onDot && v !== 0) {
          // a small dot peeks out behind the number: outline it so it stays readable
          ctx.strokeStyle = '#000'
          ctx.lineWidth = Math.max(2, font / 4)
          ctx.strokeText(n, cx, cy)
        }
        ctx.fillStyle = !onDot ? '#bbb' : v > 0 ? '#000' : '#fff'
        ctx.fillText(n, cx, cy)
        i++
      }
    }
  }
}

// A code value as short text: true, false, 3, 0.25, -1, NaN...
function showValue(v) {
  if (typeof v === 'number') return Number.isInteger(v) ? String(v) : Number.isNaN(v) ? 'NaN' : String(Math.round(v * 100) / 100)
  if (typeof v === 'boolean' || v === undefined || v === null) return String(v)
  return String(v).slice(0, 6)
}

// One shared animation loop. Views add a frame function and remove it when they close.
const frames = new Set()
let running = false
export function onFrame(fn) {
  frames.add(fn)
  if (!running) {
    running = true
    requestAnimationFrame(loop)
  }
  return () => frames.delete(fn)
}
function loop() {
  for (const fn of frames) {
    try { fn() } catch (e) { console.error(e) }
  }
  if (frames.size) requestAnimationFrame(loop)
  else running = false
}

// A little static picture of a pattern, for menus.
export function thumbnail(code, size, px = 64, t = 1.5) {
  const g = new Grid({ size, code, px, thumb: true })
  g.draw(t)
  g.canvas.classList.add('thumb')
  return g.canvas
}
