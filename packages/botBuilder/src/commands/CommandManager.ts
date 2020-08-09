import { InvocationContext } from "./CommandInfo";
import { Command, invokeCommand } from "./Command";
import { MessageContext, GuildContext } from "../discord";
import { GuildInitializerResult, GuildSource, RequiresGuildInitialization } from "../bootstrapper";
import { KeyValueStorage } from "../storage";
import { LanguageManager } from "../localization";
import { Config } from "../Config";
import { HelpCommand } from "./HelpCommand";

export class CommandManager implements RequiresGuildInitialization {
    name = "CommandManager";
    context: GuildContext;

    private commandsLookup: { [commandName: string]: Command };
    constructor(
        private commands: GuildSource<Command>[],
        private config: Config,
        private globalStorage: GuildSource<KeyValueStorage>,
        private languageManager: GuildInitializerResult<LanguageManager>
    ) { }

    initializeGuild() {
        return Promise.all(this.commands.map(j => j.ensure(this.context))).then(commands => {
            const distinctCommandNames = Array.from(new Set(commands.map(c => c.name)));
            if (distinctCommandNames.length != commands.length) {
                throw new Error(`All command names must be unique!`);
            }

            if (distinctCommandNames.find(c => c === 'help')) {
                throw new Error(`Help is reserved system command name!`);
            }

            this.commandsLookup = [new HelpCommand(commands), ...commands].reduce((acc, next) => ({ ...acc, [next.name]: next }), {});
        });
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
            this.globalStorage,
            this.languageManager
        );
    }
}
