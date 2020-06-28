import { Command } from "../Command";
import { Language, setCurrentLanguage, allLanguages } from "../localization/Language";
import { build, required } from "../CommandArgumentsMap";
import { GuildContext } from "../discord/GuildContext";
import { bold } from "../common/DiscordFormattingHelpers";
import { AggregateCommandBase } from "../AggregateCommandBase";
import { buildLocalization } from "../localization/Localization";

const localization = buildLocalization({
    description: {
        ['ENG']: "Means to manage bot's localization.",
        ['RU']: 'Средства для настройки языка бота.'
    },
    getDescription: {
        ['ENG']: "Shows list of avalable languages.",
        ['RU']: 'Показывает список доступных для выбора языков.'
    },
    setDescription: {
        ['ENG']: "Allows to set bot's preffered language.",
        ['RU']: 'Позволяет выбрать предпочтительный язык бота.'
    },
    availableLanguages: {
        ['ENG']: "Available languages are:",
        ['RU']: 'Доступные языки:'
    },
    unknownLanguage: {
        ['ENG']: "Unknown language!",
        ['RU']: 'Неизвестный язык!'
    },
})

export class LanguageCommand extends AggregateCommandBase {
    name = 'lang';
    description = localization.description;

    subCommands = [
        new GetLanguagesCommand(),
        new SetLanguageCommand()
    ];
}

class GetLanguagesCommand implements Command {
    name = 'get';
    description = localization.getDescription;

    argumentsMap = [];
    invoke(context: GuildContext): void {
        context.channel.send(`${localization.availableLanguages()} ${bold(allLanguages.join(', '))}`);
    }
}

class SetLanguageCommand implements Command {
    name = 'set';
    description = localization.setDescription;

    argumentsMap = build([required('language')]);
    invoke(context: GuildContext, language: string): void {
        if (!allLanguages.find(l => l === language)) {
            throw new Error(localization.unknownLanguage());
        }

        setCurrentLanguage(language as Language);
    }
}