import { Command } from "./Command";

const allCommands: Command[] = [];

export function getRegisteredCommands() {
    return allCommands;
}

export function registerCommands(commands: Command[]) {
    for (const command of commands) {
        allCommands.push(command);    
    }
}