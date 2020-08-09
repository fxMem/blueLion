import { Command, CommandManager, CommandParser, CommandFactory } from "../commands";
import { initializeLogger, Log, DefaultConsoleLogger, enterGlobalLogScope } from "../log";
import { Client } from "discord.js";
import { runGuildInitializers, registerInitializer, GuildInitializerResult, buildClassInitializer, registerInitializers } from ".";
import { Config } from "../Config";
import { Job, JobFactory, registerJobs } from "../jobs";
import { ChannelStorage, KeyValueStorage } from "../storage";
import { LanguageManager } from "../localization";
import { MessageHook, MessageHookFactory } from "../hooks/MessageHook";
import { GuildSource } from "./GuildBootstrapper";
import { MessageHookInvoker } from "../hooks/MessageHookInvoker";
import { prepareToChain } from "./RequiresGuildInitialization";
import { CommandMessageHook } from "../commands/CommandMessageHook";

export class Bootstrapper {
    private jobs: JobFactory[] = [];
    private commands: CommandFactory[] = [];
    private messageHooks: MessageHookFactory[] = [];
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

    addCommands(commands: CommandFactory[]): this {
        this.commands = [...this.commands, ...commands];
        return this;
    }

    addMessageHooks(hooks: MessageHookFactory[]): this {
        this.messageHooks = [...this.messageHooks, ...hooks];
        return this;
    }

    updateCommands(updater: (commands: CommandFactory[]) => CommandFactory[]): this {
        this.commands = updater(this.commands);
        return this;
    }

    run() {
        initializeLogger(new Log([new DefaultConsoleLogger()]));
        const log = enterGlobalLogScope('Root');

        this.client = new Client();
        const globalStorage = registerInitializer(() => new ChannelStorage('global', this.config));
        const languageManager = globalStorage.chain(() => new LanguageManager(globalStorage));
        const commandParser = new CommandParser(this.config);

        const commands = registerInitializers(this.commands);
        const commandManager = prepareToChain(commands).chain(c => new CommandManager(c, this.config, globalStorage, languageManager));
        const messageHookFactory = () => new CommandMessageHook(commandParser, commandManager);

        registerJobs(this.jobs, globalStorage);

        const messageHooks = registerInitializers([messageHookFactory, ...this.messageHooks]);
        const messageHookInvoker = prepareToChain(messageHooks).chain(h => new MessageHookInvoker(h));

        this.client.once('ready', () => {

            log.info('Bot is running!');

            this.client.user.setStatus('online');
            this.client.user.setActivity(this.config.status, { type: 'PLAYING' });

            Promise.all(
                this.client.guilds.cache.map(guild => runGuildInitializers({ guild }))
            ).then(_ => {
                this.client.on('message', message => {
                    messageHookInvoker.ensure(message).then(i => i.invoke(message));
                });
            }).catch(e => {
                log.error(`Initialization error! ${e}`);
            });;
        });

        this.client.login(this.config.token);
    }
}