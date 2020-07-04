import { GuildContext } from "../discord/GuildContext";
import { createLocalLogScope } from "../log/LogScopes";
import { PromiseSource, createPromiseSource } from "../common/PromiseSource";
import { GuildInitializationCallback, RequiresGuildInitialization } from "./RequiresGuildInitialization";

let initializationResults: { [guildId: string]: { error?: any } } = {};

type InitializationData = {
    name?: string;
    error?: string;
    factory: GuildInitializationCallback<any>;
    promises: { [guildId: string]: PromiseSource<any> };
}
const subscribers: InitializationData[] = [];

export type GuildInitializerResult<T> = {
    // Returned promise is resolved when iniitializer had run for the guild
    ensure(context: GuildContext): Promise<T>,

    // Registers dependent initializer, which will run after this one
    chain<T>(subscriber: GuildInitializationCallback<T>, name: string): GuildInitializerResult<T>;
}

export function registerForGuildInitialization<T>(factory: GuildInitializationCallback<T>, name: string): GuildInitializerResult<T> {
    const data: InitializationData = {
        name,
        factory,
        promises: {}
    };

    subscribers.push(data);
    return {
        ensure: (context: GuildContext) => getInitializationDataForGuild(context, data).promise,
        chain: <T>(initializer: GuildInitializationCallback<T>, name: string) => {
            // Invoking the dependant initializer after this one we ensure that dependant is added to subscribers array after this one,
            // hence preservicng the rigth order
            return registerForGuildInitialization(initializer, name);
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

            log.info(`Running initializer ${subscriber.name}!`);
            const promiseSourceForGuild = getInitializationDataForGuild(context, subscriber);
            if (promiseSourceForGuild.done) {
                // Initializer for this guild had already been run before. This shouldn't normally happen
                // as we use initializationResults to track such cases
                throw new Error(`Attempt to run initializer ${subscriber.name} which already was executed!`);
            }

            subscriber.factory(context).then((result) => {
                promiseSourceForGuild.resolve(result);
                log.info(`Initializer ${subscriber.name} finished successfully!`);

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
    return subscriber.promises[guildId] || (subscriber.promises[guildId] = createPromiseSource<void>());
}
