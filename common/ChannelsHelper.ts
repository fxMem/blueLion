import { Guild, OverwriteResolvable, CategoryChannel, TextChannel, ChannelResolvable, Snowflake } from "discord.js";

function getHiddenChannelPermissions(guild: Guild): OverwriteResolvable[] {
    return [{
        id: guild.roles.everyone,
        deny: ['VIEW_CHANNEL']
    }, {
        id: guild.me.id,
        allow: ['VIEW_CHANNEL']
    }];
}

export function tryCreateCategory({ guild, name, hidden }: { guild: Guild, name: string, hidden?: boolean }): Promise<CategoryChannel> {
    const existingChannel = tryFindChannel(guild, name);
    if (existingChannel) {
        if (existingChannel.type !== 'category') {
            throw new Error(`Incorrect assertion: channel ${name} is supposed to be category channel!`);
        }


        return Promise.resolve(existingChannel as CategoryChannel);
    }

    return guild.channels.create(
        name, {
        type: 'category',
        permissionOverwrites: hidden ? getHiddenChannelPermissions(guild) : []
    });
}

export function tryCreateTextChannel({ guild, name, hidden, parent }: {
    guild: Guild,
    name: string,
    hidden?: boolean,
    parent?: Snowflake
}): Promise<TextChannel> {
    const existingChannel = tryFindChannel(guild, name);
    if (existingChannel && existingChannel.parentID === parent) {
        if (existingChannel.type !== 'text') {
            throw new Error(`Incorrect assertion: channel ${name} is supposed to be text channel!`);
        }


        return Promise.resolve(existingChannel as TextChannel);
    }

    return guild.channels.create(
        name, {
        type: 'text',
        parent,
        permissionOverwrites: hidden ? getHiddenChannelPermissions(guild) : []
    });
}

function tryFindChannel(guild: Guild, name: string) {
    return guild.channels.cache.find(c => c.name === name);
}