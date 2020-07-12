import { MessageContext } from "../discord";
import { LanguageManager, Language } from "../localization";
import { KeyValueStorage } from "../storage";
import { Config } from "../Config";

export type CommandContext = {
    languageManager: LanguageManager;
    storage: KeyValueStorage;
    currentLanguage: Language;
    config: Config;
} & MessageContext;