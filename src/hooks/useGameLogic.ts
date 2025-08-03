import { useState, useEffect, useMemo } from 'react'
import { FLAGS } from '../types'

export const useGameLogic = () => {
  const [currentFlagIndex, setCurrentFlagIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [userAnswers, setUserAnswers] = useState<boolean[]>([])
  const [hasPlayedToday, setHasPlayedToday] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)

  const getTodayString = (): string => {
    const now = new Date()
    return new Date(now.getTime() + now.getTimezoneOffset() * 60000).toISOString().split('T')[0]
  }

  const getDayNumber = (): number => {
    const startDate = new Date('2025-01-01T00:00:00.000Z')
    const today = new Date(getTodayString() + 'T00:00:00.000Z')
    const diffTime = today.getTime() - startDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays + 1
  }

  const getTimeUntilNextGame = (): { hours: number; minutes: number; seconds: number } => {
    const now = new Date()
    const nowUtc = new Date(now.getTime() + now.getTimezoneOffset() * 60000)
    const tomorrowUtc = new Date(nowUtc)
    tomorrowUtc.setUTCDate(nowUtc.getUTCDate() + 1)
    tomorrowUtc.setUTCHours(0, 0, 0, 0)
    
    const timeLeft = tomorrowUtc.getTime() - nowUtc.getTime()
    const hours = Math.floor(timeLeft / (1000 * 60 * 60))
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)
    
    return { hours, minutes, seconds }
  }

  const hashCode = (str: string): number => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash)
  }

  const seededRandom = (seed: number): (() => number) => {
    let x = Math.sin(seed) * 10000
    return () => {
      x = Math.sin(x) * 10000
      return x - Math.floor(x)
    }
  }

  const dailyFlags = useMemo(() => {
    const today = getTodayString()
    const seed = hashCode(today)
    const rng = seededRandom(seed)
    
    const shuffled = [...FLAGS].sort(() => rng() - 0.5)
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

  const normalizeAnswer = (answer: string): string => {
    return answer.toLowerCase().trim()
      .replace(/^the\s+/, '')
      .replace(/\s+/g, ' ')
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
    saveGameData,
    normalizeAnswer,
    getDayNumber,
    getTimeUntilNextGame
  }
}