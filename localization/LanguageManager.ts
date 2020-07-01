import { GuildContext } from "../discord/GuildContext";
import { globalStorage } from "../storage/ChannelStorage";
import { Language, defaulLanguage } from "./Language";
import { RequiresGuildInitialization } from "../bootstrapper/RequiresGuildInitialization";

const storageLanguageKey = 'lang';
let currentLanguage: Language = defaulLanguage;

export class LanguageManager implements RequiresGuildInitialization {
    context: GuildContext;

    initializeGuild(context: GuildContext): Promise<void> {
        return globalStorage.ensure(context).then(storage => {
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
        return globalStorage.ensure(this.context).then(storage => storage.set(storageLanguageKey, currentLanguage));
    }
}

export const languageManager = globalStorage.chain(new LanguageManager());