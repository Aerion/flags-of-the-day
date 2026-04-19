import React, { useMemo } from 'react'
import { Combobox } from '@headlessui/react'
import Fuse from 'fuse.js'
import type { FlagData } from '../types'
import { VALID_CAPITALS_FR, VALID_CAPITALS_EN } from '../types'
import { useTranslation } from '../hooks/useTranslation'
import { getDayNumber } from '../utils/dateUtils'
import { normalizeAnswer } from '../utils/answerUtils'
import { useRoundState } from '../hooks/useRoundState'

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

  const validCapitals = language === 'fr' ? VALID_CAPITALS_FR : VALID_CAPITALS_EN
  const capitalItems = useMemo(() => validCapitals.map(c => ({ capital: c })), [validCapitals])

  const fuse = useMemo(() => new Fuse(capitalItems, {
    keys: ['capital'],
    includeScore: true,
    ignoreDiacritics: true,
    ignoreLocation: true,
  }), [capitalItems])

  const isValidCapital = (query: string) => {
    const trimmed = query.trim()
    if (!trimmed) return false
    const normalized = normalizeAnswer(trimmed)
    return validCapitals.some(c => normalizeAnswer(c) === normalized)
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
    index: bonusIndex,
    submitFn: submitCapitalGuess,
    isValidAnswer: isValidCapital,
    onComplete: onBonusComplete,
    onNext: nextCapital,
  })

  const filteredCapitals = useMemo(() => {
    if (query.length < 2) return []
    return fuse.search(query, { limit: 5 }).map(result => result.item.capital)
  }, [query, fuse])

  const currentFlag = dailyFlags[bonusIndex]
  const isValid = isValidCapital(query)
  const countryName = language === 'fr' ? currentFlag.countryFr : currentFlag.country
  const capitalName = language === 'fr' ? currentFlag.capitalFr : currentFlag.capital

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
              <div className="flag-name-overlay">{capitalName}</div>
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
                  if (e.key === 'Enter' && isValid && roundState === 'input') {
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
              {bonusIndex >= 4 ? t('finishBonus') : t('nextCapital')}
            </button>
          )}
        </div>
      </main>
    </>
  )
}

export default CapitalBonusView
