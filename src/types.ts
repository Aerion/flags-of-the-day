import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'
import frLocale from 'i18n-iso-countries/langs/fr.json'
import { countries as countriesData } from 'countries-list'
import { CAPITALS_FR } from './data/capitalsFr'

// Register locales
countries.registerLocale(enLocale)
countries.registerLocale(frLocale)

export interface FlagData {
  country: string
  countryFr: string
  code: string
  capital: string
  capitalFr: string
}

// Territories to exclude: only those that share the same flag content with their parent countries
// Based on hashes of the svg flags
const EXCLUDED_CODES = new Set([
  // French territories sharing flag with France (FR)
  'GF', // French Guiana
  'GP', // Guadeloupe
  'MF', // Saint Martin
  'PM', // Saint Pierre and Miquelon
  'RE', // Réunion
  'WF', // Wallis and Futuna
  'YT', // Mayotte
  // Other territories sharing flags with parent countries
  'BV', // Bouvet Island (shares flag with NO)
  'HM', // Heard Island and McDonald Islands (shares flag with AU)
  'SH', // Saint Helena (shares flag with GB)
  'DG', // Diego Garcia (shares flag with IO),
  'SJ', // Svalbard and Jan Mayen (shares flag with NO)
  'BQ', // Bonaire, Sint Eustatius and Saba (shares flag with NL)
])

const countryCodes = Object.keys(countries.getNames('en', { select: 'official' }))
export const FLAGS: FlagData[] = countryCodes
  .filter((code: string) => !EXCLUDED_CODES.has(code))
  .map((code: string) => {
    const country = countries.getName(code, 'en') || ''
    const countryFr = countries.getName(code, 'fr') || ''
    const capital = (countriesData as Record<string, { capital?: string }>)[code]?.capital ?? ''
    const capitalFr = CAPITALS_FR[code] ?? capital
    return {
      country,
      countryFr,
      code: code.toLowerCase(),
      capital,
      capitalFr,
    }
  })
  .filter((flag: FlagData) => flag.country && flag.countryFr) // Filter out any entries without names

export const VALID_CAPITALS_FR: string[] = [...new Set(FLAGS.map(f => f.capitalFr).filter(Boolean))]
export const VALID_CAPITALS_EN: string[] = [...new Set(FLAGS.map(f => f.capital).filter(Boolean))]