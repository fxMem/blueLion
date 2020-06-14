import { Command } from "../Command";
import { DiscordContext } from "../discord/DiscordContext";

export class HiCommand implements Command {
    name = 'hi';
    description = "It's a nice way to get to know each other!";
    argumentsMap = [];
    
    invoke(context: DiscordContext) {
        context.reply('Hi there!');
    }
}