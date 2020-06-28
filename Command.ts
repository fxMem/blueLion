import { CommandArgumentMetadata, resolveArguments } from "./CommandArgumentsMap";
import { GuildContext } from "./discord/GuildContext";
import { CommandArgument } from "./CommandArgument";
import { LocalizedString } from "./localization/LocalizedString";

export interface Command {
    name: string;
    description?: LocalizedString;
    invoke(context: GuildContext, ...args: (string | CommandArgument[])[]): void;
    argumentsMap: CommandArgumentMetadata[];
}

export function invokeCommand(command: Command, providedArguments: CommandArgument[], discordContext: GuildContext) {
    const args = resolveArguments(providedArguments, command.argumentsMap);
    command.invoke.apply(command, [discordContext, ...args]);
}