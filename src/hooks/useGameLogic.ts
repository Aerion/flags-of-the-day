import { useState, useEffect, useMemo } from 'react'
import { FLAGS } from '../types'
import { getTodayString } from '../utils/dateUtils'

export const useGameLogic = () => {
  const [currentFlagIndex, setCurrentFlagIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [userAnswers, setUserAnswers] = useState<boolean[]>([])
  const [hasPlayedToday, setHasPlayedToday] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)


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
    saveGameData,
    normalizeAnswer
  }
}