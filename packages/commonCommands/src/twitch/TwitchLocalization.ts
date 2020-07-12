import { buildLocalization } from "dbb/lib/localization";

export const twitchLocalization = buildLocalization({
    twitchCommandDescription: {
        ['ENG']: 'Set of twitch utilities.',
        ['RU']: 'Набор инструментов для работы с Twitch.'
    },
    notifyCommandDescription: {
        ['ENG']: 'Adds watcher and writes a notification message to mentioned channel when twitch channel goes live.',
        ['RU']: 'Проверяет указанный Twitch-аккаунт и пишет уведомление в упомянутый канал когда стример начинает стрим.'
    }
});