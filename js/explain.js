// Explains code for one dot: swaps in the numbers and splits the code
// into the pieces joined by || and &&, so you can see WHY a dot is on.
import { compile, rawValue } from './engine.js'

const OPEN = '([{'
const CLOSE = ')]}'

// Split code on a top-level operator ("||" or "&&"), ignoring anything in brackets.
export function splitTop(code, op) {
  const parts = []
  let depth = 0
  let start = 0
  let quote = null
  for (let k = 0; k < code.length; k++) {
    const c = code[k]
    if (quote) {
      if (c === '\\') k++
      else if (c === quote) quote = null
      continue
    }
    if (c === '"' || c === "'" || c === '`') quote = c
    else if (OPEN.includes(c)) depth++
    else if (CLOSE.includes(c)) depth--
    else if (depth === 0 && code.startsWith(op, k)) {
      parts.push(code.slice(start, k))
      k += op.length - 1
      start = k + 1
    }
  }
  parts.push(code.slice(start))
  return parts.map(p => p.trim())
}

// "(a||b)" -> "a||b" when the outer brackets wrap the whole thing.
export function stripOuterParens(code) {
  let s = code.trim()
  while (s.startsWith('(') && s.endsWith(')')) {
    let depth = 0
    let wrapsAll = true
    for (let k = 0; k < s.length; k++) {
      if (s[k] === '(') depth++
      else if (s[k] === ')') depth--
      if (depth === 0 && k < s.length - 1) { wrapsAll = false; break }
    }
    if (!wrapsAll) break
    s = s.slice(1, -1).trim()
  }
  return s
}

function formatNumber(n) {
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100)
}

// Replace the variables t, i, x, y with their numbers for this dot.
export function substitute(code, vars) {
  return code.replace(/(^|[^\w$.])([tixy])(?![\w$])/g, (m, before, name) => {
    const v = vars[name]
    const s = formatNumber(v)
    return before + (v < 0 ? `(${s})` : s)
  })
}

const COMPARATORS = ['===', '!==', '==', '!=', '<=', '>=', '<', '>']
// Operators that happen AFTER comparing. If one of these is at the top level,
// the code isn't just "left compared to right", so we don't split it.
const LOWER = ['&&', '||', '??', '?', ':', '&', '|', '^', ',', '=>']

// "abs(x-3.5) < 1" -> { left: 'abs(x-3.5)', op: '<', right: '1' }
// Only when there's exactly one comparison at the top level.
export function splitComparison(code) {
  let depth = 0
  let quote = null
  let found = null
  for (let k = 0; k < code.length; k++) {
    const c = code[k]
    if (quote) {
      if (c === '\\') k++
      else if (c === quote) quote = null
      continue
    }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue }
    if (OPEN.includes(c)) { depth++; continue }
    if (CLOSE.includes(c)) { depth--; continue }
    if (depth !== 0) continue
    if (code.startsWith('>>>', k)) { k += 2; continue }
    if (code.startsWith('>>', k) || code.startsWith('<<', k) || code.startsWith('**', k)) { k += 1; continue }
    const op = COMPARATORS.find(o => code.startsWith(o, k))
    if (op) {
      if (found) return null // more than one comparison, like a<b<c
      found = { left: code.slice(0, k).trim(), op, right: code.slice(k + op.length).trim() }
      k += op.length - 1
      continue
    }
    const low = LOWER.find(o => code.startsWith(o, k))
    if (low) return null
  }
  return found && found.left && found.right ? found : null
}

// Build a tree of pieces: [{ code, raw, op, children, compare }]
export function breakdown(code, vars, depth = 0) {
  const fn = compile(code)
  const raw = fn ? rawValue(fn, vars.t, vars.i, vars.x, vars.y) : undefined
  const node = { code, withNumbers: substitute(code, vars), raw, ok: !!fn, op: null, children: [] }
  if (!fn || depth > 3) return node
  const inner = stripOuterParens(code)
  for (const op of ['||', '&&']) {
    const parts = splitTop(inner, op)
    if (parts.length > 1 && parts.every(p => p)) {
      node.op = op
      node.children = parts.map(p => breakdown(p, vars, depth + 1))
      break
    }
  }
  if (!node.op) {
    // Work out each side of a comparison, e.g. abs(x-3.5)<1 -> 0.5 < 1
    const cmp = splitComparison(inner)
    if (cmp) {
      const side = s => { const f = compile(s); return f ? rawValue(f, vars.t, vars.i, vars.x, vars.y) : undefined }
      const left = side(cmp.left), right = side(cmp.right)
      if (left !== undefined && right !== undefined) node.compare = { op: cmp.op, left, right }
    }
  }
  return node
}
