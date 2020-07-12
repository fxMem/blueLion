import { buildLocalization } from "dbb/lib/localization";

export const localization = buildLocalization({
    description: {
        ['ENG']: 'Provides information about available commands.',
        ['RU']: 'Дает информацию о доступных командах.'
    },
    commandNotFound: {
        ['ENG']: `Cannot find the command you've just requested!`,
        ['RU']: 'Запрошенная вами команда не найдена!'
    },
    noDescription: {
        ['ENG']: `This command has no description`,
        ['RU']: 'У этой команды нет описания'
    },
    availableCommands: {
        ['ENG']: `Available commands:`,
        ['RU']: 'Доступные команды:'
    },
    complexCommand: {
        ['ENG']: `This is a complex command! Available sub commands to run:`,
        ['RU']: 'Это составная команда! Доступные дочерние команды:'
    },
    complexCommandHint: {
        ['ENG']: 'To get help for specific command, run `{0} help {1} <sub command name>`, for ex. `{0} help {1} {2}`',
        ['RU']: 'Чтобы получить подсказку по определенной дочерней команде, наберите `{0} help {1} <дочерняя команда>`, напр. `{0} help {1} {2}`'
    },
    usage: {
        ['ENG']: `Usage:`,
        ['RU']: 'Использование:'
    },
    mentions: {
        ['ENG']: `mentions`,
        ['RU']: 'упоминания'
    },
    required: {
        ['ENG']: `required`,
        ['RU']: 'обязательный'
    },
    optional: {
        ['ENG']: `optional`,
        ['RU']: 'необязательный'
    }
});