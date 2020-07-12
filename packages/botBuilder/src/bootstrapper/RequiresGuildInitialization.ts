import { GuildContext } from "../discord/GuildContext";
import { registerForGuildInitialization } from "./GuildBootstrapper";

export type RequiresGuildInitialization = {
    context?: GuildContext;
    initializeGuild: (context: GuildContext) => Promise<void>;
}

export type GuildInitializationCallback<T> = (context: GuildContext) => Promise<T>;

export function registerClassInitializer<T extends RequiresGuildInitialization>(factory: () => T, name: string) {
    return registerForGuildInitialization(buildClassInitializer(factory), name);
}

export function buildClassInitializer<T extends RequiresGuildInitialization>(factory: () => T): GuildInitializationCallback<T> {
    return (context) => {
        const instance = factory();
        return instance.initializeGuild(context).then(() => instance);
    };
}