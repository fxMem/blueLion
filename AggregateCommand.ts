import { Command } from "./Command";

export interface AggregateCommand extends Command {
    subCommands: (AggregateCommand | Command)[];
}

export function isAggregateCommand(command: Command): command is AggregateCommand {
    return !!(command as any).subCommands;
}