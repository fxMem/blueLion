import { Command } from "./Command";
import { HelpCommand } from "./commands/HelpCommand";
import { HiCommand } from "./commands/HiCommand";
import { RollCommand } from "./commands/RollCommand";

export const registeredCommands: Command[] = [
    new HelpCommand(),
    new HiCommand(),
    new RollCommand()
];