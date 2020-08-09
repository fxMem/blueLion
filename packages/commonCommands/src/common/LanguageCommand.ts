import { buildLocalization, allLanguages, Language } from "dbb/lib/localization";
import { AggregateCommandBase, CommandBase, build, required } from "dbb/lib/commands";
import { bold } from "dbb/lib/common";

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

class GetLanguagesCommand extends CommandBase {
    name = 'get';
    description = localization.getDescription;

    argumentsMap = [];
    doInvoke() {
        return this.commandContext.channel.send(`${localization.availableLanguages(this.currentLanguage)} ${bold(allLanguages.join(', '))}`).then(_ => {});
    }
}

class SetLanguageCommand extends CommandBase {
    name = 'set';
    description = localization.setDescription;

    argumentsMap = build([required('language')]);
    doInvoke(language: string) {
        if (!allLanguages.find(l => l === language)) {
            throw new Error(localization.unknownLanguage(this.currentLanguage));
        }

        return this.languageManager.setCurrentLanguage(language as Language);
    }
}