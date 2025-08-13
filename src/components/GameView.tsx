import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Combobox } from '@headlessui/react'
import Fuse from 'fuse.js'
import type { FlagData } from '../types'
import { FLAGS } from '../types'
import { useTranslation } from '../hooks/useTranslation'
import { useAnimations } from '../hooks/useAnimations'
import { getDayNumber } from '../utils/dateUtils'

type GameState = 'input' | 'feedback' | 'complete'

interface GameViewProps {
  currentFlagIndex: number
  dailyFlags: FlagData[]
  submitGuess: (guess: string) => boolean
  nextFlag: () => void
  onGameComplete: () => void
}

const GameView: React.FC<GameViewProps> = ({
  currentFlagIndex,
  dailyFlags,
  submitGuess,
  nextFlag,
  onGameComplete
}) => {
  const { t, language } = useTranslation()
  const [query, setQuery] = useState('')
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null)
  const [gameState, setGameState] = useState<GameState>('input')
  const { flagCelebrating, buttonSuccess, triggerSuccessAnimation, triggerFeedbackAnimation, resetAnimations } = useAnimations()
  const inputRef = useRef<HTMLInputElement>(null)

  const fuse = useMemo(() => new Fuse(FLAGS, {
    keys: language === 'fr' ? ['countryFr'] : ['country'],
    threshold: 0.3,
    includeScore: true
  }), [language])

  const filteredCountries = useMemo(() => {
    if (query.length < 2) return []
    return fuse.search(query, { limit: 5 }).map(result => result.item)
  }, [query, fuse])

  const currentFlag = dailyFlags[currentFlagIndex]

  useEffect(() => {
    setQuery('')
    setGameState('input')
    setFeedback(null)
    resetAnimations()
    // Focus the input after state updates
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }, [currentFlagIndex, resetAnimations])

  useEffect(() => {
    const handleGlobalKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && gameState === 'feedback') {
        e.preventDefault()
        handleNext()
      }
    }

    document.addEventListener('keydown', handleGlobalKeydown)
    return () => document.removeEventListener('keydown', handleGlobalKeydown)
  }, [gameState])


  const handleSubmit = () => {
    const guess = query.trim()
    if (!guess) return

    const isCorrect = submitGuess(guess)
    
    setFeedback({
      message: isCorrect ? t('correct') : t('incorrect', { country: language === 'fr' ? currentFlag.countryFr : currentFlag.country }),
      isCorrect
    })

    if (isCorrect) {
      triggerSuccessAnimation()
    } else {
      triggerFeedbackAnimation()
    }

    setGameState('feedback')
  }

  const handleNext = () => {
    if (currentFlagIndex >= 4) {
      onGameComplete()
    } else {
      nextFlag()
    }
  }


  return (
    <>
      <header>
        <h1>{t('flagOfTheDay')} #{getDayNumber()}</h1>
        <p id="progress">{t('flagProgress', { current: currentFlagIndex + 1, total: 5 })}</p>
      </header>
      
      <main>
        <div id="flag-container">
          <div 
            id="flag-display" 
            className={`${flagCelebrating ? 'flag-celebrate' : ''} ${
              feedback ? (feedback.isCorrect ? 'flag-correct' : 'flag-incorrect') : ''
            }`}
          >
            {currentFlag && (
              <span className={`fi fi-${currentFlag.code}`}></span>
            )}
            {feedback && !feedback.isCorrect && (
              <div className="flag-name-overlay">
                {language === 'fr' ? currentFlag.countryFr : currentFlag.country}
              </div>
            )}
          </div>
        </div>
        
        <div id="game-area">
          <div id="autocomplete-container" style={{ position: 'relative' }}>
            <Combobox value={query} onChange={(value) => {
              setQuery(value || '')
            }} disabled={gameState !== 'input'}>
              <Combobox.Input
                ref={inputRef}
                key={currentFlagIndex}
                id="country-input"
                placeholder={t('whichCountry')}
                autoComplete="off"
                displayValue={() => query}
                onChange={(event) => {
                  setQuery(event.target.value)
                }}
              />
              {filteredCountries.length > 0 && (
                <Combobox.Options id="autocomplete-list">
                  {filteredCountries.map((flag) => (
                    <Combobox.Option 
                      key={flag.country} 
                      value={language === 'fr' ? flag.countryFr : flag.country} 
                      className={({ focus }) => 
                        `autocomplete-item ${focus ? 'highlighted' : ''}`
                      }
                    >
                      {language === 'fr' ? flag.countryFr : flag.country}
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              )}
            </Combobox>
          </div>
          
          {gameState === 'input' && (
            <button 
              id="main-btn" 
              className={buttonSuccess ? 'button-success' : ''}
              onClick={handleSubmit}
            >
              {t('submit')}
            </button>
          )}
          
          {gameState === 'feedback' && (
            <button id="main-btn" onClick={handleNext}>
              {currentFlagIndex >= 4 ? t('finishGame') : t('nextFlag')}
            </button>
          )}
        </div>
      </main>
    </>
  )
}

export default GameView