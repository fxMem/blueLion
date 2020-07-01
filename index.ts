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
    client.user.setActivity(config.status, { type: 'LISTENING' });
});

client.on('message', message => {

    const { guild } = message;
    const commandContext = commandParser.parse(message.content);
    if (!commandContext) {
        return;
    }

    log.info(`Message from Guild ${guild.name}: ${message.content}`);
    runGuildInitializers(message).then(_ => {
        try {
            commandManager.invoke(commandContext, message);
        } catch (error) {
            const errorMessage = (error as Error).message;
            message.reply(`Error! ${errorMessage}`);
        }
    }).catch(e => {
        log.info(`Initialization error! ${e}`);
    });
});

client.login(config.token);
