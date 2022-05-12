export interface Language {
    extension: string;
    names: string[];
}

const plainTextLang: Language = {
    extension: 'txt',
    names: ['plaintext'],
};

const [extsByLang, langsByExt] = (() => {
    // TODO: get a proper list of languages
    const languages: Language[] = [
        { extension: 'html', names: ['html'] },
        { extension: 'css', names: ['css'] },
        { extension: 'js', names: ['javascript', 'coffeescript'] },
        { extension: 'ts', names: ['typescript'] },
        { extension: 'py', names: ['python'] },
        { extension: 'java', names: ['java'] },
        { extension: 'cs', names: ['csharp'] },
        { extension: 'json', names: ['json'] },
        { extension: 'sh', names: ['bash'] },
        { extension: 'md', names: ['markdown'] },
        { extension: 'diff', names: ['diff'] },
        plainTextLang,
    ];

    return [
        new Map(languages.map(language => [language.names[0], language])),
        new Map(
            languages.flatMap(language =>
                language.names.map(name => [language.extension, language]),
            ),
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
