import React from 'react'
import { useGameLogic } from './hooks/useGameLogic'
import { useTranslation } from './hooks/useTranslation'
import GameView from './components/GameView'
import ResultsView from './components/ResultsView'

const FlagGame: React.FC = () => {
  const { t } = useTranslation()
  const {
    currentFlagIndex,
    score,
    userAnswers,
    hasPlayedToday,
    gameStarted,
    dailyFlags,
    submitGuess,
    nextFlag,
    saveGameData
  } = useGameLogic()

  const isGameComplete = hasPlayedToday || currentFlagIndex >= 5

  const handleGameComplete = () => {
    saveGameData()
  }

  if (!gameStarted && !hasPlayedToday) {
    return <div>{t('loading')}</div>
  }

  return (
    <div id="app">
      {!isGameComplete ? (
        <GameView
          currentFlagIndex={currentFlagIndex}
          dailyFlags={dailyFlags}
          submitGuess={submitGuess}
          nextFlag={nextFlag}
          onGameComplete={handleGameComplete}
        />
      ) : (
        <ResultsView
          score={score}
          dailyFlags={dailyFlags}
          userAnswers={userAnswers}
        />
      )}
    </div>
  )
}

export default FlagGame