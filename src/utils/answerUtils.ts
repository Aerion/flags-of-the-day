export const normalizeAnswer = (answer: string): string => {
  return answer.toLowerCase().trim()
    .replace(/^the\s+/, '')
    .replace(/\s+/g, ' ')
}
