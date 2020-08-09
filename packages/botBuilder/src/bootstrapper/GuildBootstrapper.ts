import { GuildContext } from "../discord/GuildContext";
import { createLocalLogScope } from "../log/LogScopes";
import { PromiseSource, createPromiseSource } from "../common/PromiseSource";
import { RequiresGuildInitialization, GuildInitializationFactory } from "./RequiresGuildInitialization";

let initializationResults: { [guildId: string]: { error?: any } } = {};

type InitializationData = {
    error?: string;
    factory: GuildInitializationFactory<RequiresGuildInitialization>;
    promises: { [guildId: string]: PromiseSource<RequiresGuildInitialization> };
}
const subscribers: InitializationData[] = [];

export type GuildSource<T> = {
    // Returned promise is resolved when iniitializer had run for the guild
    ensure(context: GuildContext): Promise<T>,
}

export type GuildInitializerResult<T extends RequiresGuildInitialization> = {
    // Registers dependent initializer, which will run after this one
    chain<TNext extends RequiresGuildInitialization>(factory: GuildInitializationFactory<TNext>): GuildInitializerResult<TNext>;
} & GuildSource<T>;

export function registerForGuildInitialization<T extends RequiresGuildInitialization>(factory: GuildInitializationFactory<T>): GuildInitializerResult<T> {
    const data: InitializationData = {
        factory,
        promises: {}
    };

    subscribers.push(data);
    return {
        ensure: (context: GuildContext) => getInitializationDataForGuild(context, data).promise as Promise<any>,
        chain: <T extends RequiresGuildInitialization>(factory: GuildInitializationFactory<T>) => {
            // Invoking the dependant initializer after this one we ensure that dependant is added to subscribers array after this one,
            // hence preservicng the rigth order
            return registerForGuildInitialization(factory);
        }
    };
}

export function runGuildInitializers(context: GuildContext): Promise<void> {
    const { id: guildId, name: guildName } = context.guild;

    const previousResults = initializationResults[guildId];
    if (previousResults) {
        return previousResults.error ? Promise.reject(previousResults.error) : Promise.resolve();
    }

    const log = createLocalLogScope(`[${guildName}] Bootstrapper`);
    return new Promise((resolve, reject) => {
        let currentSubscriberIndex = 0;
        initializeNextInChain(getNextSubscriber());

        function initializeNextInChain(subscriber: InitializationData) {
            if (!subscriber) {
                // We've run out of initializers
                initializationFinished();
                return;
            }

            const subscriberInstance = subscriber.factory();
            subscriberInstance.context = context;

            log.info(`Running initializer ${subscriberInstance.name}!`);
            const promiseSourceForGuild = getInitializationDataForGuild(context, subscriber);
            if (promiseSourceForGuild.done) {
                // Initializer for this guild had already been run before. This shouldn't normally happen
                // as we use initializationResults to track such cases
                throw new Error(`Attempt to run initializer ${subscriberInstance.name} which already was executed!`);
            }

            subscriberInstance.initializeGuild().then((result) => {
                promiseSourceForGuild.resolve(subscriberInstance);
                log.info(`Initializer ${subscriberInstance.name} finished successfully!`);

                initializeNextInChain(getNextSubscriber());
            }).catch((e) => {
                promiseSourceForGuild.reject(e);
                initializationFinished();
            });

            function initializationFinished() {
                const error = promiseSourceForGuild?.error;
                initializationResults[guildId] = {};
                if (error) {
                    log.fatal(`Initialization failed! Error: ${error}`);
                    initializationResults[guildId].error = error;
                    reject(error);
                }
                else {
                    log.info(`Initialization completed!`);
                    resolve();
                }
            }
        }

        function getNextSubscriber() {
            return subscribers[currentSubscriberIndex++];
        }
    });
}

function getInitializationDataForGuild(context: GuildContext, subscriber: InitializationData) {
    const guildId = context.guild.id;
    return subscriber.promises[guildId] || (subscriber.promises[guildId] = createPromiseSource<RequiresGuildInitialization>());
}
