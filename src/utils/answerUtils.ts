export const normalizeAnswer = (answer: string): string => {
  return answer.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/^the\s+/, '')
    .replace(/\s+/g, ' ')
}
