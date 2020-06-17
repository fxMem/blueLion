import { CommandArgumentMetadata, resolveArguments } from "./CommandArgumentsMap";
import { DiscordContext } from "./discord/DiscordContext";
import { CommandArgument } from "./CommandArgument";
import { LocalizedString } from "./localization/LocalizedString";

export interface Command {
    name: string;
    description?: LocalizedString;
    invoke(context: DiscordContext, ...args: (string | CommandArgument[])[]): void;
    argumentsMap: CommandArgumentMetadata[];
}

export function invokeCommand(command: Command, providedArguments: CommandArgument[], discordContext: DiscordContext) {
    const args = resolveArguments(providedArguments, command.argumentsMap);
    command.invoke.apply(command, [discordContext, ...args]);
}