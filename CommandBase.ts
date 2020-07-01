import { Command, invokeCommand } from "./Command";
import { LocalizedString } from "./localization/LocalizedString";
import { AggregateCommand } from "./AggregateCommand";
import { build, required, optional, CommandArgumentMetadata } from "./CommandArgumentsMap";
import { GuildContext } from "./discord/GuildContext";
import { CommandArgument } from "./CommandArgument";
import { Language } from "./localization/Language";
import { languageManager, LanguageManager } from "./localization/LanguageManager";
import { ChannelStorage, globalStorage } from "./storage/ChannelStorage";

export class CommandBase implements Command {
    name: string;
    argumentsMap: CommandArgumentMetadata[];
    languageManager: LanguageManager;
    storage: ChannelStorage;
    currentLanguage: Language;
    context: GuildContext;

    invoke(context: GuildContext, ...args: any[]): Promise<void> | void {
        this.context = context;
        languageManager.ensure(context).then(manager => {
            this.languageManager = manager;
            this.currentLanguage = manager.getCurrentLanguage();
            return globalStorage.ensure(context);
        }).then(storage => {
            this.storage = storage;
            this.doInvoke.apply(this, args);
        })
    }

    doInvoke(...args: any[]) {

    }
}