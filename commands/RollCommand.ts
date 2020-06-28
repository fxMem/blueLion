import { Command } from "../Command";
import { GuildContext } from "../discord/GuildContext";
import { build, optional, mention } from "../CommandArgumentsMap";
import { getRandomIntFromInterval } from "../common/Random";
import { toMention } from "../common/MentionHelper";
import { range } from "../common/Range";
import { localizedStringBuilder } from "../localization/LocalizedString";
import { Language } from "../localization/Language";

export class RollCommand implements Command {
    name = 'roll';
    description = localizedStringBuilder({
        ['ENG']: "Lets you throw a dice. Virtually.",
        ['RU']: 'Позволяет вам бросить кость. Виртуальную, разумеется.'
    });

    argumentsMap = build([optional('amount'), mention().optional()]);
    invoke(context: GuildContext, amount: string) {
        const rollAmount = parseInt(amount) || 1;
        if (rollAmount > 100) {
            throw new Error('Cannot roll dice more than 100 times, overload!');
        }

        const userMentions = context.mentions.users.size > 0 ? Array.from(context.mentions.users.values()) : [context.author];
        const rolls = userMentions.map(user => ({ user, values: range(rollAmount).map(_ => getRandomIntFromInterval(1, 6)) }));
        context.channel.startTyping();
        setTimeout(() => {
            context.channel.stopTyping();
            const respose = rolls.map(roll => `${toMention(roll.user)}, ${this.formatRollValues(roll.values)}`);
            context.channel.send(['Dice throwing results:', ...respose]);
        }, 3000);
    }

    private formatRollValues(values: number[]) {
        if (values.length == 1) {
            return values[0];
        }

        return `${values.join('+')} = ${values.reduce((sum, next) => sum + next, 0)}`;
    }
}