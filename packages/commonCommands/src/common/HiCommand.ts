import { buildLocalization } from "dbb/lib/localization";
import { CommandBase } from "dbb/lib/commands";

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
        this.commandContext.reply(localization.hi(this.currentLanguage));
    }
}