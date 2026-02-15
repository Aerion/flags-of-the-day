import { useState, useEffect, useMemo } from 'react'
import { FLAGS } from '../types'
import { getTodayString, getDayNumber } from '../utils/dateUtils'
import { normalizeAnswer } from '../utils/answerUtils'

export const useGameLogic = () => {
  const [currentFlagIndex, setCurrentFlagIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [userAnswers, setUserAnswers] = useState<boolean[]>([])
  const [hasPlayedToday, setHasPlayedToday] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)

  // Hardcoded lists for specific days
  const HARDCODED_DAYS: Record<number, string[]> = {
    199: ['fm', 'gm', 'mq', 'jp', 'vg']
  }

  const createSeededRNG = (seed: number) => {
    // Mulberry32
    return function() {
      let t = seed += 0x6D2B79F5
      t = Math.imul(t ^ t >>> 15, t | 1)
      t ^= t + Math.imul(t ^ t >>> 7, t | 61)
      return ((t ^ t >>> 14) >>> 0) / 4294967296
    }
  }

  const dailyFlags = useMemo(() => {
    const dayNumber = getDayNumber()

    // Check for hardcoded days
    const hardcodedCodes = HARDCODED_DAYS[dayNumber]
    if (hardcodedCodes) {
      return hardcodedCodes.map(code =>
        FLAGS.find(flag => flag.code === code)!
      )
    }

    const rng = createSeededRNG(dayNumber)

    // Fisher–Yates shuffle
    const shuffled = [...FLAGS]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    return shuffled.slice(0, 5)
  }, [])

  const checkIfPlayedToday = () => {
    const today = getTodayString()
    const lastPlayed = localStorage.getItem('flag-game-last-played')
    const savedScore = localStorage.getItem('flag-game-score')
    const savedAnswers = localStorage.getItem('flag-game-answers')

    if (lastPlayed === today && savedScore !== null && savedAnswers !== null) {
      setHasPlayedToday(true)
      setScore(parseInt(savedScore, 10))
      setUserAnswers(JSON.parse(savedAnswers))
      return true
    }
    return false
  }

  const submitGuess = (guess: string): boolean => {
    const currentFlag = dailyFlags[currentFlagIndex]
    const normalizedGuess = normalizeAnswer(guess)
    const isCorrect = normalizedGuess === normalizeAnswer(currentFlag.country) ||
                     normalizedGuess === normalizeAnswer(currentFlag.countryFr)

    const newAnswers = [...userAnswers]
    newAnswers[currentFlagIndex] = isCorrect
    setUserAnswers(newAnswers)

    if (isCorrect) {
      setScore(prev => prev + 1)
    }

    return isCorrect
  }

  const nextFlag = () => {
    setCurrentFlagIndex(prev => prev + 1)
  }

  const saveGameData = () => {
    const today = getTodayString()
    localStorage.setItem('flag-game-last-played', today)
    localStorage.setItem('flag-game-score', score.toString())
    localStorage.setItem('flag-game-answers', JSON.stringify(userAnswers))
    setHasPlayedToday(true)
  }

  useEffect(() => {
    if (!checkIfPlayedToday()) {
      setGameStarted(true)
    }
  }, [])

  return {
    currentFlagIndex,
    score,
    userAnswers,
    hasPlayedToday,
    gameStarted,
    dailyFlags,
    submitGuess,
    nextFlag,
    saveGameData
  }
}
