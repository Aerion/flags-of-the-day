import { en } from './en'
import { fr } from './fr'

export const translations = {
  en,
  fr
}

export type Language = keyof typeof translations
export type TranslationKey = keyof typeof en

export { en, fr }