import { useState, useCallback } from 'react'
import confetti from 'canvas-confetti'

interface AnimationState {
  flagCelebrating: boolean
  feedbackAnimating: boolean
  buttonSuccess: boolean
}

export const useAnimations = () => {
  const [animationState, setAnimationState] = useState<AnimationState>({
    flagCelebrating: false,
    feedbackAnimating: false,
    buttonSuccess: false
  })

  const triggerSuccessAnimation = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
    
    setAnimationState({
      flagCelebrating: true,
      feedbackAnimating: true,
      buttonSuccess: true
    })
    
    setTimeout(() => setAnimationState(prev => ({ ...prev, buttonSuccess: false })), 600)
    setTimeout(() => setAnimationState(prev => ({ ...prev, flagCelebrating: false })), 800)
    setTimeout(() => setAnimationState(prev => ({ ...prev, feedbackAnimating: false })), 500)
  }, [])

  const triggerFeedbackAnimation = useCallback(() => {
    setAnimationState(prev => ({ ...prev, feedbackAnimating: true }))
    setTimeout(() => setAnimationState(prev => ({ ...prev, feedbackAnimating: false })), 500)
  }, [])

  const resetAnimations = useCallback(() => {
    setAnimationState({
      flagCelebrating: false,
      feedbackAnimating: false,
      buttonSuccess: false
    })
  }, [])

  return {
    ...animationState,
    triggerSuccessAnimation,
    triggerFeedbackAnimation,
    resetAnimations
  }
}