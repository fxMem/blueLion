export type Language = 'ENG' | 'RU';
export const allLanguages: Language[] = ['ENG', 'RU']

export const defaulLanguage: Language = 'ENG';

let currentLanguage: Language = defaulLanguage;

export function getCurrentLanguage() {
    return currentLanguage;
}

export function setCurrentLanguage(language: Language) {
    currentLanguage = language
}
