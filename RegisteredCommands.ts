import { Command } from "./Command";
import { HelpCommand } from "./commands/HelpCommand";
import { HiCommand } from "./commands/HiCommand";
import { RollCommand } from "./commands/RollCommand";
import { TwitchCommand } from "./twitch/TwitchCommand";
import { LanguageCommand } from "./commands/LanguageCommand";

export const registeredCommands: Command[] = [
    new HelpCommand(),
    new LanguageCommand(),
    new HiCommand(),
    new RollCommand(),
    new TwitchCommand()
];