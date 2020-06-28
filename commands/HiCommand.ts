import { Command } from "../Command";
import { GuildContext } from "../discord/GuildContext";
import { buildLocalization } from "../localization/Localization";

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

export class HiCommand implements Command {
    name = 'hi';
    description = localization.description;

    argumentsMap = [];
    invoke(context: GuildContext) {
        context.reply(localization.hi());
    }
}