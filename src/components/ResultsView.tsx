import React, { useState, useEffect } from 'react'
import confetti from 'canvas-confetti'
import type { FlagData } from '../types'
import { useTranslation } from '../hooks/useTranslation'
import { getDayNumber, getTimeUntilNextGame } from '../utils/dateUtils'
import countryCodeToFlagEmoji from 'country-code-to-flag-emoji'

interface ResultsViewProps {
  score: number
  dailyFlags: FlagData[]
  userAnswers: boolean[]
}

const ResultsView: React.FC<ResultsViewProps> = ({
  score,
  dailyFlags,
  userAnswers
}) => {
  const { t, language } = useTranslation()
  const [timeLeft, setTimeLeft] = useState(getTimeUntilNextGame())
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntilNextGame())
    }, 1000)

    return () => clearInterval(timer)
  }, [getTimeUntilNextGame])

  useEffect(() => {
    // Simple confetti for perfect score only
    if (score === 5) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      })
    }
  }, [score])
  const shareResults = async () => {
    const lines = dailyFlags.map((flag, index) => {
      const flagEmoji = countryCodeToFlagEmoji(flag.code.toUpperCase())
      const square = userAnswers[index] ? '🟩' : '🟥'
      return `${flagEmoji} ${square}`
    })
    const squares = lines.join('\n')
    const text = `${t('flagOfTheDay')} #${getDayNumber()}: ${score}/5\n${squares}\nhttps://flagsoftheday.aerion.me`
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        alert(t('resultsCopied'))
      }).catch(() => {
        alert(`${t('copyToShare')}:\n\n${text}`)
      })
    } else {
      alert(`${t('copyToShare')}:\n\n${text}`)
    }
  }

  return (
    <div className="results-container">
      <header className="results-header">
        <h1>{t('flagOfTheDay')} #{getDayNumber()}</h1>
        <p className="final-score">{t('finalScore', { score: score, total: 5 })}</p>
      </header>
      
      <div className="results-content">
        <div className="flag-grid">
          {dailyFlags.map((flag, index) => {
            const isCorrect = userAnswers[index]
            return (
              <div
                key={flag.country}
                className={`flag-item ${isCorrect ? 'correct' : 'incorrect'} flag-item-enter`}
                style={{ 
                  animationDelay: `${index * 150}ms`
                }}
              >
                <span className="flag-emoji">
                  <span className={`fi fi-${flag.code}`}></span>
                </span>
                <span className="flag-country">{language === 'fr' ? flag.countryFr : flag.country}</span>
                <div className={`flag-result ${isCorrect ? 'correct' : 'incorrect'}`}>
                  {isCorrect ? '✓' : '✗'}
                </div>
              </div>
            )
          })}
          
          <div className="countdown-item">
            <div className="countdown-content">
              <p className="next-game-info">{t('nextGameIn')}</p>
              <div className="countdown">
                {timeLeft.hours.toString().padStart(2, '0')}:
                {timeLeft.minutes.toString().padStart(2, '0')}:
                {timeLeft.seconds.toString().padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>
        
        <button className="share-btn" onClick={shareResults}>
          {t('shareResults')}
        </button>
      </div>
    </div>
  )
}

export default ResultsView