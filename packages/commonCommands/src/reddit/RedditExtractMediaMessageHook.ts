import { MessageHook } from "dbb/lib/hooks/MessageHook";
import { GuildContext, MessageContext } from "dbb/lib/discord";
import { createLocalLogScope } from "dbb/lib/log";
import Axios from "axios";
import { parse } from "url";
import urljoin from "url-join";

const name = 'RedditExtractMediaMessageHook';
export class RedditExtractMediaMessageHook implements MessageHook {
    name = name;
    context: GuildContext;
    private log = createLocalLogScope(name);
    
    initializeGuild() {
        return Promise.resolve();
    }
    
    run(context: MessageContext) {
        tryGetRedditMediaUrl(context.content).then(mediaUrl => {
            if (mediaUrl) {
                context.suppressEmbeds().then(() => context.reply(mediaUrl));
            }
        }).catch(error => {
            this.log.error(error);
        });
    }
}

type RedditDataKind = 't1' | 't2' | 't3' | 't4' | 't5';
type RedditChildrenObject = {
    kind: RedditDataKind;
    data: {
        url: string;
        is_video: boolean;
        media?: {
            reddit_video: {
                fallback_url: string;
                is_gif: boolean;
            }
        }
    }
}

type RedditInfo = {
    data: {
        children: RedditChildrenObject[];
    }
}

function tryGetRedditMediaUrl(postLink: string): Promise<string> {
    const url = parse(postLink);
    if (!url?.host?.endsWith('reddit.com')) {
        return Promise.resolve(null);
    }

    const infoUrl = urljoin(url.protocol, url.host, url.pathname, '/info.json');
    return Axios.get(infoUrl).then(r => {
        const info = r.data as RedditInfo[];
        const firstChild = info[0]?.data?.children[0];
        const firstMedia = firstChild?.data;
        if (firstMedia === null || firstChild.kind !== 't3')
            return null;
            
        if (firstMedia.is_video) {
            return firstMedia.media.reddit_video.fallback_url;
        }
        else {
            return firstMedia.url;
        }
    });
}
