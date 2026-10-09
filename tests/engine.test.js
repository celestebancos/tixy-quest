import { test } from 'node:test'
import assert from 'node:assert/strict'
import { compile, dotValue, matches, usesTime, normalize, codeLength, describeValue } from '../js/engine.js'
import { splitTop, stripOuterParens, substitute, breakdown } from '../js/explain.js'

test('compile handles good, bad and empty code', () => {
  assert.equal(compile('x==1')(0, 0, 1, 0), true)
  assert.equal(compile('sin(0)+PI>3')(0, 0, 0, 0), true)
  assert.equal(compile('x=='), null)
  assert.equal(compile('   '), null)
})

test('dot values are clamped and NaN is empty', () => {
  assert.equal(dotValue(true), 1)
  assert.equal(dotValue(5), 1)
  assert.equal(dotValue(-9), -1)
  assert.equal(dotValue(NaN), 0)
  assert.equal(dotValue(undefined), 0)
  assert.equal(dotValue(Infinity), 1)
})

test('matches compares the drawn pattern, not the code', () => {
  assert.ok(matches('x<3', 'x<=2'))
  assert.ok(matches('x==y', 'i%9==0'))
  assert.ok(!matches('x<3', 'x<4'))
  assert.ok(matches('5', '1'))
  assert.ok(!matches('x==', 'x==1'))
})

test('animated patterns are checked at many times', () => {
  assert.ok(matches('floor(t)%2', 't%2>=1'))
  assert.ok(!matches('floor(t)%2', '1'))
  assert.ok(!matches('x==floor(t)%8', 'x==round(t)%8'))
})

test('usesTime ignores t inside words', () => {
  assert.ok(usesTime('sin(t)'))
  assert.ok(usesTime('t'))
  assert.ok(!usesTime('sqrt(x)'))
  assert.ok(!usesTime('atan2(x,y)'))
})

test('spaces do not make a different answer', () => {
  assert.equal(normalize(' x == 1 '), 'x==1')
  assert.equal(codeLength('x == 1 || y'), 7)
})

test('describeValue', () => {
  assert.equal(describeValue(true).dot, 'big white dot')
  assert.equal(describeValue(-1).dot, 'big red dot')
  assert.equal(describeValue(0.5).dot, 'white dot, 50% size')
  assert.match(describeValue(4).note, /bigger than 1/)
})

test('splitTop ignores operators inside brackets', () => {
  assert.deepEqual(splitTop('x==0||(y==1||y==2)', '||'), ['x==0', '(y==1||y==2)'])
  assert.deepEqual(splitTop('[1,2].includes(x)&&y', '&&'), ['[1,2].includes(x)', 'y'])
  assert.deepEqual(splitTop('x|y', '||'), ['x|y'])
})

test('stripOuterParens only strips wrapping brackets', () => {
  assert.equal(stripOuterParens('((x||y))'), 'x||y')
  assert.equal(stripOuterParens('(x)||(y)'), '(x)||(y)')
})

test('substitute swaps in numbers but not inside names', () => {
  assert.equal(substitute('x==y||sqrt(t)>i', { t: 1.5, i: 3, x: 2, y: -1 }), '2==(-1)||sqrt(1.5)>3')
  assert.equal(substitute('Math.max(x,1)', { t: 0, i: 0, x: 4, y: 0 }), 'Math.max(4,1)')
})

test('breakdown explains each piece', () => {
  const b = breakdown('x==0||x==7||x==y', { t: 0, i: 27, x: 3, y: 3 })
  assert.equal(b.op, '||')
  assert.deepEqual(b.children.map(c => c.raw), [false, false, true])
  assert.equal(b.raw, true)
  const nested = breakdown('(x>1&&y>1)||x==0', { t: 0, i: 0, x: 0, y: 0 })
  assert.equal(nested.children[0].op, '&&')
})
