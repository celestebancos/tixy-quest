// The tixy engine: turns code like "x==y" into dot values.
// Pure functions only, so it runs in the browser and in Node tests.

const MATH_NAMES = Object.getOwnPropertyNames(Math)

// Compile user code into f(t, i, x, y). Returns null if it doesn't parse.
export function compile(code) {
  if (!code || !code.trim()) return null
  try {
    // Math members are passed in as arguments so `sin(x)` works without `Math.`
    // (the original tixy used `with (Math)`, which isn't allowed in modules).
    const make = new Function(...MATH_NAMES, `return (t, i, x, y) => (${code}\n)`)
    return make(...MATH_NAMES.map(n => Math[n]))
  } catch (e) {
    return null
  }
}

// Run compiled code for one dot. Any error counts as 0 (no dot).
export function rawValue(fn, t, i, x, y) {
  if (!fn) return 0
  try { return fn(t, i, x, y) } catch (e) { return 0 }
}

// What the dot actually shows: a number from -1 (big red) to 1 (big white).
export function dotValue(raw) {
  const n = Number(raw)
  if (!Number.isFinite(n)) return Number.isNaN(n) ? 0 : (n > 0 ? 1 : -1)
  return Math.max(-1, Math.min(1, n))
}

export function gridValues(fn, size, t = 0) {
  const out = new Array(size * size)
  let i = 0
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      out[i] = dotValue(rawValue(fn, t, i, x, y))
      i++
    }
  }
  return out
}

// Does the code use t (time)? Ignores t inside words like "sqrt".
export function usesTime(code) {
  return /(^|[^\w$.])t(?![\w$])/.test(code || '')
}

// Times used to decide whether two animated patterns really match.
export const CHECK_TIMES = [0, 0.37, 1, 1.5, 2.25, 3.7, 5, 6.9, 10.3, 17.6, 31.4]

export function matches(code, target, size = 8) {
  const a = compile(code)
  const b = compile(target)
  if (!a || !b) return false
  const times = usesTime(code) || usesTime(target) ? CHECK_TIMES : [0]
  for (const t of times) {
    const va = gridValues(a, size, t)
    const vb = gridValues(b, size, t)
    for (let k = 0; k < va.length; k++) {
      if (Math.abs(va[k] - vb[k]) > 0.002) return false
    }
  }
  return true
}

// Two solutions are "the same" if they only differ in spaces.
export function normalize(code) {
  return (code || '').replace(/\s+/g, '')
}

export function codeLength(code) {
  return normalize(code).length
}

// Plain-words description of what a value does to a dot.
export function describeValue(raw) {
  const v = dotValue(raw)
  let shown
  if (typeof raw === 'boolean') shown = String(raw)
  else if (typeof raw === 'number') shown = Number.isInteger(raw) ? String(raw) : String(Math.round(raw * 1000) / 1000)
  else if (raw === undefined) shown = 'undefined'
  else shown = JSON.stringify(raw) ?? String(raw)

  let dot
  if (v === 0) dot = 'no dot'
  else if (v === 1) dot = 'big white dot'
  else if (v === -1) dot = 'big red dot'
  else dot = `${v > 0 ? 'white' : 'red'} dot, ${Math.round(Math.abs(v) * 100)}% size`

  let note = ''
  if (typeof raw === 'number' && Math.abs(raw) > 1 && Number.isFinite(raw)) note = ' (bigger than 1 counts as 1)'
  if (typeof raw === 'number' && Number.isNaN(raw)) note = ' (NaN means "not a number")'
  return { shown, dot, note, value: v }
}
