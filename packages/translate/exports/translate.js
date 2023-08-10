const translations = {};
const translate = async (string, language = 'nl') => {
    if (!translations[language])
        translations[language] = (await import(`./translations/${language}.json`)).default;
    const translation = translations[language][string];
    return translation || string;
};

export { translate };
