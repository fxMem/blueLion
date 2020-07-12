import { CommandBase, required, build, mention } from "dbb/lib/commands";
import { twitchLocalization } from "./TwitchLocalization";

const defaultNotifyToChannelKey = 'LiveNotification:notifyTo';
export class LiveNotification extends CommandBase {
    name = 'notify';
    description = twitchLocalization.notifyCommandDescription;

    argumentsMap = build([required('twitchChannel'), mention().required()]);
    doInvoke(twitchChannelName: string) {
        let channelToNotify = this.context.mentions.channels.size !== 0 
            ? Promise.resolve(this.context.mentions.channels.first().id) 
            : this.storage.get<string>(defaultNotifyToChannelKey);

        return channelToNotify.then(channelId => {
            
        });
    }
}