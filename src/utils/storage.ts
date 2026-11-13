// Persistence is optional: blocked/full storage must never prevent playing.
export const readStoredValue = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export const writeStoredValue = (key: string, value: string): boolean => {
  try {
    window.localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

export const isAnswers = (value: unknown): value is boolean[] =>
  Array.isArray(value) && value.length === 5 && value.every(item => typeof item === 'boolean')

const isHistory = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const parseStoredJson = <T>(raw: string | null, validate: (value: unknown) => value is T): T | null => {
  if (raw === null) return null
  try {
    const value: unknown = JSON.parse(raw)
    return validate(value) ? value : null
  } catch {
    return null
  }
}

const writeStoredJson = <T>(key: string, value: T, validate: (value: unknown) => value is T): boolean => {
  try {
    const storage = window.localStorage
    const raw = storage.getItem(key)
    if (raw !== null && parseStoredJson(raw, validate) === null) {
      // Keep the original before repairing it. If backup fails (e.g. quota),
      // leave it untouched and let the game continue using React state.
      const backupKey = `fotd-recovery:${key}`
      const backup = storage.getItem(backupKey)
      if (backup !== null && backup !== raw) return false
      if (backup === null) storage.setItem(backupKey, raw)
    }
    storage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export const readSavedAnswers = (dateKey: string, answersKey: string, date: string): boolean[] | null => {
  if (readStoredValue(dateKey) !== date) return null
  return parseStoredJson(readStoredValue(answersKey), isAnswers)
}

export const saveAnswers = (dateKey: string, answersKey: string, date: string, answers: boolean[]): boolean => {
  if (!isAnswers(answers)) return false
  // Write the completion marker last, so a failed answer write is not marked complete.
  return writeStoredJson(answersKey, answers, isAnswers) && writeStoredValue(dateKey, date)
}

export const saveHistoryEntry = (date: string, entry: { c: string; guess: string | null }[]): boolean => {
  try {
    // A failed read must not be mistaken for an empty history and overwrite it.
    const history = parseStoredJson(window.localStorage.getItem('fotd_history'), isHistory) ?? {}
    return writeStoredJson('fotd_history', { ...history, [date]: entry }, isHistory)
  } catch {
    return false
  }
}
