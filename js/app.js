import { GROUPS, findLevel } from './levels.js'
import { SECTIONS, findEntry } from './dictionary.js'
import { compile, gridValues, matches, usesTime, codeLength, describeValue, rawValue } from './engine.js'
import { breakdown } from './explain.js'
import { Grid, onFrame, thumbnail } from './grid.js'
import * as store from './storage.js'

const $app = document.querySelector('#app')
let cleanup = [] // things to stop when leaving a page
let playRequest = null // code sent to the playground from a "Try it" button

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

function el(html) {
  const t = document.createElement('template')
  t.innerHTML = html.trim()
  return t.content.firstElementChild
}

function toast(text) {
  const t = el(`<div class="toast">${text}</div>`)
  document.body.append(t)
  setTimeout(() => t.classList.add('show'), 10)
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400) }, 2800)
}

// How wide a grid can be on this screen.
function gridPixels(columns) {
  const w = Math.min(document.documentElement.clientWidth, 1000) - 32
  return Math.max(120, Math.min(columns === 1 ? 480 : 320, Math.floor((w - (columns - 1) * 16) / columns)))
}

// Animate a canvas thumbnail if its code uses t.
function liveThumb(code, size, px) {
  if (!usesTime(code)) return thumbnail(code, size, px)
  const g = new Grid({ size, code, px, thumb: true })
  g.canvas.classList.add('thumb')
  const start = performance.now()
  cleanup.push(onFrame(() => g.draw((performance.now() - start) / 1000)))
  return g.canvas
}

function starsHTML(level) {
  const s = store.stars(level)
  return `<span class="stars" title="solved · short · many ways">
    <span class="${s.solved ? 'on' : ''}">✔</span><span class="${s.short ? 'on' : ''}">★</span><span class="${s.ways ? 'on' : ''}">⇄</span></span>`
}

function groupProgress(group) {
  let solved = 0, stars = 0
  for (const l of group.levels) {
    if (store.stars(l).solved) solved++
    stars += store.starCount(l)
  }
  return { solved, stars, total: group.levels.length }
}

// ---------- Router ----------

function route() {
  cleanup.forEach(fn => fn())
  cleanup = []
  $app.classList.remove('no-inspect')
  closeModal()
  const parts = decodeURIComponent(location.hash.slice(2)).split('/')
  const [page, ...rest] = parts
  window.scrollTo(0, 0)
  if (page === 'group') return showGroup(rest.join('/'))
  if (page === 'level') return showLevel(rest.join('/'))
  if (page === 'play') return showPlayground()
  if (page === 'dictionary') return showDictionary(rest[0])
  showHome()
}

function link(path) {
  return '#/' + path.split('/').map(encodeURIComponent).join('/')
}

// ---------- Home ----------

function showHome() {
  document.title = 'Tixy Quest'
  $app.innerHTML = `
    <header class="top"><h1 class="logo">(t,i,x,y) =&gt; <span>Tixy Quest</span></h1></header>
    <section class="note">${document.querySelector('#welcome').innerHTML}</section>
    <nav class="tools">
      <a class="tool" href="#/play"><b>🧪 Playground</b><span>Make anything. Click dots to see why.</span></a>
      <a class="tool" href="#/dictionary"><b>📖 Dictionary</b><span>What does all this code mean?</span></a>
    </nav>
    <h2>Level packs</h2>
    <div class="packs"></div>
    <footer class="foot">
      <p><b>Your progress is saved in this browser.</b> To move it to another computer, or keep it safe:</p>
      <button class="btn" id="export">⬇ Save a backup file</button>
      <label class="btn">⬆ Load a backup file<input type="file" id="import" accept=".json,application/json" hidden></label>
      <p class="credit">Based on <a href="https://tixy.land">tixy.land</a> by Martin Kleppe and the <a href="https://www.mathsuniverse.com/tixy">tixy tutorial</a> by @JakeGMaths.</p>
    </footer>`
  const $packs = $app.querySelector('.packs')
  for (const g of GROUPS) {
    const p = groupProgress(g)
    const card = el(`
      <a class="pack" href="${link('group/' + g.id)}">
        <div class="pack-thumb"></div>
        <div class="pack-text">
          <b>${esc(g.title)}</b>
          <span class="sub">${esc(g.subtitle)}</span>
          <span class="diff">${'●'.repeat(g.difficulty)}${'○'.repeat(5 - g.difficulty)}</span>
          <span class="prog"><span class="bar"><i style="width:${(100 * p.solved / p.total).toFixed(0)}%"></i></span>
          ${p.solved}/${p.total} solved · ${p.stars}/${p.total * 3} stars</span>
        </div>
      </a>`)
    card.querySelector('.pack-thumb').append(liveThumb(g.cover.code, g.cover.size, 72))
    $packs.append(card)
  }
  $app.querySelector('#export').addEventListener('click', () => {
    const blob = new Blob([store.exportData()], { type: 'application/json' })
    const a = el(`<a download="tixy-quest-backup-${new Date().toISOString().slice(0, 10)}.json"></a>`)
    a.href = URL.createObjectURL(blob)
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  })
  $app.querySelector('#import').addEventListener('change', async e => {
    const file = e.target.files[0]
    if (!file) return
    try {
      store.importData(await file.text())
      toast('Backup loaded!')
      showHome()
    } catch (err) {
      alert(err.message)
    }
  })
}

// ---------- Group ----------

function showGroup(id) {
  const g = GROUPS.find(g => g.id === id)
  if (!g) return showHome()
  document.title = `${g.title} · Tixy Quest`
  const p = groupProgress(g)
  $app.innerHTML = `
    <header class="top"><a class="back" href="#/">← All packs</a></header>
    <h1 class="title">${esc(g.title)}</h1>
    <p class="sub center">${esc(g.subtitle)} · ${p.solved}/${p.total} solved · ${p.stars}/${p.total * 3} stars</p>
    <p class="legend center"><span class="stars"><span class="on">✔</span></span> solved
      <span class="stars"><span class="on">★</span></span> matched the shortest known answer
      <span class="stars"><span class="on">⇄</span></span> found different answers</p>
    <div class="levels"></div>`
  const $levels = $app.querySelector('.levels')
  for (const l of g.levels) {
    const tile = el(`<a class="level-tile ${store.stars(l).solved ? 'done' : ''}" href="${link('level/' + l.id)}">
      <span class="num">#${l.number}</span><span class="t"></span>${starsHTML(l)}</a>`)
    tile.querySelector('.t').append(liveThumb(l.code, l.size, 64))
    $levels.append(tile)
  }
}

// ---------- Time controls ----------

const SPEEDS = [0.25, 0.5, 1, 2]
const STEP = 0.1 // seconds per step button press

// Tick sounds, made with the Web Audio API (no sound files needed).
let audio = null
function tickSound() {
  try {
    audio = audio || new AudioContext()
    if (audio.state === 'suspended') audio.resume()
    const now = audio.currentTime
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.type = 'triangle'
    osc.frequency.value = 1100
    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)
    osc.connect(gain).connect(audio.destination)
    osc.start(now)
    osc.stop(now + 0.06)
  } catch (e) {}
}
// Browsers only allow sound after a click, so wake the audio up on the first one.
document.addEventListener('pointerdown', () => { if (audio?.state === 'suspended') audio.resume() })

// t that can be paused, stepped and slowed down, and can tick out loud.
class Clock {
  constructor() {
    this.t = 0
    this.playing = true
    this.speed = store.getSetting('speed', 1)
    this.sound = store.getSetting('tick', 0) // 0 = off, 0.1 or 1 = seconds between ticks
    this.last = performance.now()
    this.lastTick = null
  }
  // audible: whether the pattern uses t, so ticking means something
  tick(audible = true) {
    const now = performance.now()
    if (this.playing) this.t += (now - this.last) / 1000 * this.speed
    this.last = now
    const n = this.sound ? Math.floor(this.t / this.sound + 1e-6) : null
    if (n !== this.lastTick) {
      if (audible && n !== null && this.lastTick !== null) tickSound()
      this.lastTick = n
    }
    return this.t
  }
  reset() { this.t = 0; this.last = performance.now(); this.lastTick = null }
  step(dt) { this.playing = false; this.t = Math.max(0, Math.round((this.t + dt) * 10) / 10) }
}

function timeControlsHTML() {
  return `<span class="clock">t = 0.0</span>
    <span class="tbtns">
      <button class="btn small" id="t-back" title="step back">◀ step</button>
      <button class="btn small" id="t-play"></button>
      <button class="btn small" id="t-fwd" title="step forward">step ▶</button>
      <button class="btn small" id="restart" title="back to t = 0">⟲ restart</button>
    </span>
    <span class="speeds">speed: ${SPEEDS.map(s => `<button class="btn small speed" data-speed="${s}">${s === 0.25 ? '¼' : s === 0.5 ? '½' : s}×</button>`).join('')}</span>
    <span class="speeds">tick sound: ${[[0, 'off'], [0.1, 'every 0.1'], [1, 'every 1']].map(([v, label]) => `<button class="btn small tick" data-tick="${v}">${label}</button>`).join('')}</span>`
}

function wireTimeControls(clock, onChange) {
  const $play = $app.querySelector('#t-play')
  const show = () => {
    $play.textContent = clock.playing ? '⏸ pause' : '▶ play'
    $app.querySelector('.clock').textContent = `t = ${clock.t.toFixed(1)}`
    $app.querySelectorAll('.speed').forEach(b => b.classList.toggle('active', +b.dataset.speed === clock.speed))
    $app.querySelectorAll('.tick').forEach(b => b.classList.toggle('active', +b.dataset.tick === clock.sound))
    onChange()
  }
  $play.addEventListener('click', () => { clock.tick(false); clock.playing = !clock.playing; clock.last = performance.now(); show() })
  $app.querySelector('#t-back').addEventListener('click', () => { clock.step(-STEP); show() })
  $app.querySelector('#t-fwd').addEventListener('click', () => { clock.step(STEP); show() })
  $app.querySelector('#restart').addEventListener('click', () => { clock.reset(); show() })
  $app.querySelectorAll('.speed').forEach(b => b.addEventListener('click', () => {
    clock.tick(false)
    clock.speed = +b.dataset.speed
    store.setSetting('speed', clock.speed)
    show()
  }))
  $app.querySelectorAll('.tick').forEach(b => b.addEventListener('click', () => {
    clock.sound = +b.dataset.tick
    clock.lastTick = null
    store.setSetting('tick', clock.sound)
    if (clock.sound) tickSound() // a sample so you know it's on
    show()
  }))
  show()
}

// ---------- Inspector ----------

function binary(n) {
  return Number.isInteger(n) && n >= 0 ? n.toString(2) : ''
}

const BIT_OPS = /(^|[^&])&(?!&)|(^|[^|])\|(?!\|)|\^|>>|<</

function showSide(v) {
  if (typeof v === 'number') return Number.isInteger(v) ? String(v) : String(Math.round(v * 1000) / 1000)
  if (typeof v === 'boolean' || v === null || v === undefined) return String(v)
  return JSON.stringify(v) ?? String(v)
}

// "= 0.5 < 1": both sides of a comparison worked out. Skipped when it adds nothing new.
function compareLine(node) {
  if (!node.compare) return ''
  const { left, op, right } = node.compare
  const text = `${showSide(left)} ${op} ${showSide(right)}`
  if (text.replace(/\s+/g, '') === node.withNumbers.replace(/\s+/g, '')) return ''
  return `<div class="line sub-line">= <code>${esc(text)}</code></div>`
}

function renderNode(node, top = true) {
  const d = describeValue(node.raw)
  const val = node.ok ? `<span class="val v${Math.sign(d.value)}">${esc(d.shown)}</span>` : `<span class="val err">can't read this yet</span>`
  let html = `<div class="node">
    <div class="line"><code>${esc(node.code)}</code></div>
    ${node.withNumbers !== node.code ? `<div class="line sub-line">= <code>${esc(node.withNumbers)}</code></div>` : ''}
    ${compareLine(node)}
    <div class="line">→ ${val}</div>`
  if (node.children.length) {
    const word = node.op === '||' ? 'OR' : 'AND'
    const rule = node.op === '||'
      ? 'With <code>||</code>, the first truthy piece wins.'
      : 'With <code>&&</code>, every piece has to be truthy.'
    html += `<div class="pieces"><div class="pieces-head">${node.children.length} pieces joined by ${word}. ${rule}</div>
      ${node.children.map(c => renderNode(c, false)).join('')}</div>`
  }
  return html + '</div>'
}

// The "dot inspector" checkbox. Remembered across pages and visits.
function inspectorToggle(onChange) {
  const $box = $app.querySelector('#inspect-on')
  const apply = () => {
    $app.classList.toggle('no-inspect', !$box.checked)
    onChange($box.checked)
  }
  $box.checked = store.getSetting('inspector', true)
  $box.addEventListener('change', () => { store.setSetting('inspector', $box.checked); apply() })
  apply()
  return () => $box.checked
}

function inspectorHTML({ cell, t, size, code, target, showBinary }) {
  const vars = { t: Math.round(t * 100) / 100, i: cell.i, x: cell.x, y: cell.y }
  const usesT = usesTime(code) || (target && usesTime(target))
  let html = `<div class="vars">
    <span><b>x</b> = ${cell.x}${showBinary ? ` <small>(${binary(cell.x)})</small>` : ''}</span>
    <span><b>y</b> = ${cell.y}${showBinary ? ` <small>(${binary(cell.y)})</small>` : ''}</span>
    <span><b>i</b> = ${cell.i}${showBinary ? ` <small>(${binary(cell.i)})</small>` : ''}</span>
    ${usesT ? `<span><b>t</b> = ${vars.t.toFixed(1)}</span>` : ''}</div>`
  if (code && code.trim()) {
    const tree = breakdown(code, vars)
    const d = describeValue(tree.raw)
    html += `<div class="explain">${renderNode(tree)}</div>`
    html += tree.ok ? `<p class="result">Your dot: <b>${d.dot}</b>${d.note}</p>` : ''
  }
  if (target) {
    const tv = describeValue(rawValue(compile(target), vars.t, vars.i, vars.x, vars.y))
    const yv = describeValue(rawValue(compile(code), vars.t, vars.i, vars.x, vars.y))
    const same = Math.abs(tv.value - yv.value) < 0.002
    html += `<p class="result">Target dot: <b>${tv.dot}</b> ${same ? '<span class="good">✔ same</span>' : '<span class="bad">✘ different</span>'}</p>`
  }
  return html
}

// ---------- Level ----------

function showLevel(id) {
  const level = findLevel(id)
  if (!level) return showHome()
  const g = level.group
  const idx = g.levels.indexOf(level)
  const prev = g.levels[idx - 1]
  const next = g.levels[idx + 1]
  const nextGroup = GROUPS[GROUPS.indexOf(g) + 1]
  document.title = `${g.title} #${level.number} · Tixy Quest`
  const saved = store.getLevel(level.id)
  let code = saved.code ?? level.starter ?? ''

  const learn = (level.learn || []).map(findEntry).filter(Boolean)
  $app.innerHTML = `
    <header class="top">
      <a class="back" href="${link('group/' + g.id)}">← ${esc(g.title)}</a>
      <span class="pager">
        ${prev ? `<a class="btn small" href="${link('level/' + prev.id)}">‹ prev</a>` : ''}
        <b>#${level.number}</b> of ${g.levels.length}
        ${next ? `<a class="btn small" href="${link('level/' + next.id)}">next ›</a>` : ''}
      </span>
    </header>
    ${level.intro ? `<p class="intro">${level.intro}</p>` : ''}
    ${learn.length ? `<p class="learn">📖 ${learn.map(e => `<button class="chip" data-entry="${e.id}">${esc(e.term)}</button>`).join(' ')}</p>` : ''}
    <div class="board">
      <figure><div class="g-you"></div><figcaption>your code</figcaption></figure>
      <figure><div class="g-target"></div><figcaption>target</figcaption></figure>
    </div>
    <div class="timebar hidden">${timeControlsHTML()}</div>
    <input class="code" id="code" spellcheck="false" autocapitalize="off" autocorrect="off" autocomplete="off" placeholder="type code here" aria-label="your code">
    <p class="status"></p>
    <div class="row">
      ${level.hint ? `<button class="btn small" id="hint-btn">? hint</button>` : ''}
      <label class="check"><input type="checkbox" id="spot"> spot the difference</label>
      <label class="check"><input type="checkbox" id="inspect-on"> dot inspector</label>
    </div>
    <p class="hint hidden">${level.hint === true ? `<code>${esc(level.code)}</code>` : esc(level.hint || '')}</p>
    ${level.outro ? `<p class="outro hidden">${level.outro}</p>` : ''}
    <div class="next-wrap hidden">${next ? `<a class="btn go" href="${link('level/' + next.id)}">Next level ›</a>` : nextGroup ? `<a class="btn go" href="${link('group/' + nextGroup.id)}">Pack finished! Next: ${esc(nextGroup.title)} ›</a>` : `<a class="btn go" href="#/">You reached the end! 🎉</a>`}</div>
    <section class="panel inspector"><h3>🔍 Dot inspector</h3><div class="inspect-body"><p class="muted">Click any dot on either grid to see its numbers and why it's on or off.</p></div></section>
    <section class="panel"><h3>Your answers</h3><div class="goals"></div><div class="sols"></div></section>`

  const px = gridPixels(2)
  let picked = null
  const pick = cell => {
    if (!inspecting()) return
    picked = cell
    you.picked = target.picked = cell
    dirty = true
  }
  const you = new Grid({ size: level.size, code, px, onPick: pick, label: 'your pattern' })
  const target = new Grid({ size: level.size, code: level.code, px, onPick: pick, label: 'target pattern' })
  $app.querySelector('.g-you').append(you.canvas)
  $app.querySelector('.g-target').append(target.canvas)

  const $input = $app.querySelector('#code')
  const $status = $app.querySelector('.status')
  const $time = $app.querySelector('.timebar')
  const $clock = $app.querySelector('.clock')
  const $inspect = $app.querySelector('.inspect-body')
  const $outro = $app.querySelector('.outro')
  const $next = $app.querySelector('.next-wrap')
  const $spot = $app.querySelector('#spot')
  $input.value = code

  const clock = new Clock()
  let dirty = true
  let correct = false
  let recordTimer = null
  let lastInspect = 0
  const showBinary = g.id === 'bits' || BIT_OPS.test(level.code)

  function renderGoals() {
    const s = store.stars(level)
    $app.querySelector('.goals').innerHTML = `
      <p class="${s.solved ? 'good' : ''}">✔ Solve it</p>
      <p class="${s.short ? 'good' : ''}">★ Shortest known answer: <b>${level.record}</b> characters.
        ${s.shortest !== null ? `Your shortest: <b>${s.shortest}</b>${s.first > s.shortest ? ` (your first answer was ${s.first})` : ''}${s.beat ? ' 🏆 You beat it!' : ''}` : ''}</p>
      <p class="${s.ways ? 'good' : ''}">⇄ Find ${level.ways} different answers: <b>${s.count}</b> found</p>`
    const sols = store.getLevel(level.id).solutions
    const shortest = s.shortest
    $app.querySelector('.sols').innerHTML = sols.length
      ? sols.map(x => `<div class="sol ${codeLength(x.code) === shortest ? 'best' : ''}">
          ${codeLength(x.code) === shortest ? '<span class="best-tag">🏅 your shortest</span>' : ''}
          <button class="sol-code" title="put this in the box">${esc(x.code)}</button>
          <span class="len">${codeLength(x.code)}</span>
          <button class="x" title="forget this answer" data-code="${esc(x.code)}">×</button></div>`).join('')
      : `<p class="muted">Answers that work get saved here. Spaces don't count, so <code>x==1</code> and <code>x == 1</code> are the same answer.</p>`
  }

  function check() {
    you.setCode(code)
    const timed = usesTime(code) || usesTime(level.code)
    $time.classList.toggle('hidden', !timed)
    correct = !you.broken && matches(code, level.code, level.size)
    if (you.broken) $status.innerHTML = `<span class="muted">🤔 The computer can't read that yet. Keep typing!</span>`
    else if (correct) $status.innerHTML = `<span class="good big">✔ It matches!</span>`
    else $status.innerHTML = ''
    $outro?.classList.toggle('hidden', !correct)
    $next.classList.toggle('hidden', !correct)
    clearTimeout(recordTimer)
    if (correct) {
      const saving = code
      recordTimer = setTimeout(() => {
        const before = store.stars(level)
        if (store.addSolution(level.id, saving)) {
          const after = store.stars(level)
          // shorter than every answer he had before (not counting his very first answer)
          const best = before.solved && after.shortest < before.shortest
          const drop = best ? ` (${before.shortest} → ${after.shortest} characters)` : ''
          if (after.beat && !before.beat) toast(`🏆 New record! Shorter than the shortest known answer!${drop}`)
          else if (after.short && !before.short) toast(`★ You matched the shortest known answer!${drop}`)
          else if (best) toast(`🎉 New personal best! ${before.shortest} → ${after.shortest} characters`)
          else if (after.ways && !before.ways) toast(`⇄ ${after.count} different answers!`)
          else if (after.count > 1) toast(`New answer! That's ${after.count} different ways.`)
          else toast('✔ Solved!')
          renderGoals()
        }
      }, 700)
    }
    dirty = true
  }

  $input.addEventListener('input', () => {
    code = $input.value
    store.saveCode(level.id, code)
    clock.reset()
    check()
  })
  wireTimeControls(clock, () => { dirty = true })
  $app.querySelector('#hint-btn')?.addEventListener('click', () => $app.querySelector('.hint').classList.toggle('hidden'))
  $spot.addEventListener('change', () => { dirty = true; if (!$spot.checked) you.diffs = target.diffs = null })
  $app.querySelector('.sols').addEventListener('click', e => {
    const x = e.target.closest('.x')
    if (x) {
      store.removeSolution(level.id, x.dataset.code)
      return renderGoals()
    }
    const s = e.target.closest('.sol-code')
    if (s) {
      $input.value = s.textContent
      $input.dispatchEvent(new Event('input'))
    }
  })
  $app.querySelectorAll('[data-entry]').forEach(b => b.addEventListener('click', () => openEntry(b.dataset.entry)))

  const inspecting = inspectorToggle(on => {
    if (!on) picked = you.picked = target.picked = null
    $inspect.innerHTML = '<p class="muted">Click any dot on either grid to see its numbers and why it\'s on or off.</p>'
    dirty = true
  })
  renderGoals()
  check()

  cleanup.push(onFrame(() => {
    const timed = you.timed || target.timed
    const t = clock.tick(timed)
    if (!timed && !dirty) return
    if ($spot.checked) {
      const a = gridValues(you.fn, level.size, t)
      const b = gridValues(target.fn, level.size, t)
      const diffs = []
      a.forEach((v, k) => { if (Math.abs(v - b[k]) > 0.002) diffs.push(k) })
      you.diffs = diffs
    }
    you.draw(t)
    target.draw(t)
    if (timed) $clock.textContent = `t = ${t.toFixed(1)}`
    const now = performance.now()
    if (picked && (dirty || now - lastInspect > 150)) {
      lastInspect = now
      $inspect.innerHTML = inspectorHTML({ cell: picked, t, size: level.size, code, target: level.code, showBinary })
    }
    dirty = false
  }))
  if (!code) $input.focus()
}

// ---------- Playground ----------

const GALLERY = [
  { code: 'sin(t-hypot(x-7.5,y-7.5))', size: 16 },
  { code: '!((x+floor(t*4))&y)', size: 16 },
  { code: 'sin(x/2+t)*cos(y/2-t)', size: 16 },
  { code: 'abs(hypot(x-7.5,y-7.5)-t*3%10)<1', size: 16 },
  { code: 'y==abs(floor(t*4)%14-7)||x==abs(floor(t*3)%14-7)', size: 8 },
  { code: '(x^y)%(floor(t)%9+2)==0', size: 32 },
  { code: 'sin(atan2(x-15.5,y-15.5)*5+t*2)', size: 32 },
  { code: '1-((x*x-y+t*(1+x*x%5)*3)%16)/16', size: 32 },
  { code: 'y-7.5-6*sin(x/3+t)', size: 16 },
  { code: '(x*y+floor(t*10))%9<3', size: 16 },
]

function showPlayground() {
  document.title = 'Playground · Tixy Quest'
  let size = playRequest?.size || 16
  let code = playRequest?.code ?? 'sin(t-hypot(x-7.5,y-7.5))'
  playRequest = null
  $app.innerHTML = `
    <header class="top"><a class="back" href="#/">← Home</a></header>
    <h1 class="title">🧪 Playground</h1>
    <p class="center muted">Type anything! Click a dot to see why it looks the way it does.</p>
    <div class="board single"><figure><div class="g-play"></div></figure></div>
    <div class="timebar">${timeControlsHTML()}</div>
    <div class="timebar"><span class="sizes">grid: ${[8, 16, 32].map(s => `<button class="btn small size" data-size="${s}">${s}×${s}</button>`).join('')}</span></div>
    <input class="code" id="code" spellcheck="false" autocapitalize="off" autocorrect="off" autocomplete="off" aria-label="your code">
    <p class="status"></p>
    <div class="row"><button class="btn" id="keep">💾 Save to my creations</button>
      <label class="check"><input type="checkbox" id="inspect-on"> dot inspector</label></div>
    <section class="panel inspector"><h3>🔍 Dot inspector</h3><div class="inspect-body"><p class="muted">Click any dot.</p></div></section>
    <section class="panel"><h3>My creations</h3><div class="mine"></div></section>
    <section class="panel"><h3>Cool examples to change</h3><div class="gallery"></div></section>`

  const $input = $app.querySelector('#code')
  const $status = $app.querySelector('.status')
  const $inspect = $app.querySelector('.inspect-body')
  const $clock = $app.querySelector('.clock')
  let picked = null
  const clock = new Clock()
  let dirty = true
  let lastInspect = 0
  let grid

  function makeGrid() {
    grid = new Grid({ size, code, px: gridPixels(1), onPick: cell => { if (!inspecting()) return; picked = cell; grid.picked = cell; dirty = true } })
    const host = $app.querySelector('.g-play')
    host.innerHTML = ''
    host.append(grid.canvas)
    picked = null
    $inspect.innerHTML = '<p class="muted">Click any dot.</p>'
    $app.querySelectorAll('.size').forEach(b => b.classList.toggle('active', +b.dataset.size === size))
    dirty = true
  }

  function load(c, s) {
    code = c
    if (s && s !== size) { size = s; makeGrid() }
    $input.value = code
    setCode()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function setCode() {
    grid.setCode(code)
    clock.reset()
    $status.innerHTML = grid.broken ? `<span class="muted">🤔 The computer can't read that yet.</span>` : ''
    dirty = true
  }

  function renderMine() {
    const mine = store.getCreations()
    const $mine = $app.querySelector('.mine')
    $mine.innerHTML = mine.length ? '' : '<p class="muted">Nothing saved yet.</p>'
    mine.forEach((c, n) => {
      const card = el(`<div class="ex"><div class="ex-t"></div><code>${esc(c.code)}</code><button class="x" title="delete">×</button></div>`)
      card.querySelector('.ex-t').append(liveThumb(c.code, c.size, 64))
      card.addEventListener('click', e => {
        if (e.target.closest('.x')) { store.removeCreation(n); renderMine() } else load(c.code, c.size)
      })
      $mine.append(card)
    })
  }

  const $gallery = $app.querySelector('.gallery')
  for (const ex of GALLERY) {
    const card = el(`<button class="ex"><div class="ex-t"></div><code>${esc(ex.code)}</code></button>`)
    card.querySelector('.ex-t').append(liveThumb(ex.code, ex.size, 64))
    card.addEventListener('click', () => load(ex.code, ex.size))
    $gallery.append(card)
  }

  $app.querySelectorAll('.size').forEach(b => b.addEventListener('click', () => { size = +b.dataset.size; makeGrid() }))
  $input.addEventListener('input', () => { code = $input.value; setCode() })
  wireTimeControls(clock, () => { dirty = true })
  $app.querySelector('#keep').addEventListener('click', () => {
    if (!compile(code)) return toast("That code doesn't work yet.")
    if (store.addCreation(code.trim(), size)) { toast('💾 Saved!'); renderMine() } else toast('Already saved.')
  })

  const inspecting = inspectorToggle(on => {
    if (!on && grid) { picked = grid.picked = null; $inspect.innerHTML = '<p class="muted">Click any dot.</p>' }
    dirty = true
  })
  makeGrid()
  $input.value = code
  setCode()
  renderMine()

  cleanup.push(onFrame(() => {
    const t = clock.tick(grid.timed)
    if (!grid.timed && !dirty) return
    grid.draw(t)
    $clock.textContent = `t = ${t.toFixed(1)}`
    const now = performance.now()
    if (picked && (dirty || now - lastInspect > 150)) {
      lastInspect = now
      $inspect.innerHTML = inspectorHTML({ cell: picked, t, size, code, showBinary: BIT_OPS.test(code) })
    }
    dirty = false
  }))
}

// ---------- Dictionary ----------

function entryHTML(e) {
  return `<article class="entry" id="entry-${e.id}">
    <h3><code>${esc(e.term)}</code> <span>${esc(e.title)}</span></h3>
    <p>${e.body}</p>
    <div class="examples"></div>
  </article>`
}

function fillExamples(node, entry) {
  const $ex = node.querySelector('.examples')
  for (const code of entry.examples || []) {
    const size = /15\.5|7\.5/.test(code) ? 16 : 8
    const card = el(`<button class="ex" title="try it in the playground"><div class="ex-t"></div><code>${esc(code)}</code><span class="try">try it ▶</span></button>`)
    card.querySelector('.ex-t').append(liveThumb(code, size, 64))
    card.addEventListener('click', () => {
      playRequest = { code, size }
      location.hash = '#/play'
    })
    $ex.append(card)
  }
}

function showDictionary(focus) {
  document.title = 'Dictionary · Tixy Quest'
  $app.innerHTML = `
    <header class="top"><a class="back" href="#/">← Home</a></header>
    <h1 class="title">📖 Dictionary</h1>
    <p class="center muted">Everything you can type, and what it means. Click an example to try it.</p>
    <input class="code search" id="search" placeholder="search… (try % or circle)" aria-label="search the dictionary">
    <nav class="toc">${SECTIONS.map(s => s.entries.map(e => `<a href="#entry-${e.id}" data-jump="${e.id}"><code>${esc(e.term)}</code></a>`).join('')).join('')}</nav>
    <div class="dict"></div>`
  const $dict = $app.querySelector('.dict')
  for (const s of SECTIONS) {
    const sec = el(`<section class="dict-section"><h2>${esc(s.title)}</h2></section>`)
    for (const e of s.entries) {
      const node = el(entryHTML(e))
      node.dataset.search = `${e.term} ${e.title} ${e.body}`.toLowerCase().replace(/<[^>]+>/g, '')
      fillExamples(node, e)
      sec.append(node)
    }
    $dict.append(sec)
  }
  $app.querySelectorAll('[data-jump]').forEach(a => a.addEventListener('click', ev => {
    ev.preventDefault()
    document.getElementById('entry-' + a.dataset.jump)?.scrollIntoView({ behavior: 'smooth' })
  }))
  $app.querySelector('#search').addEventListener('input', ev => {
    const q = ev.target.value.trim().toLowerCase()
    $app.querySelectorAll('.entry').forEach(n => n.classList.toggle('hidden', !!q && !n.dataset.search.includes(q)))
    $app.querySelectorAll('.dict-section').forEach(s => s.classList.toggle('hidden', !s.querySelector('.entry:not(.hidden)')))
  })
  if (focus) setTimeout(() => document.getElementById('entry-' + focus)?.scrollIntoView(), 50)
}

// ---------- Dictionary pop-up (from a level) ----------

let modalCleanup = []
function openEntry(id) {
  const e = findEntry(id)
  if (!e) return
  closeModal()
  const m = el(`<div class="modal"><div class="modal-box">
    <button class="x close" title="close">×</button>${entryHTML(e)}
    <p><a href="${link('dictionary/' + e.id)}">Open the whole dictionary →</a></p></div></div>`)
  const saved = cleanup
  cleanup = []
  fillExamples(m, e)
  modalCleanup = cleanup
  cleanup = saved
  m.addEventListener('click', ev => { if (ev.target === m || ev.target.closest('.close')) closeModal() })
  document.body.append(m)
}
function closeModal() {
  modalCleanup.forEach(fn => fn())
  modalCleanup = []
  document.querySelector('.modal')?.remove()
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal() })

window.addEventListener('hashchange', route)
route()
