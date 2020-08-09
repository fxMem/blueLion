import { MessageHook } from "../hooks/MessageHook";
import { GuildContext, MessageContext } from "../discord";
import { createLocalLogScope } from "../log";
import { CommandParser } from "./CommandParser";
import { CommandManager } from "./CommandManager";
import { GuildSource } from "../bootstrapper";

export class CommandMessageHook implements MessageHook {
    context: GuildContext;
    name = 'CommandMessageHook';
    private log = createLocalLogScope('CommandMessageHook');

    constructor(
        private commandParser: CommandParser,
        private commandManagerSource: GuildSource<CommandManager>) {

    }

    initializeGuild() {
        return Promise.resolve();
    }

    run(context: MessageContext) {
        const commandContext = this.commandParser.parse(context.content);
        if (!commandContext) {
            return;
        }

        this.log.info(`Message from Guild ${context.guild.name}: ${context.content}`);
        this.commandManagerSource.ensure(this.context).then(commandManager => {
            try {
                commandManager.invoke(commandContext, context).catch(error => {
                    handleException(error);
                });
            } catch (error) {
                handleException(error);
            }
        });
        
        function handleException(error) {
            const errorMessage = (error as Error).message;
            context.reply(`Error! ${errorMessage}`);
        }
    }
}
