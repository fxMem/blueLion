import { Language } from "./Language";
import { LocalizedString, localizedStringBuilder } from "./LocalizedString";

export type Localization = {
    [key: string]: LocalizedString;
}

export function buildLocalization<T extends LocalizationConfig>(config: T): { [key in keyof T]: LocalizedString } {
    const result: any = {};
    for (const propertyName in config) {
        result[propertyName as string] = localizedStringBuilder(config[propertyName]);
    }

    return result;
}

export type LocalizationConfig = {
    [key: string]: LocalizationData;
};

export type LocalizationData = Partial<{
    [key in Language]: string
}>;