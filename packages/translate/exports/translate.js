const translations = {};
const setupTranslations = async (language = 'nl') => {
    translations[language] = (await import(`./translations/${language}.js`)).default;
};
const translate = async (string, language = 'nl') => {
    if (!translations[language])
        return string;
    if (!translations[language][string]) {
        const translations = await translate(string, language);
        translations[language][string] = translations;
    }
    return translations[language][string];
};

export { setupTranslations, translate };
