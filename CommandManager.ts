import { InvocationContext } from "./CommandInfo";
import { Command } from "./Command";
import { DiscordContext } from "./discord/DiscordContext";
import { CommandArgumentType } from "./CommandArgumentsMap";

export class CommandManager {
    private commandsLookup: { [commandName: string]: Command };
    constructor(commands: Command[]) {

        const distinctCommandNames = Array.from(new Set(commands.map(c => c.name)));
        if (distinctCommandNames.length != commands.length) {
            throw new Error(`All command names must be unique!`);
        }

        this.commandsLookup = commands.reduce((acc, next) => ({ ...acc, [next.name]: next }), {});
    }

    invoke(invoicationContext: InvocationContext, discordContext: DiscordContext) {

        const targetCommand = this.commandsLookup[invoicationContext.name];
        if (!targetCommand) {
            throw new Error(`Cannot find a command with name ${invoicationContext.name}!`);
        }

        const args = this.resolveArguments(invoicationContext, targetCommand);
        targetCommand.invoke.apply(targetCommand, [discordContext, ...args]);

        return null;
    }

    private resolveArguments(invocationContext: InvocationContext, command: Command): (string | string[])[] {
        const mappedArguments: { [key: string]: boolean } = {};
        return command.argumentsMap.map(requiredArgument => {
            const { name, index, isCatchAll, isRequired, type } = requiredArgument;
            if (type === CommandArgumentType.mentions) {
                return null;
            }

            const providedNamedArgument = invocationContext.arguments.find(
                providedArgument => providedArgument.name && providedArgument.name === name
            );

            if (providedNamedArgument) {
                mappedArguments[index] = true;
                return providedNamedArgument.value;
            }

            const providedArgumentByIndex = invocationContext.arguments.length > index ? invocationContext.arguments[index] : null;
            if (providedArgumentByIndex && !mappedArguments[index]) {
                mappedArguments[index] = true;
                return providedArgumentByIndex.value;
            }

            // catch all arguments may only appear at the end of the list
            if (isCatchAll && !mappedArguments[index]) {
                const catchedValues = [] as string[];
                let cursorIndex = index;
                while (true) {

                    // we exit as soon as we find argument mapped by some other parameter
                    if (mappedArguments[cursorIndex]) {
                        break;
                    }

                    catchedValues.unshift(invocationContext.arguments[cursorIndex].value);
                    mappedArguments[cursorIndex] = true;

                    cursorIndex--;
                }

                return catchedValues;
            }

            if (!isRequired) {
                return null;
            }

            throw new Error(`Value for required argument ${requiredArgument.name ?? requiredArgument.index} is not provided!`);
        });
    }
}
