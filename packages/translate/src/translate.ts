const translations: {[index: string]: {[index: string]: string}} = {}

export const translate = async (string: string, language: NavigatorLanguage['language'] = 'nl') => {
  if (!translations[language]) translations[language] = (await import(`./translations/${language}.json`)).default
  const translation = translations[language][string]
  return translation || string
}
