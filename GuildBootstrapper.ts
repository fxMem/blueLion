import { GuildContext } from "./discord/GuildContext";
import { createLocalLogScope, exitLogScope } from "./log/LogScopes";

export type RequiresGuildInitialization = {
    initializeGuild: GuildInitializationCallback;
}

export type GuildInitializationCallback = (context: GuildContext) => Promise<void>;

let initializationComplete = false;
let initializatoinError = null;
const subscribers: GuildInitializationCallback[] = [];

function isRequiresGuildInitialization(argument: RequiresGuildInitialization | GuildInitializationCallback): argument is RequiresGuildInitialization {
    return !!(argument as any).initializeGuild;
}

export function registerForGuildInitialization<T extends RequiresGuildInitialization | GuildInitializationCallback>(subscriber: T): T {
    if (isRequiresGuildInitialization(subscriber)) {
        subscribers.push(subscriber.initializeGuild.bind(subscriber));
    }
    else {
        subscribers.push(subscriber as any);
    }

    return subscriber;
}

export function runGuildInitializers(context: GuildContext): Promise<void> {
    if (initializationComplete) {
        return initializatoinError ? Promise.reject(initializatoinError) : Promise.resolve();
    }

    const log = createLocalLogScope('Bootstrapper');

    return new Promise((resolve, reject) => {
        let currentSubscriberIndex = 0;

        initializeNextInChain(getNextSubscriber());

        function initializeNextInChain(subscriber: GuildInitializationCallback) {
            if (!subscriber) {
                initializationFinished();
                return;
            }

            subscriber(context).then(() => {
                initializeNextInChain(getNextSubscriber());
            }).catch((e) => {
                initializatoinError = e;
                initializationFinished();
            });
        }

        function getNextSubscriber() {
            return subscribers[currentSubscriberIndex++];
        }

        function initializationFinished() {
            initializationComplete = true;
            if (initializatoinError) {
                log.fatal(`Guild [${context.guild.name}] initialization failed! Error: ${initializatoinError}`);
                reject(initializatoinError);
            }
            else {
                log.info(`Guild [${context.guild.name}] initialization completed!`);
                resolve();
            }
        }
    });
}
