import React, { useMemo } from 'react'
import { Combobox } from '@headlessui/react'
import Fuse from 'fuse.js'
import type { FlagData } from '../types'
import { FLAGS } from '../types'
import { useTranslation } from '../hooks/useTranslation'
import { getDayNumber } from '../utils/dateUtils'
import { normalizeAnswer } from '../utils/answerUtils'
import { useRoundState } from '../hooks/useRoundState'

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

  const fuse = useMemo(() => new Fuse(FLAGS, {
    keys: language === 'fr' ? ['countryFr'] : ['country'],
    includeScore: true,
    ignoreDiacritics: true,
    ignoreLocation: true,
  }), [language])

  const isValidCountry = (query: string) => {
    const trimmed = query.trim()
    if (!trimmed) return false
    const normalized = normalizeAnswer(trimmed)
    return FLAGS.some(flag =>
      normalizeAnswer(flag.country) === normalized ||
      normalizeAnswer(flag.countryFr) === normalized
    )
  }

  const {
    query,
    setQuery,
    roundState,
    feedback,
    flagImageLoaded,
    setFlagImageLoaded,
    handleSubmit,
    handleNext,
    inputRef,
    justSubmittedRef,
    flagCelebrating,
    buttonSuccess,
  } = useRoundState({
    index: currentFlagIndex,
    submitFn: submitGuess,
    isValidAnswer: isValidCountry,
    onComplete: onGameComplete,
    onNext: nextFlag,
  })

  const filteredCountries = useMemo(() => {
    if (query.length < 2) return []
    return fuse.search(query, { limit: 5 }).map(result => result.item)
  }, [query, fuse])

  const currentFlag = dailyFlags[currentFlagIndex]
  const isValid = isValidCountry(query)

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
            }} disabled={roundState !== 'input'}>
              <Combobox.Input
                ref={inputRef}
                key={currentFlagIndex}
                id="country-input"
                placeholder={t('whichCountry')}
                autoComplete="off"
                enterKeyHint="done"
                displayValue={() => query}
                onChange={(event) => {
                  setQuery(event.target.value)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isValid && roundState === 'input') {
                    e.preventDefault()
                    justSubmittedRef.current = true
                    handleSubmit()
                  }
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

          {roundState === 'input' && (
            <button
              id="main-btn"
              className={buttonSuccess ? 'button-success' : ''}
              onClick={handleSubmit}
              disabled={!isValid}
            >
              {t('submit')}
            </button>
          )}

          {roundState === 'feedback' && (
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
