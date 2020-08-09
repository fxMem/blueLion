import { InvocationContext } from "./CommandInfo";
import { Command, invokeCommand } from "./Command";
import { MessageContext } from "../discord";
import { GuildInitializerResult, GuildSource } from "../bootstrapper";
import { KeyValueStorage } from "../storage";
import { LanguageManager } from "../localization";
import { Config } from "../Config";

export class CommandManager {
    private commandsLookup: { [commandName: string]: Command };
    constructor(
        commands: Command[],
        private config: Config,
        private globalStorageInitializer: GuildSource<KeyValueStorage>,
        private languageManagerInitializer: GuildInitializerResult<LanguageManager>
    ) {

        const distinctCommandNames = Array.from(new Set(commands.map(c => c.name)));
        if (distinctCommandNames.length != commands.length) {
            throw new Error(`All command names must be unique!`);
        }

        this.commandsLookup = commands.reduce((acc, next) => ({ ...acc, [next.name]: next }), {});
    }

    invoke(invoicationContext: InvocationContext, messageContext: MessageContext): Promise<Promise<void> | void> {

        const targetCommand = this.commandsLookup[invoicationContext.name];
        if (!targetCommand) {
            throw new Error(`Cannot find a command with name ${invoicationContext.name}!`);
        }

        return invokeCommand(
            targetCommand,
            this.config,
            invoicationContext.arguments,
            messageContext,
            this.globalStorageInitializer,
            this.languageManagerInitializer
        );
    }
}
