// Saved progress lives in this browser's localStorage.
// Shape: { levels: { [levelId]: { code, solutions: [{ code, at }] } }, creations: [{ code, size, at }] }
import { normalize, codeLength } from './engine.js'

const KEY = 'tixy-quest-v1'
let state = load()

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY))
    if (s && typeof s === 'object') return { levels: s.levels || {}, creations: s.creations || [] }
  } catch (e) {}
  return { levels: {}, creations: [] }
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch (e) {}
}

function entry(id) {
  if (!state.levels[id]) state.levels[id] = { code: null, solutions: [] }
  return state.levels[id]
}

export function getLevel(id) {
  return state.levels[id] || { code: null, solutions: [] }
}

export function saveCode(id, code) {
  entry(id).code = code
  save()
}

// Returns true if this is a new solution.
export function addSolution(id, code) {
  const e = entry(id)
  const norm = normalize(code)
  if (!norm || e.solutions.some(s => normalize(s.code) === norm)) return false
  e.solutions.push({ code: code.trim(), at: Date.now() })
  save()
  return true
}

export function removeSolution(id, code) {
  const e = entry(id)
  e.solutions = e.solutions.filter(s => s.code !== code)
  save()
}

export function stars(level) {
  const sols = getLevel(level.id).solutions
  const shortest = sols.length ? Math.min(...sols.map(s => codeLength(s.code))) : null
  return {
    solved: sols.length > 0,
    short: shortest !== null && shortest <= level.record,
    beat: shortest !== null && shortest < level.record,
    ways: sols.length >= level.ways,
    count: sols.length,
    shortest,
  }
}

export function starCount(level) {
  const s = stars(level)
  return (s.solved ? 1 : 0) + (s.short ? 1 : 0) + (s.ways ? 1 : 0)
}

export function getCreations() {
  return state.creations
}

export function addCreation(code, size) {
  if (state.creations.some(c => c.code === code && c.size === size)) return false
  state.creations.unshift({ code, size, at: Date.now() })
  save()
  return true
}

export function removeCreation(index) {
  state.creations.splice(index, 1)
  save()
}

export function exportData() {
  return JSON.stringify({ app: 'tixy-quest', version: 1, ...state }, null, 1)
}

// Merge a backup into the current progress (never throws away solutions).
export function importData(text) {
  const data = JSON.parse(text)
  if (!data || data.app !== 'tixy-quest') throw new Error('That is not a Tixy Quest backup file.')
  for (const [id, lv] of Object.entries(data.levels || {})) {
    const e = entry(id)
    if (lv.code && !e.code) e.code = lv.code
    for (const s of lv.solutions || []) {
      if (!e.solutions.some(x => normalize(x.code) === normalize(s.code))) e.solutions.push(s)
    }
  }
  for (const c of data.creations || []) {
    if (!state.creations.some(x => x.code === c.code && x.size === c.size)) state.creations.push(c)
  }
  save()
}
