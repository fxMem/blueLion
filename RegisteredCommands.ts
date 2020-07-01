import { Command } from "./commands/Command";
import { HelpCommand } from "./commonCommands/HelpCommand";
import { HiCommand } from "./commonCommands/HiCommand";
import { RollCommand } from "./commonCommands/RollCommand";
import { TwitchCommand } from "./twitch/TwitchCommand";
import { LanguageCommand } from "./commonCommands/LanguageCommand";

export const registeredCommands: Command[] = [
    new HelpCommand(),
    new LanguageCommand(),
    new HiCommand(),
    new RollCommand(),
    new TwitchCommand()
];