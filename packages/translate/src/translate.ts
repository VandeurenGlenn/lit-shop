const translations: { [index: string]: { [index: string]: string } } = {}

export const setupTranslations = async (language: NavigatorLanguage['language'] = 'nl') => {
  translations[language] = (await import(`./translations/${language}.js`)).default
}

export const translate = async (string: string, language: NavigatorLanguage['language'] = 'nl') => {
  if (!translations[language]) return string

  if (!translations[language][string]) {
    const translations = await translate(string, language)
    translations[language][string] = translations
  }
  return translations[language][string]
}
