import { Command } from "./Command";
import { CommandArgumentMetadata } from "./CommandArgumentsMap";
import { Language } from "../localization/Language";
import { languageManager, LanguageManager } from "../localization/LanguageManager";
import { globalStorage } from "../storage/ChannelStorage";
import { KeyValueStorage } from "../storage/KeyValueStorage";
import { MessageContext } from "../discord/MessageContext";

export class CommandBase implements Command {
    name: string;
    argumentsMap: CommandArgumentMetadata[];
    languageManager: LanguageManager;
    storage: KeyValueStorage;
    currentLanguage: Language;
    context: MessageContext;

    invoke(context: MessageContext, ...args: any[]): Promise<void> | void {
        this.context = context;
        languageManager.ensure(context).then(manager => {
            this.languageManager = manager;
            this.currentLanguage = manager.getCurrentLanguage();
            return globalStorage.ensure(context);
        }).then(storage => {
            this.storage = storage;
            return this.doInvoke.apply(this, args);
        });
    }

    doInvoke(...args: any[]): Promise<void> | void {
        // to overrride
    }
}