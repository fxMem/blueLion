import { GuildContext } from "../discord/GuildContext";
import { registerForGuildInitialization, GuildInitializerResult } from "./GuildBootstrapper";

export type RequiresGuildInitialization = {
    context: GuildContext;
    initializeGuild: () => Promise<void>;
} & Named;

export type Named = {
    name: string;
};

export type GuildInitializationCallback<T> = (context: GuildContext) => Promise<T>;

export type GuildInitializationFactory<T extends RequiresGuildInitialization> = () => T;

export function registerInitializer<T extends RequiresGuildInitialization>(factory: GuildInitializationFactory<T>) {
    return registerForGuildInitialization(factory);
}

export function registerInitializers<T extends RequiresGuildInitialization>(factoris: GuildInitializationFactory<T>[]) {
    let results: GuildInitializerResult<T>[] = [];
    let previous: GuildInitializerResult<T> = null;
    for (const factory of factoris) {
        previous = previous === null 
            ? registerInitializer(factory) 
            : previous.chain(factory);

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