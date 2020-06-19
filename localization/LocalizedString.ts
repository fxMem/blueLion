import { defaulLanguage, getCurrentLanguage } from "./Language";
import { LocalizationData, LocalizationConfig } from "./Localization";

export type LocalizedString = (...parameters: string[]) => string;

export function localizedStringBuilder(name: LocalizationData): LocalizedString {
    return (...parameters: string[]) => format(name[getCurrentLanguage()] ?? name[defaulLanguage], parameters);
}

// trimmed version of https://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format/4673436#4673436
function format(rawString: string, parameters: string[]) {
    return rawString.replace(/{(\d+)}/g, function (match, number) {
        return typeof parameters[number] != 'undefined'
            ? parameters[number]
            : match;
    });
};


