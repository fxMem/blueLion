import { Language } from "./Language";

export type LocalizationConfig = {
    [key: string]: localizationData;
};

export type localizationData = Partial<{
    [key in Language]: string
}>;