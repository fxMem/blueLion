import { defaulLanguage, getCurrentLanguage } from "./Language";
import { localizationData } from "./LocalizationConfig";

export type LocalizedString = () => string;

export function localizedStringBuilder(name: localizationData): LocalizedString {
    return () => name[getCurrentLanguage()] ?? name[defaulLanguage];
}