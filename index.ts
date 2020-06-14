import { Client } from 'discord.js'
import config from './config.json';
import { CommandManager } from './CommandManager';
import { registeredCommands } from './RegisteredCommands';
import { CommandParser } from './CommandParser';

const client = new Client();
const commandManager = new CommandManager(registeredCommands);
const commandParser = new CommandParser(config);

client.once('ready', () => {
    console.log('Bot is running!');

    client.user.setStatus('online');
    client.user.setActivity("Universe", { type: 'PLAYING' });
});

client.on('message', message => {
    const commandContext = commandParser.parse(message.content);
    if (!commandContext) {
        return;
    }

    try {
        commandManager.invoke(commandContext, message);
    } catch (error) {
        const errorMessage = (error as Error).message;
        message.reply(`Error! ${errorMessage}`);
    }
});

client.login(config.token);