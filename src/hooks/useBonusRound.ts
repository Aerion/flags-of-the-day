import { useState, useEffect, useRef } from 'react'
import type { FlagData } from '../types'
import { getTodayString } from '../utils/dateUtils'
import { normalizeAnswer } from '../utils/answerUtils'
import type { Language } from '../i18n'
import { readSavedAnswers, saveAnswers } from '../utils/storage'

export const useBonusRound = (dailyFlags: FlagData[], language: Language) => {
  const [bonusIndex, setBonusIndex] = useState(0)
  const [bonusAnswers, setBonusAnswers] = useState<boolean[]>([])
  const [hasPlayedBonus, setHasPlayedBonus] = useState(false)
  const gameDateRef = useRef(getTodayString())

  useEffect(() => {
    const savedAnswers = readSavedAnswers('flag-game-bonus-played', 'flag-game-bonus-answers', gameDateRef.current)

    if (savedAnswers !== null) {
      setBonusAnswers(savedAnswers)
      setHasPlayedBonus(true)
    }
  }, [])

  const submitCapitalGuess = (guess: string): boolean => {
    const currentFlag = dailyFlags[bonusIndex]
    const expectedCapital = language === 'fr' ? currentFlag.capitalFr : currentFlag.capital
    const isCorrect = normalizeAnswer(guess) === normalizeAnswer(expectedCapital)

    const newAnswers = [...bonusAnswers]
    newAnswers[bonusIndex] = isCorrect
    setBonusAnswers(newAnswers)

    return isCorrect
  }

  const skipCapital = () => {
    const newAnswers = [...bonusAnswers]
    newAnswers[bonusIndex] = true
    setBonusAnswers(newAnswers)
  }

  const nextCapital = () => {
    setBonusIndex(prev => prev + 1)
  }

  const saveBonusData = () => {
    saveAnswers('flag-game-bonus-played', 'flag-game-bonus-answers', gameDateRef.current, bonusAnswers)
    setHasPlayedBonus(true)
  }

  return {
    bonusIndex,
    bonusAnswers,
    hasPlayedBonus,
    submitCapitalGuess,
    skipCapital,
    nextCapital,
    saveBonusData,
  }
}
