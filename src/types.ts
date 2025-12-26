import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'
import frLocale from 'i18n-iso-countries/langs/fr.json'

// Register locales
countries.registerLocale(enLocale)
countries.registerLocale(frLocale)

export interface FlagData {
  country: string
  countryFr: string
  code: string
}

// Generate FLAGS array from i18n-iso-countries
const countryCodes = Object.keys(countries.getNames('en', { select: 'official' }))
export const FLAGS: FlagData[] = countryCodes
  .map((code: string) => {
    const country = countries.getName(code, 'en') || ''
    const countryFr = countries.getName(code, 'fr') || ''
    return {
      country,
      countryFr,
      code: code.toLowerCase()
    }
  })
  .filter((flag: FlagData) => flag.country && flag.countryFr) // Filter out any entries without names