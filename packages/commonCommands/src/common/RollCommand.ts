import { buildLocalization } from "dbb/lib/localization";
import { CommandBase, build, optional, mention } from "dbb/lib/commands";
import { MessageContext } from "dbb/lib/discord";
import { range, getRandomIntFromInterval, toMention } from "dbb/lib/common";

const localization = buildLocalization({
    description: {
        ['ENG']: "Lets you throw a dice. Virtually. Select required amount and mention serrver memebers you want to compete with.",
        ['RU']: 'Позволяет вам бросить кость. Виртуальную, разумеется. Выберете количество бросков и упомяните тех, с кем хотите посоревноваться.'
    },
    tooManyRolls: {
        ['ENG']: "Cannot roll dice more than 100 times, overload!",
        ['RU']: 'Нельзя бросить больше, чем 100 раз!'
    },
    results: {
        ['ENG']: "Dice throwing results:",
        ['RU']: 'Результаты бросания кости:'
    }
});

export class RollCommand extends CommandBase {
    name = 'roll';
    description = localization.description;

    argumentsMap = build([optional('amount'), mention().optional()]);
    doInvoke(amount: string) {
        const rollAmount = parseInt(amount) || 1;
        if (rollAmount > 100) {
            throw new Error(localization.tooManyRolls(this.currentLanguage));
        }

        const userMentions = this.commandContext.mentions.users.size > 0 ? Array.from(this.commandContext.mentions.users.values()) : [this.commandContext.author];
        const rolls = userMentions.map(user => ({ user, values: range(rollAmount).map(_ => getRandomIntFromInterval(1, 6)) }));
        this.commandContext.channel.startTyping();
        setTimeout(() => {
            this.commandContext.channel.stopTyping();
            const respose = rolls.map(roll => `${toMention(roll.user)}, ${this.formatRollValues(roll.values)}`);
            this.commandContext.channel.send([localization.results(this.currentLanguage), ...respose]);
        }, 3000);
    }

    private formatRollValues(values: number[]) {
        if (values.length == 1) {
            return values[0];
        }

        return `${values.join('+')} = ${values.reduce((sum, next) => sum + next, 0)}`;
    }
}