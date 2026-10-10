import { test } from 'node:test'
import assert from 'node:assert/strict'
import { GROUPS, LEVELS } from '../js/levels.js'
import { ENTRIES } from '../js/dictionary.js'
import { compile, gridValues, matches } from '../js/engine.js'

test('every level target compiles and draws something', () => {
  for (const l of LEVELS) {
    const fn = compile(l.code)
    assert.ok(fn, `${l.id} does not compile`)
    const anyOn = [0, 1.5, 4].some(t => gridValues(fn, l.size, t).some(v => v !== 0))
    const blankOnPurpose = ['mommy1:y>7', 'tutorial:max(0, 0.1-t/10)']
    assert.ok(anyOn || blankOnPurpose.includes(l.id), `${l.id} is blank`)
  }
})

test('every alternate answer matches its level', () => {
  for (const l of LEVELS) {
    for (const a of l.alts) assert.ok(matches(a, l.code, l.size), `${l.id}: alt "${a}" does not match`)
  }
})

test('level ids are unique', () => {
  const ids = LEVELS.map(l => l.id)
  assert.equal(new Set(ids).size, ids.length)
})

test('dictionary links in levels exist', () => {
  const known = new Set(ENTRIES.map(e => e.id))
  for (const l of LEVELS) for (const id of l.learn || []) assert.ok(known.has(id), `${l.id} links to missing entry "${id}"`)
})

test('dictionary examples compile', () => {
  for (const e of ENTRIES) for (const c of e.examples || []) assert.ok(compile(c), `${e.id}: "${c}"`)
})

test('group covers compile', () => {
  for (const g of GROUPS) assert.ok(compile(g.cover.code), g.id)
})

test('ways goals are reachable with the known answers', () => {
  for (const l of LEVELS) {
    if (l.ways > 2) assert.ok(l.alts.length + 1 >= l.ways, `${l.id} needs ${l.ways} ways but only knows ${l.alts.length + 1}`)
  }
})

test('starting code never already solves the level', () => {
  for (const l of LEVELS) {
    if (l.starter) assert.ok(!matches(l.starter, l.code, l.size), `${l.id}: starter "${l.starter}" already matches`)
  }
})
