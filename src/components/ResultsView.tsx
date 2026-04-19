import React, { useState, useEffect } from 'react'
import confetti from 'canvas-confetti'
import type { FlagData } from '../types'
import { useTranslation } from '../hooks/useTranslation'
import { getTimeUntilNextGame } from '../utils/dateUtils'

interface ResultsViewProps {
  score: number
  dailyFlags: FlagData[]
  userAnswers: boolean[]
  dayNumber: number
  bonusAnswers?: boolean[]
  onPlayBonus?: () => void
}

const ResultsView: React.FC<ResultsViewProps> = ({
  score,
  dailyFlags,
  userAnswers,
  dayNumber,
  bonusAnswers,
  onPlayBonus,
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
    if (score === 5) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      })
    }
  }, [score])

  const bonusScore = bonusAnswers?.filter(Boolean).length ?? 0
  const totalScore = bonusAnswers !== undefined ? score + bonusScore : score
  const totalOutOf = bonusAnswers !== undefined ? 10 : 5

  const shareResults = async () => {
    const flagSquares = userAnswers.map(c => c ? '🟩' : '🟥').join('')
    const capitalSquares = bonusAnswers?.map(c => c ? '🟩' : '🟥').join('')
    const shareTitle = language === 'fr' ? 'Drapeaux du Jour' : 'Flags of the Day'

    let text = `${shareTitle} #${dayNumber}: ${totalScore}/${totalOutOf}\n🏁 ${flagSquares}`
    if (capitalSquares) {
      text += `\n🏙️ ${capitalSquares}`
    }
    text += `\nhttps://flagsoftheday.aerion.me`

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
        <h1>{t('flagOfTheDay')} #{dayNumber}</h1>
        <p className="final-score">{t('finalScore', { score: totalScore, total: totalOutOf })}</p>
      </header>

      <div className="results-content">
        <div className="flag-grid">
          {dailyFlags.map((flag, index) => {
            const isCorrect = userAnswers[index]
            const capitalCorrect = bonusAnswers?.[index]
            const countryName = language === 'fr' ? flag.countryFr : flag.country
            return (
              <div
                key={flag.country}
                className={`flag-item ${isCorrect ? 'correct' : 'incorrect'} flag-item-enter`}
                style={{
                  animationDelay: `${index * 150}ms`
                }}
              >
                <span className="flag-emoji">
                  <img src={`/flags/${flag.code}.svg`} alt="" />
                </span>
                <span className="flag-country">
                  {countryName}
                  {bonusAnswers !== undefined && (
                    <span className="flag-capital">{flag.capital}</span>
                  )}
                </span>
                <div className="flag-results-col">
                  <div className={`flag-result ${isCorrect ? 'correct' : 'incorrect'}`}>
                    {isCorrect ? '✓' : '✗'}
                  </div>
                  {bonusAnswers !== undefined && (
                    <div className={`flag-result ${capitalCorrect ? 'correct' : 'incorrect'}`}>
                      {capitalCorrect ? '✓' : '✗'}
                    </div>
                  )}
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

        <div className="results-actions">
          {onPlayBonus && (
            <button className="bonus-btn" onClick={onPlayBonus}>
              {t('playBonusRound')}
            </button>
          )}
          <button className="share-btn" onClick={shareResults}>
            {t('shareResults')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResultsView
