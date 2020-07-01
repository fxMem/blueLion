import { GuildContext } from "../discord/GuildContext";

export type RequiresGuildInitialization = {
    context?: GuildContext;
    initializeGuild: GuildInitializationCallback;
}

export type GuildInitializationCallback = (context: GuildContext) => Promise<void>;

export type GuildInitializer = RequiresGuildInitialization | GuildInitializationCallback;