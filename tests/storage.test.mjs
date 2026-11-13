import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { beforeEach, test } from 'node:test'
import ts from 'typescript'

// Use the existing TypeScript dependency so tests also run on the project's Node 20.
const source = await readFile(new URL('../src/utils/storage.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
})
const { readSavedAnswers, saveAnswers, saveHistoryEntry, writeStoredValue } =
  await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)

const date = '2026-11-13'
const answers = [true, false, true, false, true]
const entry = [{ c: 'fr', guess: 'fr' }]
let data

beforeEach(() => {
  data = new Map()
  globalThis.window = { localStorage: {
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
  } }
})

test('valid completed games survive reload and keep previous history', () => {
  data.set('fotd_history', JSON.stringify({ '2026-11-12': entry }))
  assert.equal(saveAnswers('played', 'answers', date, answers), true)
  assert.deepEqual(readSavedAnswers('played', 'answers', date), answers)
  assert.equal(readSavedAnswers('played', 'answers', '2026-11-14'), null)
  assert.equal(saveHistoryEntry(date, entry), true)
  assert.deepEqual(JSON.parse(data.get('fotd_history')), { '2026-11-12': entry, [date]: entry })
})

test('malformed and wrong-shaped answers are ignored without mutating storage', () => {
  data.set('played', date)
  for (const raw of ['{broken', 'null', '{}', 'true', '[true]', '[1,0,1,0,1]', '[true,false,true,false,null]']) {
    data.set('answers', raw)
    assert.equal(readSavedAnswers('played', 'answers', date), null)
    assert.equal(data.get('answers'), raw)
  }
  data.delete('answers')
  assert.equal(readSavedAnswers('played', 'answers', date), null)
})

test('finishing a new game repairs malformed answers and preserves their original value', () => {
  data.set('answers', '{broken')
  assert.equal(saveAnswers('played', 'answers', date, answers), true)
  assert.deepEqual(readSavedAnswers('played', 'answers', date), answers)
  assert.equal(data.get('fotd-recovery:answers'), '{broken')
})

test('malformed history is backed up and repaired when saving the next result', () => {
  for (const raw of ['{broken', 'null', '[]', '42']) {
    data.clear()
    data.set('fotd_history', raw)
    assert.equal(saveHistoryEntry(date, entry), true)
    assert.equal(data.get('fotd-recovery:fotd_history'), raw)
    assert.deepEqual(JSON.parse(data.get('fotd_history')), { [date]: entry })
  }
})

test('blocked localStorage access never throws', () => {
  Object.defineProperty(window, 'localStorage', { get() { throw new Error('SecurityError') } })
  assert.equal(readSavedAnswers('played', 'answers', date), null)
  assert.equal(saveAnswers('played', 'answers', date, answers), false)
  assert.equal(writeStoredValue('score', '3'), false)
  assert.equal(saveHistoryEntry(date, entry), false)
})

test('failed history reads do not overwrite existing history', () => {
  const original = JSON.stringify({ yesterday: entry })
  data.set('fotd_history', original)
  window.localStorage.getItem = () => { throw new Error('read failed') }
  assert.equal(saveHistoryEntry(date, entry), false)
  assert.equal(data.get('fotd_history'), original)
})

test('full storage cannot mark unsaved answers complete or destroy corrupt history', () => {
  data.set('fotd_history', '{broken')
  window.localStorage.setItem = () => { throw new Error('QuotaExceededError') }
  assert.equal(saveAnswers('played', 'answers', date, answers), false)
  assert.equal(data.has('played'), false)
  assert.equal(saveHistoryEntry(date, entry), false)
  assert.equal(data.get('fotd_history'), '{broken')
})

test('failed completion marker writes do not throw', () => {
  window.localStorage.setItem = (key, value) => {
    if (key === 'played') throw new Error('QuotaExceededError')
    data.set(key, value)
  }
  assert.equal(saveAnswers('played', 'answers', date, answers), false)
  assert.equal(readSavedAnswers('played', 'answers', date), null)
})

test('an existing recovery backup is never overwritten', () => {
  data.set('fotd-recovery:fotd_history', 'original corruption')
  data.set('fotd_history', 'new corruption')
  assert.equal(saveHistoryEntry(date, entry), false)
  assert.equal(data.get('fotd-recovery:fotd_history'), 'original corruption')
  assert.equal(data.get('fotd_history'), 'new corruption')
})
