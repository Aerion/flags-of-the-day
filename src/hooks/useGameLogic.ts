import { useState, useEffect, useMemo } from 'react'
import { FLAGS } from '../types'
import { getTodayString, getDayNumber } from '../utils/dateUtils'

export const useGameLogic = () => {
  const [currentFlagIndex, setCurrentFlagIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [userAnswers, setUserAnswers] = useState<boolean[]>([])
  const [hasPlayedToday, setHasPlayedToday] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)


  const hashDayNumber = (day: number): number => {
    const hash = (day * 16777619) ^ 0x811c9dc5
    console.log(`Day: ${day}, Hash: ${hash}`)
    return Math.abs(hash) // Ensure positive number
  }


  const dailyFlags = useMemo(() => {
    const seed = hashDayNumber(getDayNumber())
    const flags = []
    const used = new Set()
    
    let offset = 0
    while (flags.length < 5) {
      const index = (seed + offset * 1013) % FLAGS.length
      if (!used.has(index)) {
        used.add(index)
        const selectedFlag = FLAGS[index]
        if (!selectedFlag) {
          console.error(`Flag at index ${index} is undefined. FLAGS.length: ${FLAGS.length}`)
        }
        flags.push(selectedFlag)
      }
      offset++
    }

    return flags
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
