import { Command, CommandManager, CommandParser } from "../commands";
import { initializeLogger, Log, DefaultConsoleLogger, enterGlobalLogScope } from "../log";
import { Client } from "discord.js";
import { runGuildInitializers, registerClassInitializer, GuildInitializerResult, buildClassInitializer } from ".";
import { Config } from "../Config";
import { Job, JobFactory, registerJobs } from "../jobs";
import { ChannelStorage, KeyValueStorage } from "../storage";
import { LanguageManager } from "../localization";
import { GuildSource } from "./GuildBootstrapper";

export class Bootstrapper {
    private jobs: JobFactory[] = [];
    private commands: Command[] = [];
    private config: Config;
    private client: Client;

    withConfig(config: Config): this {
        this.commands = [];
        this.config = config;
        return this;
    }

    addJobs(jobs: JobFactory[]): this {
        this.jobs = [...this.jobs, ...jobs];
        return this;
    }

    addCommands(commands: Command[]): this {
        this.commands = [...this.commands, ...commands];
        return this;
    }

    updateCommands(updater: (commands: Command[]) => Command[]): this {
        this.commands = updater(this.commands);
        return this;
    }

    run() {
        initializeLogger(new Log([new DefaultConsoleLogger()]));
        const log = enterGlobalLogScope('Root');

        this.client = new Client();
        const globalStorage = registerInitializer(() => new ChannelStorage('global', this.config));
        const languageManager = globalStorage.chain(() => new LanguageManager(globalStorage));
        const commandManager = new CommandManager(this.commands, this.config, globalStorage, languageManager);
        const commandParser = new CommandParser(this.config);

        registerJobs(this.jobs, globalStorage);

        this.client.once('ready', () => {

            log.info('Bot is running!');

            this.client.user.setStatus('online');
            this.client.user.setActivity(this.config.status, { type: 'LISTENING' });

            Promise.all(
                this.client.guilds.cache.map(guild => runGuildInitializers({ guild }))
            ).then(_ => {
                this.client.on('message', message => {

                    const { guild } = message;
                    const commandContext = commandParser.parse(message.content);
                    if (!commandContext) {
                        return;
                    }

                    log.info(`Message from Guild ${guild.name}: ${message.content}`);
                    try {
                        commandManager.invoke(commandContext, message);
                    } catch (error) {
                        const errorMessage = (error as Error).message;
                        message.reply(`Error! ${errorMessage}`);
                    }
                });
            }).catch(e => {
                log.error(`Initialization error! ${e}`);
            });;
        });


        this.client.login(this.config.token);
    }
}