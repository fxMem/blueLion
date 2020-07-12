import { Command } from "./Command";
import { CommandArgumentMetadata } from "./CommandArgumentsMap";
import { KeyValueStorage } from "../storage/KeyValueStorage";
import { LanguageManager, Language } from "../localization";
import { CommandContext } from "./CommandContext";
import { Config } from "../Config";

export class CommandBase implements Command {
    name: string;
    argumentsMap: CommandArgumentMetadata[];
    context: CommandContext;
    languageManager: LanguageManager;
    currentLanguage: Language;
    storage: KeyValueStorage;
    config: Config;

    invoke(context: CommandContext, ...args: any[]): Promise<void> | void {
        this.context = context;
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