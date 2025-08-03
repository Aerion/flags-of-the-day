export const getTodayString = (): string => {
  const now = new Date()
  return new Date(now.getTime() + now.getTimezoneOffset() * 60000).toISOString().split('T')[0]
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
  const nowUtc = new Date(now.getTime() + now.getTimezoneOffset() * 60000)
  const tomorrowUtc = new Date(nowUtc)
  tomorrowUtc.setUTCDate(nowUtc.getUTCDate() + 1)
  tomorrowUtc.setUTCHours(0, 0, 0, 0)
  
  const timeLeft = tomorrowUtc.getTime() - nowUtc.getTime()
  const hours = Math.floor(timeLeft / (1000 * 60 * 60))
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)
  
  return { hours, minutes, seconds }
}