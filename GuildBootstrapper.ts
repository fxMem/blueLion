import { GuildContext } from "./discord/GuildContext";
import { createLocalLogScope } from "./log/LogScopes";
import { PromiseSource, createPromiseSource } from "./common/PromiseSource";

export type RequiresGuildInitialization = {
    context?: GuildContext;
    initializeGuild: GuildInitializationCallback;
}

export type GuildInitializationCallback = (context: GuildContext) => Promise<void>;

export type GuildInitializer = RequiresGuildInitialization | GuildInitializationCallback;
let initializationResults: { [guildId: string]: { error?: any } } = {};

type InitializationData = {
    error?: string;
    callback: GuildInitializationCallback;
    promises: { [guildId: string]: PromiseSource<void> };
}
const subscribers: InitializationData[] = [];

function isRequiresGuildInitialization(argument: RequiresGuildInitialization | GuildInitializationCallback): argument is RequiresGuildInitialization {
    return !!(argument as any).initializeGuild;
}

export type GuildInitializerResult<T> = {
    // Returned promise is resolved when iniitializer had run for the guild
    ensure(context: GuildContext): Promise<T>,

    // Registers dependent initializer, which will run after this one
    chain<TNext extends GuildInitializer>(subscriber: TNext): GuildInitializerResult<TNext>;
}

export function registerForGuildInitialization<T extends GuildInitializer>(subscriber: T): GuildInitializerResult<T> {
    const callback = isRequiresGuildInitialization(subscriber)
        ? subscriber.initializeGuild.bind(subscriber)
        : subscriber;

    const data: InitializationData = {
        callback,
        promises: {}
    };

    subscribers.push(data);
    return {
        ensure: (context: GuildContext) => getInitializationDataForGuild(context, data).promise.then(() => { 
            if (isRequiresGuildInitialization(subscriber)) {
                subscriber.context = context; 
            }

            return subscriber;
        }),
        chain: <TNext extends GuildInitializer>(initializer: TNext) => {
            // Invoking the dependant initializer after this one we ensure that dependant is added to subscribers array after this one,
            // hence preservicng the rigth order
            return registerForGuildInitialization(initializer);
        }
    };
}

function getInitializationDataForGuild(context: GuildContext, subscriber: InitializationData) {
    const guildId = context.guild.id;
    return subscriber.promises[guildId] || (subscriber.promises[guildId] = createPromiseSource<void>());
}


export function runGuildInitializers(context: GuildContext): Promise<void> {
    const guildId = context.guild.id;
    const previousResults = initializationResults[guildId];
    if (previousResults) {
        return previousResults.error ? Promise.reject(previousResults.error) : Promise.resolve();
    }

    const log = createLocalLogScope('Bootstrapper');
    return new Promise((resolve, reject) => {
        let currentSubscriberIndex = 0;
        initializeNextInChain(getNextSubscriber());

        function initializeNextInChain(subscriber: InitializationData) {
            if (!subscriber) {
                // We've run out of initializers
                initializationFinished();
                return;
            }

            const promiseSourceForGuild = getInitializationDataForGuild(context, subscriber);
            if (promiseSourceForGuild.done) {
                // Initializer for this guild had already been run before. This shouldn't normally happen
                // as we use initializationResults to track such cases
                throw new Error(`Attemt to run initializer for guild ${guildId} which already was executed!`);
            }

            subscriber.callback(context).then(() => {
                promiseSourceForGuild.resolve();
                initializeNextInChain(getNextSubscriber());
            }).catch((e) => {
                promiseSourceForGuild.reject(e);
                initializationFinished();
            });


            function initializationFinished() {
                const error = promiseSourceForGuild?.error;
                initializationResults[guildId] = {};
                if (error) {
                    log.fatal(`Guild [${context.guild.name}] initialization failed! Error: ${error}`);
                    initializationResults[guildId].error = error;
                    reject(error);
                }
                else {
                    log.info(`Guild [${context.guild.name}] initialization completed!`);
                    resolve();
                }
            }
        }

        function getNextSubscriber() {
            return subscribers[currentSubscriberIndex++];
        }
    });
}
