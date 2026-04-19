import { useState, useEffect } from 'react'
import type { FlagData } from '../types'
import { getTodayString } from '../utils/dateUtils'
import { normalizeAnswer } from '../utils/answerUtils'

export const useBonusRound = (dailyFlags: FlagData[]) => {
  const [bonusIndex, setBonusIndex] = useState(0)
  const [bonusAnswers, setBonusAnswers] = useState<boolean[]>([])
  const [hasPlayedBonus, setHasPlayedBonus] = useState(false)

  useEffect(() => {
    const today = getTodayString()
    const lastBonus = localStorage.getItem('flag-game-bonus-played')
    const savedAnswers = localStorage.getItem('flag-game-bonus-answers')

    if (lastBonus === today && savedAnswers !== null) {
      setBonusAnswers(JSON.parse(savedAnswers))
      setHasPlayedBonus(true)
    }
  }, [])

  const submitCapitalGuess = (guess: string): boolean => {
    const currentFlag = dailyFlags[bonusIndex]
    const isCorrect = normalizeAnswer(guess) === normalizeAnswer(currentFlag.capital)

    const newAnswers = [...bonusAnswers]
    newAnswers[bonusIndex] = isCorrect
    setBonusAnswers(newAnswers)

    return isCorrect
  }

  const nextCapital = () => {
    setBonusIndex(prev => prev + 1)
  }

  const saveBonusData = () => {
    localStorage.setItem('flag-game-bonus-played', getTodayString())
    localStorage.setItem('flag-game-bonus-answers', JSON.stringify(bonusAnswers))
    setHasPlayedBonus(true)
  }

  return {
    bonusIndex,
    bonusAnswers,
    hasPlayedBonus,
    submitCapitalGuess,
    nextCapital,
    saveBonusData,
  }
}
