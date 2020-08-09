import { GuildContext } from "../discord/GuildContext";
import { Language, defaulLanguage } from "./Language";
import { RequiresGuildInitialization } from "../bootstrapper/RequiresGuildInitialization";
import { GuildSource } from "../bootstrapper";
import { KeyValueStorage } from "../storage";

const storageLanguageKey = 'lang';
let currentLanguage: Language = defaulLanguage;

export class LanguageManager implements RequiresGuildInitialization {
    name = "LanguageManager";
    context: GuildContext;

    constructor(private globalStorage: GuildSource<KeyValueStorage>) {

    }

    initializeGuild(): Promise<void> {
        return this.globalStorage.ensure(this.context).then(storage => {
            return storage.get<Language>(storageLanguageKey).then(language => ({ language, storage }));
        }).then(({ language, storage }) => {
            if (language) {
                currentLanguage = language;
            }
            else {
                return storage.set(storageLanguageKey, currentLanguage);
            }
        });
    }

    getCurrentLanguage(): Language {
        return currentLanguage;
    }

    setCurrentLanguage(value: Language) {
        currentLanguage = value;
        return this.globalStorage.ensure(this.context).then(storage => storage.set(storageLanguageKey, currentLanguage));
    }
}
