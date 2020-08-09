import { Command } from "./Command";
import { CommandArgumentMetadata } from "./CommandArgumentsMap";
import { KeyValueStorage } from "../storage/KeyValueStorage";
import { LanguageManager, Language, LocalizedString } from "../localization";
import { CommandContext } from "./CommandContext";
import { Config } from "../Config";
import { GuildContext } from "../discord";

export class CommandBase implements Command {
    context: GuildContext;
    name: string;
    description?: LocalizedString;
    argumentsMap: CommandArgumentMetadata[];
    commandContext: CommandContext;
    languageManager: LanguageManager;
    currentLanguage: Language;
    storage: KeyValueStorage;
    config: Config;
    
    initializeGuild() { return Promise.resolve(); }

    invoke(context: CommandContext, ...args: any[]): Promise<void> | void {
        this.commandContext = context;
        this.languageManager = context.languageManager;
        this.storage = context.storage;
        this.currentLanguage = context.currentLanguage;
        this.config = context.config;
        return this.doInvoke.apply(this, args);
    }

    doInvoke(...args: any[]): Promise<void> | void {
        // to overrride
    }
}