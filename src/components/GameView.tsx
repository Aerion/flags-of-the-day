import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Combobox } from '@headlessui/react'
import Fuse from 'fuse.js'
import type { FlagData } from '../types'
import { FLAGS } from '../types'

type GameState = 'input' | 'feedback' | 'complete'

interface GameViewProps {
  currentFlagIndex: number
  dailyFlags: FlagData[]
  submitGuess: (guess: string) => boolean
  nextFlag: () => void
  onGameComplete: () => void
  getDayNumber: () => number
}

const GameView: React.FC<GameViewProps> = ({
  currentFlagIndex,
  dailyFlags,
  submitGuess,
  nextFlag,
  onGameComplete,
  getDayNumber
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [query, setQuery] = useState('')
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null)
  const [gameState, setGameState] = useState<GameState>('input')
  const inputRef = useRef<HTMLInputElement>(null)

  const fuse = useMemo(() => new Fuse(FLAGS, {
    keys: ['country'],
    threshold: 0.3,
    includeScore: true
  }), [])

  const filteredCountries = useMemo(() => {
    if (query.length < 2) return []
    return fuse.search(query, { limit: 5 }).map(result => result.item)
  }, [query, fuse])

  const currentFlag = dailyFlags[currentFlagIndex]

  useEffect(() => {
    setSelectedCountry('')
    setQuery('')
    setGameState('input')
    setFeedback(null)
    // Focus the input after state updates
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }, [currentFlagIndex])

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
    const guess = (selectedCountry || query).trim()
    if (!guess) return

    const isCorrect = submitGuess(guess)
    
    setFeedback({
      message: isCorrect ? '🎉 Correct!' : `❌ Incorrect. The answer was ${currentFlag.country}`,
      isCorrect
    })

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
        <h1>🏁 Flag of the Day #{getDayNumber()}</h1>
        <p id="progress">Flag {currentFlagIndex + 1} of 5</p>
      </header>
      
      <main>
        <div id="flag-container">
          <div id="flag-display">{currentFlag?.flag}</div>
        </div>
        
        <div id="game-area">
          <div id="autocomplete-container" style={{ position: 'relative' }}>
            <Combobox value={selectedCountry} onChange={(value) => {
              setSelectedCountry(value || '')
              setQuery(value || '')
            }} disabled={gameState !== 'input'}>
              <Combobox.Input
                ref={inputRef}
                key={currentFlagIndex}
                id="country-input"
                placeholder="Which country is this?"
                autoComplete="off"
                displayValue={() => selectedCountry}
                onChange={(event) => {
                  setQuery(event.target.value)
                  if (!event.target.value) setSelectedCountry('')
                }}
              />
              {filteredCountries.length > 0 && (
                <Combobox.Options id="autocomplete-list">
                  {filteredCountries.map((flag) => (
                    <Combobox.Option 
                      key={flag.country} 
                      value={flag.country} 
                      className={({ focus }) => 
                        `autocomplete-item ${focus ? 'highlighted' : ''}`
                      }
                    >
                      {flag.country}
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              )}
            </Combobox>
          </div>
          
          {gameState === 'input' && (
            <button id="main-btn" onClick={handleSubmit}>
              Submit
            </button>
          )}
          
          {gameState === 'feedback' && (
            <button id="main-btn" onClick={handleNext}>
              {currentFlagIndex >= 4 ? 'Finish Game' : 'Next Flag'}
            </button>
          )}
        </div>
        
        <div id="feedback-section">
          <div 
            id="feedback" 
            className={feedback ? (feedback.isCorrect ? 'correct' : 'incorrect') : 'hidden'}
          >
            {feedback ? feedback.message : '\u00A0'}
          </div>
        </div>
      </main>
    </>
  )
}

export default GameView