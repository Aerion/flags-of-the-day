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

// Territories to exclude: only those that share the same flag content with their parent countries
// Based on hashes of the svg flags
const EXCLUDED_CODES = new Set([
  // French territories sharing flag with France (FR)
  'BL', // Saint Barthélemy
  'GF', // French Guiana
  'GP', // Guadeloupe
  'MF', // Saint Martin
  'PM', // Saint Pierre and Miquelon
  'RE', // Réunion
  'WF', // Wallis and Futuna
  'YT', // Mayotte
  // Other territories sharing flags with parent countries
  'HM', // Heard Island and McDonald Islands (shares flag with AU)
  'SH', // Saint Helena (shares flag with GB)
  'DG', // Diego Garcia (shares flag with IO)
])

const countryCodes = Object.keys(countries.getNames('en', { select: 'official' }))
export const FLAGS: FlagData[] = countryCodes
  .filter((code: string) => !EXCLUDED_CODES.has(code))
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