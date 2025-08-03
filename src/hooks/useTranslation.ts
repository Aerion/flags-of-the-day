import { useMemo } from 'react'
import { translations, type Language, type TranslationKey } from '../i18n'

export const useTranslation = () => {
  const language: Language = useMemo(() => {
    const browserLanguage = navigator.language.toLowerCase()
    return browserLanguage.startsWith('fr') ? 'fr' : 'en'
  }, [])

  const t = useMemo(() => {
    const translate = (key: TranslationKey, params?: Record<string, string | number>): string => {
      let text = translations[language][key]
      
      if (params) {
        Object.entries(params).forEach(([param, value]) => {
          text = text.replace(`{${param}}`, String(value))
        })
      }
      
      return text
    }
    
    return translate
  }, [language])

  return { t, language }
}