import { Command } from "../commands/Command";
import { GuildContext } from "../discord/GuildContext";
import { buildLocalization } from "../localization/Localization";
import { CommandBase } from "../commands/CommandBase";

const localization = buildLocalization({
    description: {
        ['ENG']: `It's a nice way to get to know each other!`,
        ['RU']: 'Эта команда - хороший способ узнать друг друга получше!'
    },
    hi: {
        ['ENG']: `Hi there!`,
        ['RU']: 'Привет!'
    }
})

export class HiCommand extends CommandBase {
    name = 'hi';
    description = localization.description;

    argumentsMap = [];
    doInvoke() {
        this.context.reply(localization.hi(this.currentLanguage));
    }
}