import { GuildContext } from "../discord/GuildContext";
import { registerForGuildInitialization, GuildInitializerResult } from "./GuildBootstrapper";

export type RequiresGuildInitialization = {
    context: GuildContext;
    initializeGuild: () => Promise<void>;
}

export type GuildInitializationCallback<T> = (context: GuildContext) => Promise<T>;

export function registerClassInitializer<T extends RequiresGuildInitialization>(factory: () => T, name: string) {
    return registerForGuildInitialization(buildClassInitializer(factory), name);
}

export function registerClassInitializers<T extends RequiresGuildInitialization>(factoris: { factory: () => T, name: string }[]) {
    let results: GuildInitializerResult<T>[] = [];
    let previous: GuildInitializerResult<T> = null;
    for (const item of factoris) {
        previous = previous === null 
            ? registerClassInitializer(item.factory, item.name) 
            : previous.chain(buildClassInitializer(item.factory), item.name);

        results.push(previous);
    }

    return results;
}

export function buildClassInitializer<T extends RequiresGuildInitialization>(factory: () => T): GuildInitializationCallback<T> {
    return (context) => {
        const instance = factory();
        instance.context = context;
        return instance.initializeGuild().then(() => instance);
    };
}