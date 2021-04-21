export interface Language {
    extension: string;
    language: string;
}

const plainTextLang: Language = {
    extension: 'txt',
    language: 'plaintext',
};

const [extsByLang, langsByExt] = (() => {
    // TODO: get a proper list of languages
    const languages: Language[] = [
        { extension: 'js', language: 'javascript' },
        { extension: 'js', language: 'coffeescript' },
        { extension: 'md', language: 'markdown' },
        plainTextLang,
    ];

    return [
        new Map(languages.map(language => [language.language, language])),
        new Map(
            languages
                .filter(
                    (language, index) =>
                        languages.findIndex(
                            lang => lang.extension === language.extension,
                        ) === index,
                )
                .map(language => [language.extension, language]),
        ),
    ];
})();

export const getExtFromLang = (language?: string): Language => {
    if (!language || !extsByLang.has(language)) {
        return plainTextLang;
    }

    return extsByLang.get(language)!;
};

export const getLangFromExt = (extension: string): Language => {
    return langsByExt.get(extension) ?? plainTextLang;
};
