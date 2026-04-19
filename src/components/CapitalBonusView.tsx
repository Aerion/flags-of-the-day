import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Combobox } from '@headlessui/react'
import Fuse from 'fuse.js'
import type { FlagData } from '../types'
import { VALID_CAPITALS } from '../types'
import { useTranslation } from '../hooks/useTranslation'
import { useAnimations } from '../hooks/useAnimations'
import { getDayNumber } from '../utils/dateUtils'
import { normalizeAnswer } from '../utils/answerUtils'

type BonusState = 'input' | 'feedback'

interface CapitalBonusViewProps {
  bonusIndex: number
  dailyFlags: FlagData[]
  submitCapitalGuess: (guess: string) => boolean
  nextCapital: () => void
  onBonusComplete: () => void
}

const CapitalBonusView: React.FC<CapitalBonusViewProps> = ({
  bonusIndex,
  dailyFlags,
  submitCapitalGuess,
  nextCapital,
  onBonusComplete,
}) => {
  const { t, language } = useTranslation()
  const [query, setQuery] = useState('')
  const [feedback, setFeedback] = useState<{ isCorrect: boolean } | null>(null)
  const [bonusState, setBonusState] = useState<BonusState>('input')
  const { flagCelebrating, buttonSuccess, triggerSuccessAnimation, triggerFeedbackAnimation, resetAnimations } = useAnimations()
  const [flagImageLoaded, setFlagImageLoaded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const justSubmittedRef = useRef(false)

  const capitalItems = useMemo(() => VALID_CAPITALS.map(c => ({ capital: c })), [])

  const fuse = useMemo(() => new Fuse(capitalItems, {
    keys: ['capital'],
    includeScore: true,
    ignoreDiacritics: true,
    ignoreLocation: true,
  }), [capitalItems])

  const filteredCapitals = useMemo(() => {
    if (query.length < 2) return []
    return fuse.search(query, { limit: 5 }).map(result => result.item.capital)
  }, [query, fuse])

  const currentFlag = dailyFlags[bonusIndex]

  const isValidCapital = useMemo(() => {
    const trimmed = query.trim()
    if (!trimmed) return false
    const normalized = normalizeAnswer(trimmed)
    return VALID_CAPITALS.some(c => normalizeAnswer(c) === normalized)
  }, [query])

  useEffect(() => {
    setQuery('')
    setBonusState('input')
    setFeedback(null)
    setFlagImageLoaded(false)
    resetAnimations()
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }, [bonusIndex, resetAnimations])

  const handleNext = () => {
    if (bonusIndex >= 4) {
      onBonusComplete()
    } else {
      nextCapital()
    }
  }

  useEffect(() => {
    const handleGlobalKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && bonusState === 'feedback') {
        if (justSubmittedRef.current) {
          justSubmittedRef.current = false
          return
        }
        e.preventDefault()
        handleNext()
      }
    }

    document.addEventListener('keydown', handleGlobalKeydown)
    return () => document.removeEventListener('keydown', handleGlobalKeydown)
  }, [bonusState, bonusIndex, onBonusComplete, nextCapital])

  const handleSubmit = () => {
    const guess = query.trim()
    if (!guess) return

    const isCorrect = submitCapitalGuess(guess)

    setFeedback({ isCorrect })

    if (isCorrect) {
      triggerSuccessAnimation()
    } else {
      triggerFeedbackAnimation()
    }

    setBonusState('feedback')
  }

  const countryName = language === 'fr' ? currentFlag.countryFr : currentFlag.country

  return (
    <>
      <header>
        <h1>{t('flagOfTheDay')} #{getDayNumber()}</h1>
        <p id="progress">{t('capitalProgress', { current: bonusIndex + 1, total: 5 })}</p>
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
              <>
                {!flagImageLoaded && <div className="flag-placeholder" />}
                <img
                  src={`/flags/${currentFlag.code}.svg`}
                  alt=""
                  style={{ display: flagImageLoaded ? undefined : 'none' }}
                  onLoad={() => setFlagImageLoaded(true)}
                />
              </>
            )}
            <div className="flag-name-country">{countryName}</div>
            {feedback && !feedback.isCorrect && (
              <div className="flag-name-overlay">{currentFlag.capital}</div>
            )}
          </div>
        </div>

        <div id="game-area">
          <div id="autocomplete-container" style={{ position: 'relative' }}>
            <Combobox value={query} onChange={(value) => {
              setQuery(value || '')
            }} disabled={bonusState !== 'input'}>
              <Combobox.Input
                ref={inputRef}
                key={bonusIndex}
                id="country-input"
                placeholder={t('whichCapital')}
                autoComplete="off"
                enterKeyHint="done"
                displayValue={() => query}
                onChange={(event) => {
                  setQuery(event.target.value)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isValidCapital && bonusState === 'input') {
                    e.preventDefault()
                    justSubmittedRef.current = true
                    handleSubmit()
                  }
                }}
              />
              {filteredCapitals.length > 0 && (
                <Combobox.Options id="autocomplete-list">
                  {filteredCapitals.map((capital) => (
                    <Combobox.Option
                      key={capital}
                      value={capital}
                      className={({ focus }) =>
                        `autocomplete-item ${focus ? 'highlighted' : ''}`
                      }
                    >
                      {capital}
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              )}
            </Combobox>
          </div>

          {bonusState === 'input' && (
            <button
              id="main-btn"
              className={buttonSuccess ? 'button-success' : ''}
              onClick={handleSubmit}
              disabled={!isValidCapital}
            >
              {t('submit')}
            </button>
          )}

          {bonusState === 'feedback' && (
            <button id="main-btn" onClick={handleNext}>
              {bonusIndex >= 4 ? t('finishBonus') : t('nextCapital')}
            </button>
          )}
        </div>
      </main>
    </>
  )
}

export default CapitalBonusView
