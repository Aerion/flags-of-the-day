export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0]
}

export const getDayNumber = (): number => {
  const startDate = new Date('2025-08-01T00:00:00.000Z')
  const today = new Date(getTodayString() + 'T00:00:00.000Z')
  const diffTime = today.getTime() - startDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return diffDays + 1
}

export const getTimeUntilNextGame = (): { hours: number; minutes: number; seconds: number } => {
  const now = new Date()

  const tomorrowUtc = new Date(now)
  tomorrowUtc.setUTCDate(tomorrowUtc.getUTCDate() + 1)
  tomorrowUtc.setUTCHours(0, 0, 0, 0)

  const timeLeft = tomorrowUtc.getTime() - now.getTime()
  const hours = Math.floor(timeLeft / (1000 * 60 * 60))
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)

  return { hours, minutes, seconds }
}