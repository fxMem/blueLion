import { registerForGuildInitialization } from "../bootstrapper/GuildBootstrapper";
import { GuildContext } from "../discord/GuildContext";
import config from '../config.json';
import { hasRole, isRoleExists, getRoleByName } from "./RolesHelper";
import { Guild, Role } from "discord.js";

export const botRoleName = `${config.name}Bot`;

registerForGuildInitialization((context: GuildContext) => {
    const { guild } = context;
    return tryCreateBotRole(guild).then(role => tryAddBotToItsRole(guild, role));
}, `Create ${botRoleName} role!`);

function tryCreateBotRole(guild: Guild): Promise<Role> {
    const serverBotRole = getRoleByName(guild.roles, botRoleName);
    if (!serverBotRole) {
        return guild.roles.create({
            data: {
                name: botRoleName
            }
        });
    }


    return Promise.resolve(serverBotRole)
}

function tryAddBotToItsRole(guild: Guild, role: Role): Promise<void> {
    if (!guild.me.roles.cache.get(role.id)) {
        return guild.me.roles.add(role).then(_ => { });
    }

    return Promise.resolve();
}
