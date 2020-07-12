import { Role, User } from "discord.js";

export function toMention(target: User | Role) {
    if (target instanceof User) {
        return `<@${target.id}>`;
    }

    if (target instanceof Role) {
        return `<@&${target.id}>`;
    }
}