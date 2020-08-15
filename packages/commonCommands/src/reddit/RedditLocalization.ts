import { buildLocalization } from "dbb/lib/localization";

export const redditLocalization = buildLocalization({
    redditCommandDescription: {
        ['ENG']: 'Set of reddit utilities.',
        ['RU']: 'Набор инструментов для работы с Reddit.'
    },
    extractMedia: {
        ['ENG']: 'Tries to extract media (image / video) from any reddit link posted to the channel post it directly instead of post link',
        ['RU']: 'Пытается извлечь картику или видео из ссылки на Reddit-сообщение, и заменить ссылку на данную картинку / видео'
    }
});