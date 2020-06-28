import { RoleManager, GuildMemberRoleManager, GuildMember } from "discord.js";

export function hasRole(user: GuildMember, roleName: string): boolean {
    return isRoleExists(user.roles, roleName);
}

export function isRoleExists(rolesManager: RoleManager | GuildMemberRoleManager, roleName: string): boolean {
    return !!getRoleByName(rolesManager, roleName);
}

export function getRoleByName(rolesManager: RoleManager | GuildMemberRoleManager, roleName: string) {
    return rolesManager.cache.find(r => r.name === roleName);
}