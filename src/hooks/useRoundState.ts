import { useState, useEffect, useRef } from 'react'
import { useAnimations } from './useAnimations'

interface UseRoundStateOptions {
  index: number
  submitFn: (guess: string) => boolean
  isValidAnswer: (query: string) => boolean
  onComplete: () => void
  onNext: () => void
}

export const useRoundState = ({ index, submitFn, isValidAnswer, onComplete, onNext }: UseRoundStateOptions) => {
  const [query, setQuery] = useState('')
  const [roundState, setRoundState] = useState<'input' | 'feedback'>('input')
  const [feedback, setFeedback] = useState<{ isCorrect: boolean } | null>(null)
  const [flagImageLoaded, setFlagImageLoaded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const justSubmittedRef = useRef(false)
  const { flagCelebrating, buttonSuccess, triggerSuccessAnimation, triggerFeedbackAnimation, resetAnimations } = useAnimations()

  useEffect(() => {
    setQuery('')
    setRoundState('input')
    setFeedback(null)
    setFlagImageLoaded(false)
    resetAnimations()
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }, [index, resetAnimations])

  const handleNext = () => {
    if (index >= 4) {
      onComplete()
    } else {
      onNext()
    }
  }

  useEffect(() => {
    const handleGlobalKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && roundState === 'feedback') {
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
  }, [roundState, index, onComplete, onNext])

  const handleSubmit = () => {
    const guess = query.trim()
    if (!guess || !isValidAnswer(query)) return

    const isCorrect = submitFn(guess)

    setFeedback({ isCorrect })

    if (isCorrect) {
      triggerSuccessAnimation()
    } else {
      triggerFeedbackAnimation()
    }

    setRoundState('feedback')
    inputRef.current?.blur()
  }

  return {
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
  }
}
