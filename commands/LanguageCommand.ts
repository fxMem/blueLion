import { Command } from "../Command";
import { localizedStringBuilder } from "../localization/LocalizedString";
import { Language, setCurrentLanguage, allLanguages } from "../localization/Language";
import { build, required } from "../CommandArgumentsMap";
import { DiscordContext } from "../discord/DiscordContext";
import { bold } from "../common/DiscordFormattingHelpers";
import { AggregateCommandBase } from "../AggregateCommandBase";

export class LanguageCommand extends AggregateCommandBase {
    name = 'lang';
    description = localizedStringBuilder({
        ['ENG']: "Means to manage bot's localization.",
        ['RU']: 'Средства для настройки языка бота.'
    });

    subCommands = [
        new GetLanguagesCommand(),
        new SetLanguageCommand()
    ];
}

class GetLanguagesCommand implements Command {
    name = 'get';
    description = localizedStringBuilder({
        ['ENG']: "Shows list of avalable languages.",
        ['RU']: 'Показывает список доступных для выбора языков.'
    });

    argumentsMap = [];
    invoke(context: DiscordContext): void {
        context.channel.send(`Available languages are: ${bold(allLanguages.join(', '))}`);
    }
}

class SetLanguageCommand implements Command {
    name = 'set';
    description = localizedStringBuilder({
        ['ENG']: "Allows to set bot's preffered language.",
        ['RU']: 'Позволяет выбрать предпочтительный язык бота.'
    });

    argumentsMap = build([required('language')]);
    invoke(context: DiscordContext, language: string): void {
        if (!allLanguages.find(l => l === language)) {
            throw new Error('Unknown language!');
        }

        setCurrentLanguage(language as Language);
    }
}