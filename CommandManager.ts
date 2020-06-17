import { InvocationContext } from "./CommandInfo";
import { Command, invokeCommand } from "./Command";
import { DiscordContext } from "./discord/DiscordContext";
import { CommandArgumentType, CommandArgumentMetadata, resolveArguments } from "./CommandArgumentsMap";

export class CommandManager {
    private commandsLookup: { [commandName: string]: Command };
    constructor(commands: Command[]) {

        const distinctCommandNames = Array.from(new Set(commands.map(c => c.name)));
        if (distinctCommandNames.length != commands.length) {
            throw new Error(`All command names must be unique!`);
        }

        this.commandsLookup = commands.reduce((acc, next) => ({ ...acc, [next.name]: next }), {});
    }

    invoke(invoicationContext: InvocationContext, discordContext: DiscordContext): void {

        const targetCommand = this.commandsLookup[invoicationContext.name];
        if (!targetCommand) {
            throw new Error(`Cannot find a command with name ${invoicationContext.name}!`);
        }

        invokeCommand(targetCommand, invoicationContext.arguments, discordContext);
    }
}
