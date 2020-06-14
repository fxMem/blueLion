import { CommandArgumentMetadataBuilder, CommandArgumentMetadata } from "./CommandArgumentsMap";
import { DiscordContext } from "./discord/DiscordContext";


export interface Command {
    name: string;
    description?: string;
    invoke(context: DiscordContext, ...args: (string | string[])[]): void;
    argumentsMap: CommandArgumentMetadata[];
}