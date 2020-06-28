import { Client } from 'discord.js'
import config from './config.json';
import { CommandManager } from './CommandManager';
import { registeredCommands } from './RegisteredCommands';
import { CommandParser } from './CommandParser';
import { runGuildInitializers } from './GuildBootstrapper';
import { initializeLogger, createLocalLogScope, enterGlobalLogScope } from './log/LogScopes';
import { DefaultConsoleLogger, Log } from './log/Logger';

initializeLogger(new Log([new DefaultConsoleLogger()]));
const log = enterGlobalLogScope('Root');

const client = new Client();
const commandManager = new CommandManager(registeredCommands);
const commandParser = new CommandParser(config);

client.once('ready', () => {

    log.info('Bot is running!');

    client.user.setStatus('online');
    client.user.setActivity("Universe", { type: 'PLAYING' });
});

client.on('message', message => {

    const { guild } = message;
    log.info(`Incoming message from Guild ${guild.name}`);
    runGuildInitializers(message).then(_ => {
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
    }).catch(e => {

        log.info(`Shutting down after initialization error`);
        client.destroy();
    });
});

client.login(config.token);
