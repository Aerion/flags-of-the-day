import React, { useState, useEffect } from 'react'
import type { FlagData } from '../types'

interface ResultsViewProps {
  score: number
  dailyFlags: FlagData[]
  userAnswers: boolean[]
  getDayNumber: () => number
  getTimeUntilNextGame: () => { hours: number; minutes: number; seconds: number }
}

const ResultsView: React.FC<ResultsViewProps> = ({
  score,
  dailyFlags,
  userAnswers,
  getDayNumber,
  getTimeUntilNextGame
}) => {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilNextGame())

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntilNextGame())
    }, 1000)

    return () => clearInterval(timer)
  }, [getTimeUntilNextGame])
  const shareResults = async () => {
    const squares = userAnswers.map(isCorrect => isCorrect ? '🟩' : '🟥').join('')
    const text = `🏁 Flag of the Day #${getDayNumber()}: ${score}/5\n${squares}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Flag of the Day',
          text: text
        })
      } catch (error) {
        fallbackShare(text)
      }
    } else {
      fallbackShare(text)
    }
  }

  const fallbackShare = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        alert('Results copied to clipboard!')
      }).catch(() => {
        showShareText(text)
      })
    } else {
      showShareText(text)
    }
  }

  const showShareText = (text: string) => {
    alert(`Copy this text to share:\n\n${text}`)
  }

  return (
    <>
      <header>
        <h1>🏁 Flag of the Day #{getDayNumber()}</h1>
      </header>
      
      <div id="results">
        <h2>Game Complete!</h2>
      <p id="final-score">You scored {score} out of 5!</p>
      <div id="flag-summary">
        <h3>Today's Flags:</h3>
        <div id="flag-list">
          {dailyFlags.map((flag, index) => {
            const isCorrect = userAnswers[index]
            return (
              <div
                key={flag.country}
                className={`flag-item ${isCorrect ? 'correct' : 'incorrect'}`}
              >
                <div className="flag-info">
                  <span className="flag-emoji">{flag.flag}</span>
                  <span className="flag-country">{flag.country}</span>
                </div>
                <div className={`flag-result ${isCorrect ? 'correct' : 'incorrect'}`}>
                  {isCorrect ? '✓' : '✗'}
                </div>
              </div>
            )
          })}
        </div>
      </div>
        <div id="share-section">
          <button id="share-btn" onClick={shareResults}>
            Share Results
          </button>
        </div>
        
        <div id="countdown-section">
          <p id="next-game-info">Next game in:</p>
          <div id="countdown">
            {timeLeft.hours.toString().padStart(2, '0')}:
            {timeLeft.minutes.toString().padStart(2, '0')}:
            {timeLeft.seconds.toString().padStart(2, '0')}
          </div>
        </div>
      </div>
    </>
  )
}

export default ResultsView