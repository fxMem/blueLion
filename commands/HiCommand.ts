import { Command } from "../Command";
import { DiscordContext } from "../discord/DiscordContext";
import { localizedStringBuilder } from "../localization/LocalizedString";
import { Language } from "../localization/Language";

export class HiCommand implements Command {
    name = 'hi';
    description = localizedStringBuilder({
        ['ENG']: `It's a nice way to get to know each other!`,
        ['RU']: 'Эта команда - хороший способ узнать друг друга получше!.'
    });

    argumentsMap = [];
    invoke(context: DiscordContext) {
        context.reply('Hi there!');
    }
}