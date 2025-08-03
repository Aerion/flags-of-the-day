import React, { useState, useEffect } from 'react'
import { useGameLogic } from './hooks/useGameLogic'
import GameView from './components/GameView'
import ResultsView from './components/ResultsView'

const FlagGame: React.FC = () => {
  const {
    currentFlagIndex,
    score,
    userAnswers,
    hasPlayedToday,
    gameStarted,
    dailyFlags,
    submitGuess,
    nextFlag,
    saveGameData,
    getDayNumber,
    getTimeUntilNextGame
  } = useGameLogic()

  const [gamePhase, setGamePhase] = useState<'playing' | 'results'>('playing')

  useEffect(() => {
    if (hasPlayedToday) {
      setGamePhase('results')
    }
  }, [hasPlayedToday])

  const handleGameComplete = () => {
    saveGameData()
    setGamePhase('results')
  }

  if (!gameStarted && !hasPlayedToday) {
    return <div>Loading...</div>
  }

  return (
    <div id="app">
      {gamePhase === 'playing' ? (
        <GameView
          currentFlagIndex={currentFlagIndex}
          dailyFlags={dailyFlags}
          submitGuess={submitGuess}
          nextFlag={nextFlag}
          onGameComplete={handleGameComplete}
          getDayNumber={getDayNumber}
        />
      ) : (
        <ResultsView
          score={score}
          dailyFlags={dailyFlags}
          userAnswers={userAnswers}
          getDayNumber={getDayNumber}
          getTimeUntilNextGame={getTimeUntilNextGame}
        />
      )}
    </div>
  )
}

export default FlagGame