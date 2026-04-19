import React, { useState, useEffect } from 'react'
import { useGameLogic } from './hooks/useGameLogic'
import { useBonusRound } from './hooks/useBonusRound'
import { useTranslation } from './hooks/useTranslation'
import GameView from './components/GameView'
import ResultsView from './components/ResultsView'
import CapitalBonusView from './components/CapitalBonusView'

type Phase = 'playing' | 'results' | 'bonus'

const FlagGame: React.FC = () => {
  const { t } = useTranslation()
  const {
    currentFlagIndex,
    score,
    userAnswers,
    hasPlayedToday,
    gameStarted,
    dailyFlags,
    dayNumber,
    submitGuess,
    nextFlag,
    saveGameData
  } = useGameLogic()

  const {
    bonusIndex,
    bonusAnswers,
    hasPlayedBonus,
    submitCapitalGuess,
    nextCapital,
    saveBonusData,
  } = useBonusRound(dailyFlags)

  const [phase, setPhase] = useState<Phase>('playing')

  useEffect(() => {
    if (hasPlayedToday) {
      setPhase('results')
    }
  }, [hasPlayedToday])

  const handleGameComplete = () => {
    saveGameData()
    setPhase('results')
  }

  const handlePlayBonus = () => {
    setPhase('bonus')
  }

  const handleBonusComplete = () => {
    saveBonusData()
    setPhase('results')
  }

  if (!gameStarted && !hasPlayedToday) {
    return <div>{t('loading')}</div>
  }

  return (
    <div id="app">
      {phase === 'playing' && (
        <GameView
          currentFlagIndex={currentFlagIndex}
          dailyFlags={dailyFlags}
          submitGuess={submitGuess}
          nextFlag={nextFlag}
          onGameComplete={handleGameComplete}
        />
      )}
      {phase === 'results' && (
        <ResultsView
          score={score}
          dailyFlags={dailyFlags}
          userAnswers={userAnswers}
          dayNumber={dayNumber}
          bonusAnswers={hasPlayedBonus ? bonusAnswers : undefined}
          onPlayBonus={hasPlayedBonus ? undefined : handlePlayBonus}
        />
      )}
      {phase === 'bonus' && (
        <CapitalBonusView
          bonusIndex={bonusIndex}
          dailyFlags={dailyFlags}
          submitCapitalGuess={submitCapitalGuess}
          nextCapital={nextCapital}
          onBonusComplete={handleBonusComplete}
        />
      )}
    </div>
  )
}

export default FlagGame
